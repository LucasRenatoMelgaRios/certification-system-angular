import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { CertificateService } from '../services/certificate.service';

import { CertTemplate, Certificado, DropZone, PageState, PageStates, CertSize, AVAILABLE_FONTS, CERTIFICATE_LAYOUTS 
} from '../models/certificate.model';

@Component({
  selector: 'app-certification-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CertificateService],
  templateUrl: './certification-module.component.html',
  styleUrls: ['./certification-module.component.css'],
})
export class CertificationModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('certificateRef') certificateRef!: ElementRef;
  @ViewChild('certificateContainerRef') certificateContainerRef!: ElementRef;
  @ViewChild('fieldsListContainer') fieldsListContainer!: ElementRef;

  currentPageId: 'front' | 'back' = 'front';
  currentTemplateHasSignature = false;
  zoomLevel = 1;
  certTemplates: CertTemplate[] = [];
  selectedCert: CertTemplate | null = null;
  certSize: CertSize = { width: 1123, height: 794 };
  draggingZone: DropZone | null = null;
  dragStartX = 0;
  dragStartY = 0;
  dragOffsetX = 0;
  dragOffsetY = 0;
  certificateType: 'curso' | 'diplomado' | 'constancia' = 'curso';

  pageStates: PageStates = {
    front: { dropZones: [], droppedItems: {}, selectedElement: null },
    back: { dropZones: [], droppedItems: {}, selectedElement: null }
  };
  certificados: Certificado[] = [];
  availableFonts = AVAILABLE_FONTS;
  availableFields: { key: string; label: string; }[] = [
    { key: 'nombre', label: 'Nombre completo' },
    { key: 'apellido', label: 'Apellidos' },
    { key: 'curso', label: 'Nombre del curso' },
    { key: 'descripcion', label: 'Descripción y fechas' },
    { key: 'descripcion2', label: 'Fecha y horas lectivas' },
    { key: 'ihrlectiva', label: 'Horas lectivas' },
    { key: 'emisionFormat', label: 'Fecha de emisión' },
    { key: 'fechaFormat', label: 'Fecha de expedición' },
    { key: 'dni', label: 'DNI' },
    { key: 'codigo', label: 'Código del curso' },
    { key: 'iIdCertificado', label: 'Código de certificado' },
    { key: 'nota', label: 'Calificación' }
  ];

  private draggedField: any = null;

  globalConfig: any = {};

  constructor(
    private certificateService: CertificateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadStudentData();
    this.determineCertificateType();
    this.initializePageStates();
    this.loadGlobalConfig();

  }

  ngAfterViewInit(): void {
    this.updateCertificateSize();
  }

  private determineCertificateType(): void {
    const student = this.certificados[0];
    if (student?.curso?.toLowerCase().includes('diplomado')) {
      this.certificateType = 'diplomado';
    } else if (student?.curso?.toLowerCase().includes('constancia')) {
      this.certificateType = 'constancia';
    } else {
      this.certificateType = 'curso';
    }
  }

// En certification-module.component.ts
private loadGlobalConfig(): void {
  this.certificateService.getGlobalConfig().subscribe({
    next: (fullConfig) => {
      this.globalConfig = fullConfig;
      this.initializePageStates();
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.globalConfig = {};
      this.initializePageStates();
    }
  });
}
  
// En certification-module.component.ts
private initializePageStates(): void {
  const savedConfig = this.globalConfig[this.certificateType] || {};

  this.pageStates = {
    front: {
      dropZones: this.mergeZones(savedConfig.front || []),
      droppedItems: {},
      selectedElement: null
    },
    back: {
      dropZones: this.mergeZones(savedConfig.back || []),
      droppedItems: {},
      selectedElement: null
    }
  };
}
  
