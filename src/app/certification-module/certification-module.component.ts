import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { FilePondModule } from 'ngx-filepond';
import { FilePondOptions } from 'filepond';
import { registerPlugin } from 'filepond';
import { FilePondComponent } from 'ngx-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { LucideAngularModule } from 'lucide-angular';
import { CertificateService } from '../services/certificate.service';
import { 
  CertTemplate, 
  Certificado,
  DropZone, 
  DroppedItem, 
  GeneratedItem, 
  Signature, 
  CertSize, 
  PageState,
  PageStates
} from '../models/certificate.model';

registerPlugin(FilePondPluginFileValidateType);

@Component({
  selector: 'app-certification-module',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FilePondModule, 
    LucideAngularModule
  ],
  providers: [CertificateService],
  templateUrl: './certification-module.component.html',
  styles: [`
    .signatures-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 15px;
    }
    .signature-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      width: calc(100% - 5px);
    }
    .signature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .signature-preview {
      max-width: 100%;
      height: auto;
      max-height: 60px;
    }
    .remove-signature {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      padding: 4px;
    }
    .remove-signature:hover {
      color: #bd2130;
    }
    .signature-label-input {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
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
    .generated-item {
      padding: 8px;
      margin: 5px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: grab;
    }
    .generated-item:active {
      cursor: grabbing;
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
    .color-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .color-button {
      width: 32px;
      height: 32px;
      border: 2px solid #ddd;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .color-button:hover {
      transform: scale(1.1);
    }
    .color-button.active {
      border-color: #4285f4;
      box-shadow: 0 0 5px rgba(66, 133, 244, 0.5);
    }
    .color-button.black {
      background-color: #000;
    }
    .color-button.white {
      background-color: #fff;
      border-color: #666;
    }
    .cert-template-preview img {
      display: block;
      max-width: 100%;
      height: auto;
      object-fit: contain;
      background: white;
    }
  `]
})
export class CertificationModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('certificateRef') certificateRef!: ElementRef;
  @ViewChild('certificateContainerRef') certificateContainerRef!: ElementRef;
  @ViewChild('signaturePond', { read: ElementRef }) signaturePondElement!: ElementRef;
  @ViewChild('signaturePond') signaturePondComponent!: FilePondComponent;

  Object = Object;
  newDropZoneLabel = "";
  isAddingDropZone = false;
  newSignatureLabel = "";
  signatures: Signature[] = [];
  zoomLevel = 1;
  textColor: 'black' | 'white' = 'black';
  currentPageId: 'front' | 'back' = 'front';
  certTemplates: CertTemplate[] = [];
  selectedCert: CertTemplate | null = null;
  generatedItems: GeneratedItem[] = [];
  certSize: CertSize = { width: 1123, height: 794 };
  draggingItem: GeneratedItem | null = null;
  draggingZone: DropZone | null = null;
  dragStartX = 0;
  dragStartY = 0;
  dragOffsetX = 0;
  dragOffsetY = 0;
  dragOverZone: string | null = null;
  templateImageLoaded = false;
  currentTemplateImage: HTMLImageElement | null = null;

  pageStates: PageStates = {
    front: {
      dropZones: [
        { id: 1, label: "a nombre de", position: { x: 50, y: 150 }, pageId: 'front' },
        { id: 2, label: "Curso", position: { x: 50, y: 220 }, pageId: 'front' },
        { id: 3, label: "Firma", position: { x: 200, y: 350 }, pageId: 'front' }
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

  signatureUploadOptions: FilePondOptions = {
    allowMultiple: false,
    labelIdle: 'DROP HERE',
    acceptedFileTypes: ['image/*'],
    onaddfile: (err: any, fileItem: { file: any; }) => {
      if (err || !fileItem.file) return;
      
      const file = fileItem.file;
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const newSignature: Signature = {
          id: Date.now(),
          file: file,
          dataURL: e.target?.result as string,
          label: this.newSignatureLabel || `Firma ${this.signatures.length + 1}`
        };
        this.signatures = [...this.signatures, newSignature];
        this.newSignatureLabel = "";
        this.clearFilePondFiles();
        this.handleGenerateItems();
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  };

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

  private async loadTemplates(): Promise<void> {
    this.certificateService.getTemplates().subscribe({
      next: (templates) => {
        this.certTemplates = templates.map(t => ({
          ...t,
          imageUrl: `${this.sanitizeImageUrl(t.imageUrl)}?t=${Date.now()}`
        }));
        
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
            imageUrl: `assets/fallback-front.jpg?t=${Date.now()}`,
            pageType: 'front',
            hasSignature: false
          },
          { 
            id: 2, 
            name: "Frontal Con Firma",
            imageUrl: `assets/fallback-front-signed.jpg?t=${Date.now()}`,
            pageType: 'front',
            hasSignature: true
          },
          { 
            id: 3, 
            name: "Trasera",
            imageUrl: `assets/fallback-back.jpg?t=${Date.now()}`,
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
          this.handleGenerateItems();
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
          fechaFormat: "28/02/2025",
          tipo: "certificado"
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

  private clearFilePondFiles(): void {
    try {
      const fileInput = this.signaturePondElement.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      if (this.signaturePondComponent && typeof (this.signaturePondComponent as any).removeFiles === 'function') {
        (this.signaturePondComponent as any).removeFiles();
      }
    } catch (error) {
      console.error('Error limpiando FilePond:', error);
    }
  }

  hasDroppedItems(): boolean {
    return Object.keys(this.currentPageState.droppedItems).length > 0;
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

  handleGenerateItems(): void {
    if (!this.certificados[0]) return;
  
    const certificado = this.certificados[0];
    const items: GeneratedItem[] = [
      { 
        id: 'nombre', 
        text: `${certificado.nombre} ${certificado.apellido}`.trim(), 
        type: 'text',
        color: 'black'
      },
      { 
        id: 'curso', 
        text: certificado.curso, 
        type: 'text',
        color: 'black'
      },
      { 
        id: 'horas', 
        text: `${certificado.ihrlectiva || 0} horas lectivas`, 
        type: 'text',
        color: 'black'
      }
    ];
  
    this.signatures.forEach((sig, index) => {
      items.push({ 
        id: `firma-${index}`, 
        text: sig.label,  // Aquí se usa solo el texto (label) de la firma
        type: 'signature',
        signatureIndex: index
      });
    });
  
    this.generatedItems = [...items];
    this.cdr.detectChanges();
  }

  removeSignature(index: number): void {
    this.signatures = this.signatures.filter((_, i) => i !== index);
    
    Object.keys(this.pageStates).forEach(pageId => {
      const page = this.pageStates[pageId as 'front' | 'back'];
      const updatedDroppedItems = { ...page.droppedItems };
      
      Object.entries(updatedDroppedItems).forEach(([key, item]) => {
        if (item.type === 'signature') {
          if (item.signatureIndex === index) {
            delete updatedDroppedItems[key];
          } else if (item.signatureIndex! > index) {
            updatedDroppedItems[key] = {
              ...item,
              signatureIndex: item.signatureIndex! - 1
            };
          }
        }
      });
      
      page.droppedItems = updatedDroppedItems;
    });
    
    this.handleGenerateItems();
    this.cdr.detectChanges();
  }

  getSignatureUrl(index?: number): string | null {
    if (typeof index !== 'number' || !this.signatures[index]) return null;
    return this.signatures[index].dataURL;
  }

  getDroppedItem(zoneLabel: string): DroppedItem | null {
    return this.currentPageState.droppedItems[zoneLabel] || null;
  }

  handleDrop(zoneLabel: string, item: GeneratedItem): void {

    this.currentPageState.droppedItems = {
      ...this.currentPageState.droppedItems,
      [zoneLabel]: {
        ...item,
        pageId: this.currentPageId
      }
    };
    this.cdr.detectChanges();
  }

  startDraggingItem(event: MouseEvent, item: GeneratedItem): void {
    event.preventDefault();

    this.draggingItem = item;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    document.body.style.cursor = 'grabbing';
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
    
    if (this.draggingItem) {
      const certRect = this.certificateRef.nativeElement.getBoundingClientRect();
      const scale = this.zoomLevel;
      
      for (const zone of this.currentPageState.dropZones) {
        const zoneX = (zone.position.x * scale) + certRect.left;
        const zoneY = (zone.position.y * scale) + certRect.top;
        const zoneWidth = 150 * scale;
        const zoneHeight = 40 * scale;
        
        if (
          event.clientX >= zoneX && 
          event.clientX <= zoneX + zoneWidth &&
          event.clientY >= zoneY && 
          event.clientY <= zoneY + zoneHeight
        ) {
          this.dragOverZone = zone.label;
          break;
        } else {
          this.dragOverZone = null;
        }
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.draggingItem && this.dragOverZone) {
      this.handleDrop(this.dragOverZone, this.draggingItem);
    }
    
    this.draggingItem = null;
    this.draggingZone = null;
    this.dragOverZone = null;
    document.body.style.cursor = 'default';
  }

  isDraggedOver(zoneLabel: string): boolean {
    return this.dragOverZone === zoneLabel;
  }

  handleDropZoneMove(id: number, x: number, y: number): void {
    this.currentPageState.dropZones = this.currentPageState.dropZones.map(zone =>
      zone.id === id ? { ...zone, position: { x, y } } : zone
    );
    this.cdr.detectChanges();
  }

  handleFileUpload(fileItems: any[]): void {
    if (fileItems && fileItems.length > 0) {
      const fileItem = fileItems[0];
      const file = fileItem.file;
      
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (!e.target?.result) return;
  
        const newSignature: Signature = {
          id: Date.now(),
          file: file,
          dataURL: e.target.result as string,
          label: this.newSignatureLabel || `Firma ${this.signatures.length + 1}`
        };
  
        this.signatures = [...this.signatures, newSignature];
        this.newSignatureLabel = "";
        this.clearFilePondFiles();
        
        // Regenerar los ítems incluyendo la nueva firma
        this.handleGenerateItems();
        this.cdr.detectChanges();
      };
      
      reader.readAsDataURL(file);
    }
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
      
      if (this.certificados[0]?.tipo === 'diplomado') {
        doc.addPage();
        await this.renderPageToPDF(doc, 'back');
      }

      const filename = this.certificados[0]?.tipo === 'diplomado' ? 'diplomado.pdf' : 'certificado.pdf';
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

  private async renderPageToPDF(doc: jsPDF, pageId: 'front' | 'back'): Promise<void> {
    const template = pageId === 'front' 
      ? this.getTemplateForPage('front') 
      : this.getTemplateForPage('back');
  
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
      if (Object.keys(pageState.droppedItems).length > 0) {
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
    
    for (const [zoneLabel, item] of Object.entries(pageState.droppedItems)) {
      const zone = pageState.dropZones.find(z => z.label === zoneLabel);
      if (!zone) continue;
  
      const xPos = zone.position.x;
      const yPos = zone.position.y + 30;
  
      if (item.type === 'signature' && typeof item.signatureIndex === 'number') {
        const signature = this.signatures[item.signatureIndex];
        if (signature) {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, xPos, yPos, 150, 75);
              resolve();
            };
            img.onerror = reject;
            img.src = signature.dataURL;
          });
        }
      } else {
        ctx.font = '24px Arial';
        ctx.textBaseline = 'top';
        ctx.fillStyle = item.color === 'white' ? '#ffffff' : '#000000';
        ctx.fillText(item.text, xPos, yPos);
      }
    }
  }
  

  handleAddDropZone(): void {
    if (this.newDropZoneLabel.trim()) {
      const newDropZone: DropZone = {
        id: Date.now(),
        label: this.newDropZoneLabel,
        position: { x: 100, y: 100 },
        pageId: this.currentPageId
      };
      
      this.currentPageState.dropZones = [...this.currentPageState.dropZones, newDropZone];
      this.newDropZoneLabel = "";
      this.isAddingDropZone = false;
      this.cdr.detectChanges();
    }
  }

  handleRemoveDropZone(id: number): void {
    const zoneToRemove = this.currentPageState.dropZones.find(zone => zone.id === id);
    if (zoneToRemove) {
      const { [zoneToRemove.label]: _, ...updatedDroppedItems } = this.currentPageState.droppedItems;
      this.currentPageState.droppedItems = updatedDroppedItems;
    }

    this.currentPageState.dropZones = this.currentPageState.dropZones.filter(zone => zone.id !== id);

    if (this.currentPageState.selectedElement && 
        this.currentPageState.selectedElement.type === 'dropZone' && 
        this.currentPageState.selectedElement.id === id) {
      this.currentPageState.selectedElement = null;
    }
    this.cdr.detectChanges();
  }

  handleSelectElement(type: 'dropZone' | 'item', id: number | string): void {
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
      this.selectedCert = {
        ...cert,
        imageUrl: `${cert.imageUrl}?t=${Date.now()}`
      };
      
      this.preloadTemplateImage(this.selectedCert.imageUrl);
      this.handleGenerateItems();
    }
  }

  isItemDroppedInZone(zoneLabel: string): boolean {
    return !!this.currentPageState.droppedItems[zoneLabel];
  }

  handleZoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
    this.cdr.detectChanges();
  }

  handleZoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
    this.cdr.detectChanges();
  }

  changeTextColor(newColor: 'black' | 'white'): void {
    if (!this.currentPageState.selectedElement || this.currentPageState.selectedElement.type !== 'item') return;
    
    const item = this.generatedItems.find(i => i.id === this.currentPageState.selectedElement?.id);
    if (item && item.type === 'text') {
      item.color = newColor;
      this.textColor = newColor;
      
      Object.keys(this.currentPageState.droppedItems).forEach(zoneLabel => {
        if (this.currentPageState.droppedItems[zoneLabel].id === item.id) {
          this.currentPageState.droppedItems[zoneLabel].color = newColor;
        }
      });
      this.cdr.detectChanges();
    }
  }

  selectedElementIsText(): boolean {
    if (!this.currentPageState.selectedElement || this.currentPageState.selectedElement.type !== 'item') return false;
    const item = this.generatedItems.find(i => i.id === this.currentPageState.selectedElement?.id);
    return item ? item.type === 'text' : false;
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
}