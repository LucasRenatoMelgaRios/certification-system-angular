import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { CertificateService } from '../services/certificate.service';
import { CertTemplate, Certificado, DropZone, PageState, PageStates, CertSize, CERTIFICATE_LAYOUTS } from '../models/certificate.model';

@Component({
  selector: 'app-certification-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CertificateService],
  templateUrl: './certification-module.component.html',
  styles: [`
    .cert-module {
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding: 20px;
    }

    .cert-header {
      margin-bottom: 20px;
    }

    .cert-content {
      display: flex;
      flex: 1;
      gap: 20px;
    }

    .left-panel {
      width: 300px;
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
    }

    .controls-section {
      margin-bottom: 20px;
    }

    .signature-controls,
    .view-controls {
      margin-top: 20px;
    }

    .signature-controls h3,
    .view-controls h3 {
      margin-bottom: 10px;
    }

    .signature-options,
    .view-controls {
      display: flex;
      gap: 10px;
    }

    .signature-options button,
    .view-controls button {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .signature-options button.active,
    .view-controls button.active {
      background: #4285f4;
      color: white;
      border-color: #4285f4;
    }

    .certificate-container {
      position: relative;
      overflow: auto;
      border: 1px solid #ccc;
      margin: 20px 0;
      flex: 1;
    }

    .certificate-content {
      position: relative;
      transform-origin: 0 0;
      background: white;
    }

    .certificate-background {
      position: absolute;
      width: 100%;
      height: 100%;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }

    .drop-zone {
      position: absolute;
      border: 2px dashed #4285f4;
      border-radius: 4px;
      padding: 10px;
      background-color: rgba(66, 133, 244, 0.1);
      min-width: 150px;
      min-height: 40px;
      cursor: move;
    }

    .drop-zone.hidden {
      opacity: 0.5;
      border-style: dotted;
    }

    .drop-zone.selected {
      border-color: #ea4335;
      background-color: rgba(234, 67, 53, 0.1);
    }

    .zone-content {
      pointer-events: none;
    }

    .drop-zone-controls {
      position: absolute;
      top: -30px;
      right: 0;
      display: flex;
      gap: 5px;
    }

    .visibility-toggle {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
    }

    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .export-button {
      padding: 12px 24px;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    .export-button:hover {
      background: #3367d6;
    }

    .export-button i {
      font-size: 20px;
    }

    .export-info {
      font-size: 14px;
      color: #666;
    }

    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }

    .zoom-button {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }

    .zoom-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
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
  certificateType: 'curso' | 'diplomado' = 'curso';
  pageStates: PageStates = {
    front: { dropZones: [], droppedItems: {}, selectedElement: null },
    back: { dropZones: [], droppedItems: {}, selectedElement: null }
  };
  certificados: Certificado[] = [];

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
    this.certificateType = student?.curso?.toLowerCase().includes('diplomado') ? 'diplomado' : 'curso';
  }

  private initializePageStates(): void {
    const layout = CERTIFICATE_LAYOUTS[this.certificateType];
    this.pageStates = {
      front: {
        dropZones: layout.front.map(z => ({
          ...z,
          hidden: z.hidden || false
        })),
        droppedItems: {},
        selectedElement: null
      },
      back: {
        dropZones: layout.back.map(z => ({
          ...z,
          hidden: z.hidden || false
        })),
        droppedItems: {},
        selectedElement: null
      }
    };
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

    switch(fieldKey) {
      case 'descripcion':
        return `Inicio: ${student.initFormat}\nFin: ${student.finFormat}\n${student.descripcion || ''}`;
      case 'ihrlectiva':
        return `${student.ihrlectiva} horas lectivas`;
      case 'nombreCompleto':
        return `${student.nombre} ${student.apellido}`;
      case 'codigoCurso':
        return student.codigo.split('-')[0];
      case 'codigoCertificado':
        return student.iIdCertificado.toString();
      default:
        return student[fieldKey as keyof Certificado]?.toString() || '';
    }
  }

  getFieldLabel(fieldKey: string): string {
    const labels: {[key: string]: string} = {
      'nombre': 'Nombre completo',
      'apellido': 'Apellidos',
      'curso': 'Nombre del curso',
      'descripcion': 'Descripción y fechas',
      'ihrlectiva': 'Horas lectivas',
      'emisionFormat': 'Fecha de emisión',
      'fechaFormat': 'Fecha de expedición',
      'dni': 'DNI',
      'codigo': 'Código del curso',
      'iIdCertificado': 'Código de certificado'
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

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [this.certSize.width, this.certSize.height],
      compress: true
    });

    try {
      // Store current state
      const currentState = {
        pageId: this.currentPageId,
        hasSignature: this.currentTemplateHasSignature,
        selectedCert: this.selectedCert
      };

      // Render front page
      const frontTemplate = this.frontTemplates.find(t => t.hasSignature === this.currentTemplateHasSignature);
      if (!frontTemplate) throw new Error('Front template not found');
      
      this.currentPageId = 'front';
      this.selectedCert = frontTemplate;
      await this.renderPageToPDF(doc, 'front');

      // Render back page if exists
      const backTemplate = this.certTemplates.find(t => t.pageType === 'back');
      if (backTemplate) {
        doc.addPage([this.certSize.width, this.certSize.height], 'landscape');
        this.currentPageId = 'back';
        this.selectedCert = backTemplate;
        await this.renderPageToPDF(doc, 'back');
      }

      // Restore state
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

  private async renderPageToPDF(doc: jsPDF, pageId: 'front' | 'back'): Promise<void> {
    if (!this.selectedCert?.imageUrl) {
      throw new Error(`Template not found for page: ${pageId}`);
    }

    const pageState = this.pageStates[pageId];

    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.certSize.width;
      canvas.height = this.certSize.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');

      // Load and draw template image
      const templateImage = await this.loadTemplateImage(this.selectedCert.imageUrl);
      
      // Clear canvas and draw background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

      // Configure text rendering
      ctx.font = '24px Arial';
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'top';

      // Draw all visible zones
      for (const zone of pageState.dropZones) {
        if (zone.hidden) continue;

        const text = this.getStudentDataForZone(zone.fieldKey);
        if (zone.type === 'dates') {
          const lines = text.split('\n');
          lines.forEach((line, index) => {
            ctx.fillText(line, zone.position.x, zone.position.y + (index * 30));
          });
        } else {
          ctx.fillText(text, zone.position.x, zone.position.y);
        }
      }

      // Add the rendered canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      doc.addImage(imgData, 'JPEG', 0, 0, this.certSize.width, this.certSize.height);

    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw error;
    }
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

  changeCertificateType(type: 'curso' | 'diplomado'): void {
    if (this.certificateType !== type) {
      this.certificateType = type;
      this.initializePageStates();
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