private mergeZones(savedZones: any[]): DropZone[] {
  return savedZones.map(zone => ({
    id: zone.id, // Mantener el mismo ID
    fieldKey: zone.fieldKey,
    position: zone.position || { x: 0, y: 0 }, // Posición crítica
    pageId: zone.pageId || this.currentPageId,
    type: zone.type || 'text',
    hidden: zone.hidden ?? false,
    textColor: zone.textColor || 'black',
    fontFamily: zone.fontFamily || 'Arial',
    fontSize: zone.fontSize || 52,
    isItalic: zone.isItalic || false,
    customPrefix: zone.customPrefix || '',
    customSuffix: zone.customSuffix || '',
    lineBreaks: zone.lineBreaks || 0
  }));
}
  
  trackByZoneId(index: number, zone: DropZone): number {
    return zone.id; // Usar el ID único para tracking
  }


  onDrop(event: DragEvent): void {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('drag-over');
  
    if (!this.draggedField) return;
  
    const currentPage = this.pageStates[this.currentPageId] || {
      dropZones: [],
      droppedItems: {},
      selectedElement: null
    };
  
    const existingZone = currentPage.dropZones.find(
      z => z.fieldKey === this.draggedField.key && z.pageId === this.currentPageId
    );
  
    if (existingZone) {
      this.showNotification('Este campo ya está en uso', 'error');
      return;
    }
  
    const rect = container.getBoundingClientRect();
    const scale = this.zoomLevel;
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
  
    const newZone: DropZone = {
      id: this.generateUniqueId(), 
      fieldKey: this.draggedField.key,
      position: { x, y },
      pageId: this.currentPageId,
      type: this.draggedField.key === 'descripcion' ? 'dates' : 'text',
      textColor: 'black',
      fontFamily: 'Arial',
      fontSize: 52,
      isItalic: false,
      lineBreaks: 0 // Inicializado en 0
    };
  
    currentPage.dropZones.push(newZone);
    this.cdr.detectChanges();
  }

  private generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  addLineBreak(zoneId: number): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone) {
      const maxBreaks = this.getMaxLineBreaks(zone);
      const currentBreaks = zone.lineBreaks || 0;
      
      if (currentBreaks < maxBreaks) {
        zone.lineBreaks = currentBreaks + 1;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    }
  }
  
  removeLineBreak(zoneId: number): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone && (zone.lineBreaks || 0) > 0) {
      zone.lineBreaks--;
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }
  }

  onDragStart(event: DragEvent, field: any): void {
    this.draggedField = field;
    event.dataTransfer?.setData('text/plain', field.key);
  }

  onDragEnd(event: DragEvent): void {
    this.draggedField = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('drag-over');
  }

  onFontChange(zoneId: number, font: string): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone) {
      zone.fontFamily = font;
      this.cdr.markForCheck();
    }
  }


  saveConfiguration(): void {
    this.certificateService.getGlobalConfig().subscribe(existingConfig => {
      // Combinar configuraciones
      const configToSave = {
        ...existingConfig,
        [this.certificateType]: {
          front: this.getSanitizedConfig('front'),
          back: this.getSanitizedConfig('back')
        }
      };
  
      // Guardar configuración completa
      this.certificateService.saveGlobalConfig(configToSave).subscribe({
        next: () => this.showNotification('Configuración guardada', 'success'),
        error: (err) => this.showNotification('Error al guardar', 'error')
      });
    });
  }
  
  private getSanitizedConfig(pageId: 'front' | 'back'): any[] {
    return this.pageStates[pageId].dropZones.map(zone => ({
      id: zone.id, // Necesario para identificar elementos únicos
      pageId: zone.pageId, // Asegura la página correcta
      fieldKey: zone.fieldKey,
      position: zone.position, // {x, y} son críticos
      type: zone.type,
      hidden: zone.hidden ?? false,
      textColor: zone.textColor,
      fontFamily: zone.fontFamily,
      isItalic: zone.isItalic,
      fontSize: zone.fontSize,
      lineBreaks: zone.lineBreaks, // Campo añadido
      customPrefix: zone.customPrefix,
      customSuffix: zone.customSuffix
    }));
  }
  private sanitizeZone(zone: DropZone): any {
    return {
      fieldKey: zone.fieldKey,
      position: zone.position,
      type: zone.type,
      hidden: zone.hidden,
      textColor: zone.textColor,
      fontFamily: zone.fontFamily,
      isItalic: zone.isItalic,
      fontSize: zone.fontSize,
      customPrefix: zone.customPrefix,
      customSuffix: zone.customSuffix
    };
  }

