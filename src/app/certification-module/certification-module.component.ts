import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { CertificateService } from '../services/certificate.service';

import { CertTemplate, Certificado, DropZone, PageState, PageStates, CertSize, CERTIFICATE_LAYOUTS, AVAILABLE_FONTS 
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

  constructor(
    private certificateService: CertificateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadStudentData();
    this.determineCertificateType();
    this.initializePageStates();
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

  
  private initializePageStates(): void {
    const layout = CERTIFICATE_LAYOUTS[this.certificateType];
    const savedConfig = this.loadSavedConfiguration();
    
    if (savedConfig) {
        // Procesar con configuración guardada
        const processZones = (zones: any[], defaultZones: any[]) => {
            return defaultZones.map(defaultZone => {
                const savedZone = zones.find((z: any) => z.fieldKey === defaultZone.fieldKey);
                return {
                    ...defaultZone,
                    position: savedZone?.position || defaultZone.position,
                    hidden: savedZone?.hidden ?? defaultZone.hidden ?? false,
                    textColor: savedZone?.textColor || defaultZone.textColor || 'black',
                    fontFamily: savedZone?.fontFamily || defaultZone.fontFamily || 'Arial',
                    customPrefix: savedZone?.customPrefix || '',
                    customSuffix: savedZone?.customSuffix || ''
                };
            });
        };

        this.pageStates = {
            front: {
                dropZones: processZones(savedConfig.front.dropZones, layout.front),
                droppedItems: {},
                selectedElement: null
            },
            back: {
                dropZones: savedConfig.back ? 
                    processZones(savedConfig.back.dropZones, layout.back) : 
                    layout.back.map(z => ({ ...z, customPrefix: '', customSuffix: '' })),
                droppedItems: {},
                selectedElement: null
            }
        };
    } else {
        // Configuración inicial por defecto
        this.pageStates = {
            front: {
                dropZones: layout.front.map(z => ({
                    ...z,
                    hidden: z.hidden ?? false,
                    textColor: z.textColor || 'black',
                    fontFamily: z.fontFamily || 'Arial',
                    customPrefix: '',
                    customSuffix: ''
                })),
                droppedItems: {},
                selectedElement: null
            },
            back: {
                dropZones: layout.back.map(z => ({
                    ...z,
                    hidden: z.hidden ?? false,
                    textColor: z.textColor || 'black',
                    fontFamily: z.fontFamily || 'Arial',
                    customPrefix: '',
                    customSuffix: ''
                })),
                droppedItems: {},
                selectedElement: null
            }
        };
    }

    setTimeout(() => this.cdr.detectChanges(), 0);
}
  onFontChange(zoneId: number, font: string): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === zoneId);
    if (zone) {
      zone.fontFamily = font;
      this.cdr.markForCheck();
    }
  }

  
  
  private loadSavedConfiguration(): PageStates | null {
    try {
      const savedConfig = localStorage.getItem('certificate-config');
      if (savedConfig) {
        const allConfigs = JSON.parse(savedConfig);
        return allConfigs[this.certificateType];
      }
    } catch (error) {
      console.error('Error loading saved configuration:', error);
    }
    return null;
  }

  saveConfiguration(): void {
    try {
        // Cargar todas las configuraciones existentes
        let allConfigs: Record<string, any> = {};
        const savedConfig = localStorage.getItem('certificate-config');
        if (savedConfig) {
            allConfigs = JSON.parse(savedConfig);
        }

        // Crear copia del estado actual para guardar
        const configToSave = {
            front: {
                ...this.pageStates.front,
                selectedElement: null,
                droppedItems: {},
                dropZones: this.pageStates.front.dropZones.map(zone => ({
                    id: zone.id,
                    fieldKey: zone.fieldKey,
                    position: { x: zone.position.x, y: zone.position.y },
                    type: zone.type,
                    hidden: zone.hidden ?? false,
                    textColor: zone.textColor || 'black',
                    fontFamily: zone.fontFamily || 'Arial',
                    customPrefix: zone.customPrefix || '',
                    customSuffix: zone.customSuffix || ''
                }))
            },
            back: {
                ...this.pageStates.back,
                selectedElement: null,
                droppedItems: {},
                dropZones: this.pageStates.back.dropZones.map(zone => ({
                    id: zone.id,
                    fieldKey: zone.fieldKey,
                    position: { x: zone.position.x, y: zone.position.y },
                    type: zone.type,
                    hidden: zone.hidden ?? false,
                    textColor: zone.textColor || 'black',
                    fontFamily: zone.fontFamily || 'Arial',
                    customPrefix: zone.customPrefix || '',
                    customSuffix: zone.customSuffix || ''
                }))
            }
        };

        // Actualizar la configuración para el tipo actual
        allConfigs[this.certificateType] = configToSave;

        // Guardar todas las configuraciones
        localStorage.setItem('certificate-config', JSON.stringify(allConfigs));

        // Mostrar feedback
        this.showNotification('Configuración guardada exitosamente', 'success');
        this.cdr.detectChanges();
    } catch (error) {
        console.error('Error guardando configuración:', error);
        this.showNotification('Error al guardar la configuración', 'error');
    }
}

