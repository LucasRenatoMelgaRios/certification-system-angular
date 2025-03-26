import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { CertificateService } from '../services/certificate.service';
import { CertTemplate, Certificado, DropZone, PageState, PageStates, CertSize } from '../models/certificate.model';

@Component({
  selector: 'app-certification-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CertificateService],
  templateUrl: './certification-module.component.html',
  styles: [`
    .certificate-container {
      position: relative;
      overflow: auto;
      border: 1px solid #ccc;
      margin: 20px 0;
    }
    .certificate-canvas {
      position: relative;
      transform-origin: 0 0;
    }
    .drop-zone {
      position: absolute;
      border: 2px dashed #4285f4;
      border-radius: 4px;
      padding: 10px;
      background-color: rgba(66, 133, 244, 0.1);
      min-width: 150px;
      min-height: 40px;
    }
    .drop-zone-content {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .zoom-controls {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100;
    }
    .template-view-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .template-view-controls button {
      padding: 8px 16px;
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    .template-view-controls button.active {
      background-color: #4285f4;
      color: white;
      border-color: #4285f4;
    }
    .cert-template-preview img {
      display: block;
      max-width: 100%;
      height: auto;
      object-fit: contain;
      background: white;
    }

    .drop-zone.hidden {
  opacity: 0.5;
  border-style: dotted;
}

.drop-zone.hidden .zone-content {
  display: none;
}

.control-button.toggle-visibility {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  margin-left: 5px;
}

.control-button.toggle-visibility svg {
  vertical-align: middle;
}
  `]
})
export class CertificationModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('certificateRef') certificateRef!: ElementRef;
  @ViewChild('certificateContainerRef') certificateContainerRef!: ElementRef;

  Object = Object;
  zoomLevel = 1;
  currentPageId: 'front' | 'back' = 'front';
  certTemplates: CertTemplate[] = [];
  selectedCert: CertTemplate | null = null;
  certSize: CertSize = { width: 1123, height: 794 };
  draggingZone: DropZone | null = null;
  dragStartX = 0;
  dragStartY = 0;
  dragOffsetX = 0;
  dragOffsetY = 0;
  templateImageLoaded = false;
  currentTemplateImage: HTMLImageElement | null = null;

  pageStates: PageStates = {
    front: {
      dropZones: [
        { id: 1, label: "nombre", position: { x: 50, y: 150 }, pageId: 'front' },
        { id: 2, label: "curso", position: { x: 50, y: 220 }, pageId: 'front' },
        { id: 3, label: "horas lectivas", position: { x: 50, y: 290 }, pageId: 'front' }
      ],
      droppedItems: {},
      selectedElement: null
    },
    back: {
      dropZones: [],
      droppedItems: {},
      selectedElement: null
    }
  };

  certificados: Certificado[] = [];

  constructor(
    private certificateService: CertificateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadStudentData();
  }

  private sanitizeImageUrl(url: string): string {
    return url;
  }

  private loadTemplates(): void {
    this.certificateService.getTemplates().subscribe({
      next: (templates) => {
        this.certTemplates = templates;
        if (this.certTemplates.length > 0) {
          const frontTemplate = this.certTemplates.find(t => t.pageType === 'front');
          if (frontTemplate) {
            this.selectedCert = frontTemplate;
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
            imageUrl: `assets/fallback-front.jpg`,
            pageType: 'front',
            hasSignature: false
          },
          { 
            id: 2, 
            name: "Frontal Con Firma",
            imageUrl: `assets/fallback-front-signed.jpg`,
            pageType: 'front',
            hasSignature: true
          },
          { 
            id: 3, 
            name: "Trasera",
            imageUrl: `assets/fallback-back.jpg`,
            pageType: 'back',
            hasSignature: false
          }
        ];
        
        if (this.certTemplates.length > 0) {
          const frontTemplate = this.certTemplates.find(t => t.pageType === 'front');
          if (frontTemplate) {
            this.selectedCert = frontTemplate;
            this.preloadTemplateImage(frontTemplate.imageUrl);
          }
        }
      }
    });
  }

  private preloadTemplateImage(imageUrl: string): Promise<void> {
    return new Promise((resolve) => {
      this.templateImageLoaded = false;
      if (this.currentTemplateImage) {
        this.currentTemplateImage.onload = null;
      }
      
      this.currentTemplateImage = new Image();
      this.currentTemplateImage.crossOrigin = 'Anonymous';
      
      this.currentTemplateImage.onload = () => {
        this.certSize = {
          width: this.currentTemplateImage?.naturalWidth || 1123,
          height: this.currentTemplateImage?.naturalHeight || 794
        };
        this.templateImageLoaded = true;
        this.cdr.detectChanges();
        resolve();
      };
      
      this.currentTemplateImage.src = imageUrl;
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

  ngAfterViewInit(): void {
    this.updateCertificateSize();
  }

  get frontTemplates(): CertTemplate[] {
    return this.certTemplates
      .filter(t => t.pageType === 'front')
      .sort((a, b) => {
        if (a.hasSignature === b.hasSignature) return 0;
        return a.hasSignature ? 1 : -1;
      });
  }

  get currentPageState(): PageState {
    return this.pageStates[this.currentPageId];
  }

  getTemplateForPage(pageId: 'front' | 'back'): CertTemplate | null {
    if (this.selectedCert?.pageType === pageId) {
      return this.selectedCert;
    }
    return this.certTemplates.find(t => t.pageType === pageId) || null;
  }

  getStudentDataForZone(zoneLabel: string): string {
    const student = this.certificados[0];
    if (!student) return '';
    
    switch(zoneLabel.toLowerCase()) {
      case 'nombre': 
        return `${student.nombre} ${student.apellido}`;
      case 'curso': 
        return student.curso;
      case 'horas lectivas': 
        return `${student.ihrlectiva} horas lectivas`;
      default: 
        return '';
    }
  }

  private async updateCertificateSize(): Promise<void> {
    if (this.selectedCert?.imageUrl) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.certSize = {
              width: img.naturalWidth || 1123,
              height: img.naturalHeight || 794
            };
            this.cdr.detectChanges();
            resolve();
          };
          img.onerror = reject;
          img.src = this.selectedCert!.imageUrl;
        });
      } catch (error) {
        console.error('Error al cargar la imagen del certificado:', error);
        this.certSize = { width: 1123, height: 794 };
        this.cdr.detectChanges();
      }
    }
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

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
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
    if (!this.certificateRef?.nativeElement) {
      console.error('Error: Certificate elements not ready');
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [this.certSize.width, this.certSize.height],
      compress: true
    });

    try {
      await this.renderPageToPDF(doc, 'front');
      
      const backTemplate = this.getTemplateForPage('back');
      if (backTemplate) {
        doc.addPage();
        await this.renderPageToPDF(doc, 'back');
      }

      const filename = backTemplate ? 'diplomado.pdf' : 'certificado.pdf';
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        resolve(canvas.toDataURL('image/jpeg', 1.0));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
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

  toggleZoneVisibility(id: number): void {
    const zone = this.currentPageState.dropZones.find(z => z.id === id);
    if (zone) {
      zone.hidden = !zone.hidden;
      this.cdr.detectChanges();
    }
  }

  private async renderPageToPDF(doc: jsPDF, pageId: 'front' | 'back'): Promise<void> {
    const template = this.getTemplateForPage(pageId);
  
    if (!template?.imageUrl) {
      console.error('Template not found for page:', pageId);
      return;
    }
  
    try {
      const pageImage = await this.loadTemplateImage(template.imageUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = this.certSize.width;
      canvas.height = this.certSize.height;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(pageImage, 0, 0, canvas.width, canvas.height);

      const pageState = this.pageStates[pageId];
      if (pageState.dropZones.length > 0) {
        await this.addItemsToCanvas(ctx, pageId);
      }

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      doc.addImage(
        imgData,
        'JPEG',
        0,
        0,
        this.certSize.width,
        this.certSize.height,
        undefined,
        'FAST'
      );

    } catch (error) {
      console.error('Error rendering PDF page:', error);
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, this.certSize.width, this.certSize.height, 'F');
    }
  }

  private async addItemsToCanvas(ctx: CanvasRenderingContext2D, pageId: 'front' | 'back'): Promise<void> {
    const pageState = this.pageStates[pageId];
    ctx.font = '24px Arial';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000000';

    for (const zone of pageState.dropZones) {
      if (!zone.hidden) { // Solo procesar zonas visibles
        const text = this.getStudentDataForZone(zone.label);
        ctx.fillText(text, zone.position.x, zone.position.y + 30);
      }
    }
  }

  handleSelectElement(type: 'dropZone', id: number): void {
    this.currentPageState.selectedElement = { type, id, pageId: this.currentPageId };
    this.cdr.detectChanges();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.currentPageState.selectedElement) return;
  
    const step = event.shiftKey ? 10 :5;
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

  selectTemplate(cert: CertTemplate): void {
    if (cert.pageType === this.currentPageId) {
      this.selectedCert = cert;
      this.preloadTemplateImage(cert.imageUrl);
    }
  }

  showFrontTemplate(): void {
    this.currentPageId = 'front';
    if (!this.selectedCert || this.selectedCert.pageType !== 'front') {
      const frontTemplate = this.frontTemplates[0];
      if (frontTemplate) {
        this.selectTemplate(frontTemplate);
      }
    }
  }
  
  showBackTemplate(): void {
    this.currentPageId = 'back';
    const backTemplate = this.getTemplateForPage('back');
    if (backTemplate) {
      this.selectTemplate(backTemplate);
    }
  }
  
  getCurrentTemplate(): CertTemplate | null {
    return this.getTemplateForPage(this.currentPageId);
  }

  handleZoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
    this.cdr.detectChanges();
  }

  handleZoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
    this.cdr.detectChanges();
  }
}