private showNotification(message: string, type: 'success' | 'error'): void {
    // Implementar tu sistema de notificaciones preferido
    alert(`${type.toUpperCase()}: ${message}`);
}


get currentPageState(): PageState {
  return this.pageStates[this.currentPageId] || {
    dropZones: [],
    droppedItems: {},
    selectedElement: null
  };
}

  get frontTemplates(): CertTemplate[] {
    return this.certTemplates
      .filter(t => t.pageType === 'front')
      .sort((a, b) => {
        if (a.hasSignature === b.hasSignature) return 0;
        return a.hasSignature ? 1 : -1;
      });
  }

  toggleTextColor(zoneId: number): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone) {
      zone.textColor = zone.textColor === 'black' ? 'white' : 'black';
      this.cdr.detectChanges();
    }
  }

  changeFontFamily(zoneId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone) {
      zone.fontFamily = select.value;
      this.cdr.detectChanges();
    }
  }

  onContentChange(zoneId: number): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone) {
      // Forzar actualización de la vista
      this.cdr.detectChanges(); // ❌ cdRef -> ✅ cdr
    }
  }

toggleSignature(hasSignature: boolean): void {
  if (this.currentTemplateHasSignature !== hasSignature) {
    this.currentTemplateHasSignature = hasSignature;
    const targetCode = hasSignature ? 'CNF' : 'SNF';
    
    // Buscar plantilla con el código correspondiente
    const template = this.certTemplates.find(t => 
      t.pageType === 'front' && t.codigo === targetCode
    );
    
    if (template) {
      this.selectTemplate(template);
    } else {
      console.warn(`No se encontró plantilla frontal con código ${targetCode}`);
      // Seleccionar cualquier plantilla frontal como fallback
      const fallbackTemplate = this.certTemplates.find(t => t.pageType === 'front');
      if (fallbackTemplate) {
        this.selectTemplate(fallbackTemplate);
      }
    }
  }
}

getTemplateForPage(pageId: 'front' | 'back'): CertTemplate | null {
  if (pageId === 'front') {
    // Buscar plantilla frontal con el código correspondiente al estado de firma actual
    const targetCode = this.currentTemplateHasSignature ? 'CNF' : 'SNF';
    return this.certTemplates.find(t => 
      t.pageType === 'front' && t.codigo === targetCode
    ) || null;
  }
  
  // Para plantilla trasera, buscar cualquier plantilla con código REV
  return this.certTemplates.find(t => 
    t.pageType === 'back' && t.codigo === 'REV'
  ) || null;
}