private showNotification(message: string, type: 'success' | 'error'): void {
    // Implementar tu sistema de notificaciones preferido
    alert(`${type.toUpperCase()}: ${message}`);
}

// Métodos auxiliares para mostrar mensajes (opcional)
private showSuccessMessage(message: string): void {
    // Puedes implementar un toast o alerta bonita aquí
    alert(message);
}

private showErrorMessage(message: string): void {
    // Puedes implementar un toast o alerta de error aquí
    alert(message);
}


  get currentPageState(): PageState {
    return this.pageStates[this.currentPageId];
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
        this.cdr.markForCheck();
    }
}
  

  toggleSignature(hasSignature: boolean): void {
    if (this.currentTemplateHasSignature !== hasSignature) {
      this.currentTemplateHasSignature = hasSignature;
      const template = this.frontTemplates.find(t => t.hasSignature === hasSignature);
      if (template) {
        this.selectTemplate(template);
      }
    }
  }

  getTemplateForPage(pageId: 'front' | 'back'): CertTemplate | null {
    if (pageId === 'front') {
      return this.frontTemplates.find(t => t.hasSignature === this.currentTemplateHasSignature) || null;
    }
    return this.certTemplates.find(t => t.pageType === pageId) || null;
  }

  getCurrentTemplate(): CertTemplate | null {
    return this.getTemplateForPage(this.currentPageId);
  }

  private loadTemplates(): void {
    this.certificateService.getTemplates().subscribe({
      next: (templates) => {
        this.certTemplates = templates;
        if (templates.length > 0) {
          const frontTemplate = templates.find(t => t.pageType === 'front' && !t.hasSignature);
          if (frontTemplate) {
            this.selectedCert = frontTemplate;
            this.currentTemplateHasSignature = frontTemplate.hasSignature;
            this.preloadTemplateImage(frontTemplate.imageUrl);
          }
        }
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.certTemplates = [
          {
            id: 1,
            name: "Frontal Sin Firma",
            imageUrl: "assets/fallback-front.jpg",
            pageType: 'front',
            hasSignature: false
          },
          {
            id: 2,
            name: "Frontal Con Firma",
            imageUrl: "assets/fallback-front-signed.jpg",
            pageType: 'front',
            hasSignature: true
          },
          {
            id: 3,
            name: "Trasera",
            imageUrl: "assets/fallback-back.jpg",
            pageType: 'back',
            hasSignature: false
          }
        ];

        const frontTemplate = this.certTemplates.find(t => t.pageType === 'front' && !t.hasSignature);
        if (frontTemplate) {
          this.selectedCert = frontTemplate;
          this.currentTemplateHasSignature = frontTemplate.hasSignature;
          this.preloadTemplateImage(frontTemplate.imageUrl);
        }
      }
    });
  }

  private loadStudentData(): void {
    this.certificateService.getStudentData().subscribe({
      next: (students) => {
        if (students && students.length > 0) {
          this.certificados = students;
        }
      },
      error: (err) => {
        console.error('Error loading student data:', err);
        this.certificados = [{
          iIdCertificado: 56513,
          iIdDetalle: 79029,
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
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        this.certSize = {
          width: img.naturalWidth || 1123,
          height: img.naturalHeight || 794
        };
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
    if (cert.pageType === 'front') {
      this.currentTemplateHasSignature = cert.hasSignature;
    }
    this.preloadTemplateImage(cert.imageUrl);
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

  getStudentDataForZone(fieldKey: string): string {
    const student = this.certificados[0];
    if (!student) return '';
    
    const zone = this.currentPageState.dropZones.find(z => z.fieldKey === fieldKey);
    const originalValue = this.getOriginalValue(fieldKey, student);
    
    // Combinar prefijo + valor original + sufijo, filtrando valores vacíos
    const parts = [
        zone?.customPrefix?.trim(),
        originalValue?.trim(),
        zone?.customSuffix?.trim()
    ].filter(part => part && part.length > 0);
    
    return parts.join(' ');
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
            return student.nota || 'Aprobado';
        case 'emisionFormat':
            return this.fechaAFormatoLegible(student.emisionFormat);
        case 'fechaFormat':
            return this.fechaAFormatoLegible(student.fechaFormat);
        default:
            return student[fieldKey as keyof Certificado]?.toString() || '';
    }
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
    this.dragOffsetX = (event.clientX - rect.left) / scale - zone.position.x;
    this.dragOffsetY = (event.clientY - rect.top) / scale - zone.position.y;
    document.body.style.cursor = 'grabbing';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.draggingZone) {
      const rect = this.certificateRef.nativeElement.getBoundingClientRect();
      const scale = this.zoomLevel;
      const newX = ((event.clientX - rect.left) / scale) - this.dragOffsetX;
      const newY = ((event.clientY - rect.top) / scale) - this.dragOffsetY;
      this.handleDropZoneMove(this.draggingZone.id, newX, newY);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.draggingZone = null;
    document.body.style.cursor = 'default';
  }

  handleDropZoneMove(id: number, x: number, y: number): void {
    this.currentPageState.dropZones = this.currentPageState.dropZones.map(zone =>
      zone.id === id ? { ...zone, position: { x, y } } : zone
    );
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

      // Load and draw template image
      const templateImage = await this.loadTemplateImage(this.selectedCert.imageUrl);
      
      // Clear canvas and draw background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

      // Draw all visible zones with their specific styles
      for (const zone of pageState.dropZones) {
        if (zone.hidden) continue;

        // Aumentar tamaño de fuente para Italianno
        const fontSize = zone.fontFamily === 'Italianno' ? 32 : 24;
        ctx.font = `${fontSize}px ${zone.fontFamily || 'Arial'}`;
        ctx.fillStyle = zone.textColor || '#000000';
        ctx.textBaseline = 'top';

        const text = this.getStudentDataForZone(zone.fieldKey);
        if (zone.type === 'dates') {
          const lines = text.split('\n');
          lines.forEach((line, index) => {
            // Ajustar espaciado si es Italianno
            const lineSpacing = zone.fontFamily === 'Italianno' ? 35 : 30;
            ctx.fillText(line, zone.position.x, zone.position.y + (index * lineSpacing));
          });
        } else {
          ctx.fillText(text, zone.position.x, zone.position.y);
        }
      }

      // Add the rendered canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      doc.addImage(imgData, 'JPEG', 0, 0, dimensions.width, dimensions.height);

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
      
      // Try to load saved configuration for the new type
      const savedConfig = this.loadSavedConfiguration();
      
      if (savedConfig) {
        this.pageStates = savedConfig;
      } else {
        this.initializePageStates();
      }
      
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
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
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