private createFallbackTemplates(): CertTemplate[] {
  return [
    {
      iIdPlantilla: 1,
      iIdTPlantilla: 1,
      iIdCurso: 0,
      codigo: 'SNF',
      descripcion: 'Frontal Sin Firma',
      cloudUrl: 'assets/fallback-front.jpg',
      cloudKey: '',
      fechaFormat: new Date().toISOString(),
      id: 1,
      name: 'Frontal Sin Firma',
      imageUrl: 'assets/fallback-front.jpg',
      pageType: 'front',
      hasSignature: false,
      dimensions: { width: 1123, height: 794 }
    },
    {
      iIdPlantilla: 2,
      iIdTPlantilla: 2,
      iIdCurso: 0,
      codigo: 'CNF',
      descripcion: 'Frontal Con Firma',
      cloudUrl: 'assets/fallback-front-signed.jpg',
      cloudKey: '',
      fechaFormat: new Date().toISOString(),
      id: 2,
      name: 'Frontal Con Firma',
      imageUrl: 'assets/fallback-front-signed.jpg',
      pageType: 'front',
      hasSignature: true,
      dimensions: { width: 1123, height: 794 }
    },
    {
      iIdPlantilla: 3,
      iIdTPlantilla: 3,
      iIdCurso: 0,
      codigo: 'REV',
      descripcion: 'Reverso',
      cloudUrl: 'assets/fallback-back.jpg',
      cloudKey: '',
      fechaFormat: new Date().toISOString(),
      id: 3,
      name: 'Reverso',
      imageUrl: 'assets/fallback-back.jpg',
      pageType: 'back',
      hasSignature: false,
      dimensions: { width: 1123, height: 794 }
    }
  ];
}
  getCurrentTemplate(): CertTemplate | null {
    return this.getTemplateForPage(this.currentPageId);
  }

  private loadTemplates(): void {
    this.certificateService.getTemplates().subscribe({
      next: (templates) => {
        this.certTemplates = templates;
        
        if (templates.length > 0) {
          // Seleccionar plantilla frontal sin firma por defecto (SNF)
          const defaultTemplate = templates.find(t => 
            t.pageType === 'front' && t.codigo === 'SNF'
          ) || templates.find(t => t.pageType === 'front');
          
          if (defaultTemplate) {
            this.selectedCert = defaultTemplate;
            this.currentTemplateHasSignature = defaultTemplate.codigo === 'CNF';
            this.preloadTemplateImage(defaultTemplate.cloudUrl);
          }
        }
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        // Fallback con datos locales
        this.certTemplates = this.createFallbackTemplates();
        const fallbackTemplate = this.certTemplates.find(t => 
          t.pageType === 'front' && t.codigo === 'SNF'
        );
        
        if (fallbackTemplate) {
          this.selectedCert = fallbackTemplate;
          this.currentTemplateHasSignature = false;
          this.preloadTemplateImage(fallbackTemplate.cloudUrl);
        }
      }
    });
  }

  private loadStudentData(): void {
    this.certificateService.getStudentData().subscribe({
      next: (students) => {
        this.certificados = students;
        // Aplicar configuración específica del estudiante si es necesaria
        if (students[0]?.configTemplate) {
          const studentConfig = JSON.parse(students[0].configTemplate);
          this.applyStudentSpecificConfig(studentConfig);
        }
      },
      error: (err) => {
        console.error('Error loading student data:', err);
        this.certificados = [{
          iIdCertificado: 56513,
        iIdDetalle: 79029,
         iIdCurso: 0, // <-- Campo añadido
         codigo: "COD0065-228710",
         descripcion: null,
          dateInit: "2024-12-05T17:00:00.000Z",
          dateFin: "2025-01-06T17:00:00.000Z",
          dateEmision: "2025-01-07T17:00:00.000Z",
          dateExpidicion: "2025-02-28T17:00:00.000Z",
          metodo: "BCP CODEPER - YAPE",
          precio: 85,
          ihrlectiva: 120,
          curso: "COD0065 - QUECHUA CENTRAL - NIVEL BÁSICO",
          asesora: "Equipo 001 CENAPRO Cesy Alcedo",
          iIdPersona: 31,
          estado: "Enviado a WhatsApp",
          initFormat: "05/12/2024",
          finFormat: "06/01/2025",
          emisionFormat: "07/01/2025",
          expidicionFormat: "28/02/2025",
          pdfUrl: null,
          iIdMultiTable: 21,
          color: "#fff",
          background: "#04B431",
          iIdMultiTableCliente: 9,
          iIdCliente: 192697,
          nombre: "Jhonatan Alcides",
          apellido: "Solís Vilcarima",
          dni: "70095771",
          email: "jhonatansv40@gmail.com",
          telefono: "929432917",
          ciudad: "Ica",
          usuario: "70095771",
          clave: "solis70095771",
          isEnvio: 0,
          iIdIdentidad: 1,
          identidadCodigo: "DNI",
          identidad: "LIBRETA ELECTORAL",
          fechaFormat: "28/02/2025"
        }];
      }
    });
  }

  private applyStudentSpecificConfig(config: any): void {
    // Lógica para aplicar configuraciones específicas si es necesario
  }

  private loadTemplateImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  }


  private async preloadTemplateImage(imageUrl: string): Promise<void> {
    return new Promise((resolve) => {
      if (!imageUrl) {
        this.certSize = { width: 1123, height: 794 };
        this.cdr.detectChanges();
        return resolve();
      }
      
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        this.certSize = {
          width: img.naturalWidth || 1123,
          height: img.naturalHeight || 794
        };
        
        // Actualizar dimensiones en la plantilla seleccionada
        if (this.selectedCert) {
          this.selectedCert.dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight
          };
        }
        
        this.cdr.detectChanges();
        resolve();
      };
      
      img.onerror = () => {
        console.warn('Error al cargar la imagen de plantilla, usando dimensiones por defecto');
        this.certSize = { width: 1123, height: 794 };
        this.cdr.detectChanges();
        resolve();
      };
      
      img.src = imageUrl;
    });
  }

  private async updateCertificateSize(): Promise<void> {
    if (this.selectedCert?.imageUrl) {
      await this.preloadTemplateImage(this.selectedCert.imageUrl);
    }
  }

  selectTemplate(cert: CertTemplate): void {
    this.selectedCert = cert;
    
    // Actualizar estado de firma solo si es plantilla frontal
    if (cert.pageType === 'front') {
      this.currentTemplateHasSignature = cert.codigo === 'CNF';
    }
    
    // Precargar imagen usando cloudUrl
    this.preloadTemplateImage(cert.cloudUrl);
    
    // Actualizar UI
    this.cdr.detectChanges();
  }

  showFrontTemplate(): void {
    this.currentPageId = 'front';
    const frontTemplate = this.getTemplateForPage('front');
    if (frontTemplate) {
      this.selectTemplate(frontTemplate);
    }
  }

  showBackTemplate(): void {
    this.currentPageId = 'back';
    const backTemplate = this.getTemplateForPage('back');
    if (backTemplate) {
      this.selectTemplate(backTemplate);
    }
  }

  getMaxLineBreaks(zone: DropZone): number {
    const student = this.certificados[0];
    if (!student) return 0;
  
    const originalValue = this.getOriginalValue(zone.fieldKey, student);
    const parts = [
      zone.customPrefix?.trim(),
      originalValue?.trim(),
      zone.customSuffix?.trim()
    ].filter(part => part && part.length > 0);
  
    const content = parts.join(' ');
    const words = content.split(/\s+/).filter(word => word.length > 0);
    
    return Math.max(0, words.length - 1);
  }

  getStudentDataForZone(fieldKey: string): string {
    const student = this.certificados[0];
    if (!student) return '';
    
    const zone = this.currentPageState.dropZones.find(z => z.fieldKey === fieldKey);
    const originalValue = this.getOriginalValue(fieldKey, student);
    
    // Construir el contenido base
    const parts = [
      zone?.customPrefix?.trim(),
      originalValue?.trim(),
      zone?.customSuffix?.trim()
    ].filter(part => part && part.length > 0);
  
    const content = parts.join(' ');
    const words = content.split(/\s+/).filter(word => word.length > 0);
    
    // Calcular saltos máximos posibles
    const maxPossibleBreaks = Math.max(0, words.length - 1);
    const desiredBreaks = Math.min(zone?.lineBreaks || 0, maxPossibleBreaks);
    
    // Dividir en líneas
    const lines: string[] = [];
    if (words.length > 0) {
      const wordsPerLine = Math.ceil(words.length / (desiredBreaks + 1));
      for (let i = 0; i <= desiredBreaks; i++) {
        const start = i * wordsPerLine;
        const end = start + wordsPerLine;
        lines.push(words.slice(start, end).join(' '));
      }
    }
    
    return lines.join('\n');
  }
// En CertificationModuleComponent
toggleItalic(zoneId: number): void {
  const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
  if (zone) {
    zone.isItalic = !zone.isItalic;
    this.cdr.detectChanges(); // ❌ cdRef -> ✅ cdr
  }
}

private getOriginalValue(fieldKey: string, student: Certificado): string {
    switch(fieldKey) {
        case 'descripcion':
            if (this.certificateType === 'constancia') {
                return student.nombre || '';
            }
            return `${this.fechaAFormatoLegible(student.initFormat)} al ${this.fechaAFormatoLegible(student.finFormat)}${student.descripcion ? '\n' + student.descripcion : ''}`;
        case 'descripcion2':
            return `Fecha: ${this.fechaAFormatoLegible(student.emisionFormat)}\nHoras lectivas: ${student.ihrlectiva}`;
        case 'ihrlectiva':
            return `${student.ihrlectiva} horas lectivas`;
        case 'nombreCompleto':
            return `${student.nombre} ${student.apellido}`;
        case 'codigoCurso':
            return student.codigo.split('-')[0];
        case 'codigoCertificado':
            return student.iIdCertificado.toString();
            case 'nota':
              if (student.nota !== undefined && student.nota !== null) {
                const numericValue = Number(student.nota);
                // Formatear a dos decimales
                const formatted = numericValue.toFixed(2);
                // Obtener parte entera y convertir a texto
                const integerPart = Math.floor(numericValue);
                const textValue = this.numberToSpanish(integerPart);
                return `${formatted} (${textValue} y 00/20)`;
              }
              return 'Aprobado';
          case 'emisionFormat':
            return this.fechaAFormatoLegible(student.emisionFormat);
        case 'fechaFormat':
            return this.fechaAFormatoLegible(student.fechaFormat);
        default:
            return student[fieldKey as keyof Certificado]?.toString() || '';
    }
}

private numberToSpanish(num: number): string {
  const unidades = [
    'Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 
    'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez',
    'Once', 'Doce', 'Trece', 'Catorce', 'Quince',
    'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve', 'Veinte'
  ];
  
  if (num >= 0 && num <= 20) return unidades[num];
  return num.toString(); // Fallback para valores fuera de rango
}

// certification-module.component.ts

hasTemplateType(code: 'CNF' | 'SNF' | 'REV'): boolean {
  return this.certTemplates.some(t => t.codigo === code);
}
  private fechaAFormatoLegible(fechaStr: string): string {
    try {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
        console.warn('Formato de fecha no válido:', fechaStr);
        return fechaStr;
      }

      const [dia, mes, año] = fechaStr.split("/").map(Number);
      
      if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
        console.warn('Fecha inválida:', fechaStr);
        return fechaStr;
      }

      const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];

      return `${dia} de ${meses[mes - 1]} de ${año}`;
    } catch (error) {
      console.error('Error al convertir fecha:', error);
      return fechaStr;
    }
  }


  getFieldLabel(fieldKey: string): string {
    const labels: {[key: string]: string} = {
      'nombre': 'Nombre completo',
      'apellido': 'Apellidos',
      'curso': 'Nombre del curso',
      'descripcion': this.certificateType === 'constancia' ? 'Nombre' : 'Descripción y fechas',
      'descripcion2': 'Fecha y horas lectivas',
      'ihrlectiva': 'Horas lectivas',
      'emisionFormat': 'Fecha de emisión',
      'fechaFormat': 'Fecha de expedición',
      'dni': 'DNI',
      'codigo': 'Código del curso',
      'iIdCertificado': 'Código de certificado',
      'nota': 'Calificación'
    };
    return labels[fieldKey] || fieldKey;
  }


  startDraggingZone(event: MouseEvent, zone: DropZone): void {
    event.preventDefault();
    this.draggingZone = zone;
    const rect = this.certificateRef.nativeElement.getBoundingClientRect();
    const scale = this.zoomLevel;
    
    // Calcular offset relativo al elemento
    this.dragOffsetX = (event.clientX - rect.left) / scale - zone.position.x;
    this.dragOffsetY = (event.clientY - rect.top) / scale - zone.position.y;
    
    document.body.style.cursor = 'grabbing';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.draggingZone) {
      const rect = this.certificateRef.nativeElement.getBoundingClientRect();
      const scale = this.zoomLevel;
      
      // Calculate position considering zoom level
      const newX = (event.clientX - rect.left) / scale - this.dragOffsetX;
      const newY = (event.clientY - rect.top) / scale - this.dragOffsetY;
      
      this.handleDropZoneMove(
        this.draggingZone.id,
        Math.max(0, newX),
        Math.max(0, newY)
      )
      
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.draggingZone) {
      this.draggingZone = null;
      document.body.style.cursor = 'default';
    }
    

  }
  

  handleDropZoneMove(id: number, x: number, y: number): void {
    this.currentPageState.dropZones = this.currentPageState.dropZones.map(zone => {
      if (zone.id === id) {
        // Crear un nuevo objeto para evitar mutación
        return { ...zone, position: { x, y } };
      }
      return zone;
    });
    this.cdr.detectChanges();
  }

  async handleExportPDF(): Promise<void> {
    if (!this.certificateRef?.nativeElement) return;

    try {
      // Store current state
      const currentState = {
        pageId: this.currentPageId,
        hasSignature: this.currentTemplateHasSignature,
        selectedCert: this.selectedCert
      };

      // Get templates for both pages
      const frontTemplate = this.certTemplates.find(t => 
        t.pageType === 'front' && t.hasSignature === this.currentTemplateHasSignature
      );
      const backTemplate = this.certTemplates.find(t => t.pageType === 'back');

      if (!frontTemplate) throw new Error('Front template not found');

      // Load front page image and get dimensions
      const frontImage = await this.loadTemplateImage(frontTemplate.imageUrl);
      const frontDimensions = {
        width: frontImage.naturalWidth,
        height: frontImage.naturalHeight
      };

      // Initialize PDF with front page dimensions
      const doc = new jsPDF({
        orientation: frontDimensions.width > frontDimensions.height ? "landscape" : "portrait",
        unit: "px",
        format: [frontDimensions.width, frontDimensions.height],
        compress: true
      });

      // Render front page
      this.currentPageId = 'front';
      this.selectedCert = frontTemplate;
      await this.renderPageToPDF(doc, 'front', frontDimensions);

      // If back template exists, render it with its own dimensions
      if (backTemplate) {
        const backImage = await this.loadTemplateImage(backTemplate.imageUrl);
        const backDimensions = {
          width: backImage.naturalWidth,
          height: backImage.naturalHeight
        };

        // Add new page with back template dimensions
        doc.addPage([backDimensions.width, backDimensions.height]);
        
        this.currentPageId = 'back';
        this.selectedCert = backTemplate;
        await this.renderPageToPDF(doc, 'back', backDimensions);
      }

      // Restore original state
      this.currentPageId = currentState.pageId;
      this.currentTemplateHasSignature = currentState.hasSignature;
      this.selectedCert = currentState.selectedCert;

      const student = this.certificados[0];
      const filename = `${
        this.certificateType === 'diplomado' ? 'Diploma' : 'Certificado'
      }_${student.nombre}_${student.apellido}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  }


  private async renderPageToPDF(
    doc: jsPDF, 
    pageId: 'front' | 'back',
    dimensions: { width: number; height: number }
  ): Promise<void> {
    if (!this.selectedCert?.imageUrl) {
      throw new Error(`Template not found for page: ${pageId}`);
    }
  
    const pageState = this.pageStates[pageId];
  
    try {
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
  
      const templateImage = await this.loadTemplateImage(this.selectedCert.imageUrl);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
  
      for (const zone of pageState.dropZones) {
        if (zone.hidden) continue;
  
        // Usar el fontSize guardado o el valor por defecto (52)
        const baseFontSize = zone.fontSize || 52;
        const italiannoMultiplier = 1.2;
        const fontSize = zone.fontFamily === 'Italianno' 
          ? baseFontSize * italiannoMultiplier 
          : baseFontSize;
  
        // Aplicar cursiva si está activada
        const fontStyle = zone.isItalic ? 'italic' : 'normal';
        ctx.font = `${fontStyle} ${fontSize}px ${zone.fontFamily || 'Arial'}`;
        
        ctx.fillStyle = zone.textColor || '#000000';
        ctx.textBaseline = 'top';
  
        const text = this.getStudentDataForZone(zone.fieldKey);
        
        if (zone.type === 'dates') {
          const lines = text.split('\n');
          const lineSpacing = fontSize * 1.2; // Espaciado proporcional al tamaño de fuente
          
          lines.forEach((line, index) => {
            ctx.fillText(
              line, 
              zone.position.x, 
              zone.position.y + (index * lineSpacing)
            );
          });
        } else {
          ctx.fillText(text, zone.position.x, zone.position.y);
        }
      }
  
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      doc.addImage(
        imgData, 
        'JPEG', 
        0, 
        0, 
        dimensions.width, 
        dimensions.height
      );
  
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw error;
    }
  }
  handleSelectElement(type: 'dropZone', id: number): void {
    this.currentPageState.selectedElement = {
      type,
      id,
      pageId: this.currentPageId
    };
    
    this.cdr.detectChanges();
    
    // Scroll automático después de la actualización de la vista
    setTimeout(() => {
      const element = document.getElementById(`field-item-${id}`);
      if (element && this.fieldsListContainer?.nativeElement) {
        const container = this.fieldsListContainer.nativeElement;
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calcular posición relativa
        const isVisible = (
          elementRect.top >= containerRect.top &&
          elementRect.bottom <= containerRect.bottom
        );
        
        if (!isVisible) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    }, 50);
  }

  toggleZoneVisibility(id: number): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === id);
    if (zone) {
      zone.hidden = !zone.hidden;
      this.cdr.detectChanges();
    }
  }

  changeCertificateType(type: 'curso' | 'diplomado' | 'constancia'): void {
    if (this.certificateType !== type) {
      this.certificateType = type;
      this.initializePageStates(); // Reinicializar con nuevo tipo
      
      if (type === 'constancia') {
        this.currentPageId = 'front';
      }
      this.cdr.detectChanges();
    }
  }
  handleZoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
    this.cdr.detectChanges();
  }

  handleZoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.1); // 10% mínimo
    this.cdr.detectChanges();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.currentPageState.selectedElement) return;

    const step = event.shiftKey ? 10 : 5;
    let newX, newY;

    if (this.currentPageState.selectedElement.type === 'dropZone') {
      const zone = this.currentPageState.dropZones.find(z => z.id === this.currentPageState.selectedElement?.id);
      if (!zone) return;

      newX = zone.position.x;
      newY = zone.position.y;

      switch (event.key) {
        case "ArrowUp":
          newY -= step / this.zoomLevel;
          break;
        case "ArrowDown":
          newY += step / this.zoomLevel;
          break;
        case "ArrowLeft":
          newX -= step / this.zoomLevel;
          break;
        case "ArrowRight":
          newX += step / this.zoomLevel;
          break;
        default:
          return;
      }

      this.handleDropZoneMove(zone.id, newX, newY);
    }
  }
}
