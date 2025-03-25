import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { FilePondModule } from 'ngx-filepond';
import { FilePondOptions } from 'filepond';
import { registerPlugin } from 'filepond';
import { FilePondComponent } from 'ngx-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { LucideAngularModule } from 'lucide-angular';

import 'filepond/dist/filepond.min.css';

import { 
  CertTemplate, 
  Certificado,
  DropZone, 
  DroppedItem, 
  GeneratedItem, 
  Signature, 
  CertSize, 
  SelectedElement,
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
      width: calc(50% - 5px);
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
  `]
})

export class CertificationModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('certificateRef') certificateRef!: ElementRef;
  @ViewChild('certificateContainerRef') certificateContainerRef!: ElementRef;
  @ViewChild('signaturePond', { read: ElementRef }) signaturePondElement!: ElementRef;
  @ViewChild('signaturePond') signaturePondComponent!: FilePondComponent;

  Object = Object;
  newDropZoneLabel: string = "";
  isAddingDropZone: boolean = false;
  newSignatureLabel: string = "";
  signatures: Signature[] = [];
  zoomLevel: number = 1;
  textColor: 'black' | 'white' = 'black';
  currentPageId: 'front' | 'back' = 'front';

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

  initialTemplates: CertTemplate[] = [
    { 
      id: 1, 
      name: "Certificado Básico (Frontal)",
      imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      pageType: 'front'
    },
    { 
      id: 2, 
      name: "Certificado Profesional (Trasero)",
      imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      pageType: 'back'
    }
  ];

  certificados: Certificado[] = [
    {
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
      tipo: "diplomado",
    }
  ];

  certTemplates: CertTemplate[] = [];
  selectedCert: CertTemplate | null = null;
  generatedItems: GeneratedItem[] = [];
  certSize: CertSize = { width: 1123, height: 794 };
  draggingItem: GeneratedItem | null = null;
  draggingZone: DropZone | null = null;
  dragStartX: number = 0;
  dragStartY: number = 0;
  dragOffsetX: number = 0;
  dragOffsetY: number = 0;
  dragOverZone: string | null = null;

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
        
        this.signatures.push(newSignature);
        this.newSignatureLabel = "";
        this.clearFilePondFiles();
      };
      
      reader.readAsDataURL(file);
    }
  };

  constructor() {}

  ngOnInit(): void {
    this.certTemplates = [...this.initialTemplates];
    if (this.certTemplates.length > 0) {
      this.selectedCert = this.certTemplates[0];
    }
  }

  ngAfterViewInit(): void {
    this.updateCertificateSize();
  }

  get currentPageState(): PageState {
    return this.pageStates[this.currentPageId];
  }

  getTemplateForPage(pageId: 'front' | 'back'): CertTemplate | null {
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

  updateCertificateSize(): void {
    if (this.selectedCert?.imageUrl) {
      const img = new Image();
      img.src = this.selectedCert.imageUrl;
      img.onload = () => {
        this.certSize = { 
          width: img.naturalWidth || 1123, 
          height: img.naturalHeight || 794 
        };
      };
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
        text: sig.label, 
        type: 'signature',
        signatureIndex: index
      });
    });
  
    this.generatedItems = items;
  }

  removeSignature(index: number): void {
    this.signatures.splice(index, 1);
    
    Object.keys(this.pageStates).forEach(pageId => {
      const page = this.pageStates[pageId as 'front' | 'back'];
      
      Object.entries(page.droppedItems).forEach(([key, item]) => {
        if (item.type === 'signature' && item.signatureIndex === index) {
          delete page.droppedItems[key];
        } else if (item.type === 'signature' && item.signatureIndex! > index) {
            page.droppedItems[key] = {
              ...item,
              signatureIndex: item.signatureIndex! - 1
            };
        }
      });
    });
    
    if (this.generatedItems.length > 0) {
      this.handleGenerateItems();
    }
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
    this.dragOffsetX = event.clientX - zone.position.x;
    this.dragOffsetY = event.clientY - zone.position.y;
    document.body.style.cursor = 'grabbing';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.draggingZone) {
      const newX = event.clientX - this.dragOffsetX;
      const newY = event.clientY - this.dragOffsetY;
      this.handleDropZoneMove(this.draggingZone.id, newX, newY);
    }
    
    if (this.draggingItem) {
      const certRect = this.certificateRef.nativeElement.getBoundingClientRect();
      
      for (const zone of this.currentPageState.dropZones) {
        const zoneX = zone.position.x + certRect.left;
        const zoneY = zone.position.y + certRect.top;
        const zoneWidth = 150;
        const zoneHeight = 40;
        
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
  }

  handleFileUpload(fileItems: any[]): void {
    if (fileItems && fileItems.length > 0) {
      const fileItem = fileItems[0];
      const file = fileItem.file;
      
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.signatures.push({
          file: file,
          dataURL: e.target?.result as string,
          label: this.newSignatureLabel || `Firma ${this.signatures.length + 1}`,
          id: Date.now()
        });
      };
      
      reader.readAsDataURL(file);
    }
  }

  handleExportPDF(): void {
    if (!this.certificateRef?.nativeElement || this.certSize.width === 0 || this.certSize.height === 0) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [this.certSize.width, this.certSize.height]
    });

    this.renderPageToPDF(doc, 'front');
    
    if (this.certificados[0]?.tipo === 'diplomado') {
      doc.addPage();
      this.renderPageToPDF(doc, 'back');
    }

    const filename = this.certificados[0]?.tipo === 'diplomado' ? 'diplomado.pdf' : 'certificado.pdf';
    doc.save(filename);
  }

  private renderPageToPDF(doc: jsPDF, pageId: 'front' | 'back'): void {
    const template = this.getTemplateForPage(pageId);
    if (template?.imageUrl) {
      doc.addImage(template.imageUrl, 'JPEG', 0, 0, this.certSize.width, this.certSize.height);
    }
    this.addItemsToPDF(doc, pageId);
  }

  private addItemsToPDF(doc: jsPDF, pageId: 'front' | 'back'): void {
    const pageState = this.pageStates[pageId];
    
    Object.entries(pageState.droppedItems).forEach(([zoneLabel, item]) => {
      const zone = pageState.dropZones.find(z => z.label === zoneLabel);
      if (zone) {
        const xPos = zone.position.x;
        const yPos = zone.position.y + 30;
        doc.setFontSize(24);
  
        if (item.type === 'signature' && typeof item.signatureIndex === 'number') {
          const signature = this.signatures[item.signatureIndex];
          if (signature) {
            try {
              doc.addImage(signature.dataURL, 'PNG', xPos, yPos, 150, 75);
            } catch (error) {
              console.error("Error adding signature to PDF:", error);
            }
          }
        } else {
          doc.setFillColor(item.color === 'white' ? '#ffffff' : '#000000');
          doc.setTextColor(item.color === 'white' ? '#ffffff' : '#000000');
          doc.text(item.text, xPos, yPos);
        }
      }
    });
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
  }

  handleSelectElement(type: 'dropZone' | 'item', id: number | string): void {
    this.currentPageState.selectedElement = { type, id, pageId: this.currentPageId };
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

      if (event.key === "ArrowUp") newY -= step;
      if (event.key === "ArrowDown") newY += step;
      if (event.key === "ArrowLeft") newX -= step;
      if (event.key === "ArrowRight") newX += step;

      this.handleDropZoneMove(zone.id, newX, newY);
    }
  }

  selectTemplate(cert: CertTemplate): void {
    this.selectedCert = cert;
    this.updateCertificateSize();
  }

  isItemDroppedInZone(zoneLabel: string): boolean {
    return !!this.currentPageState.droppedItems[zoneLabel];
  }

  handleZoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
  }

  handleZoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
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
    }
  }

  selectedElementIsText(): boolean {
    if (!this.currentPageState.selectedElement || this.currentPageState.selectedElement.type !== 'item') return false;
    const item = this.generatedItems.find(i => i.id === this.currentPageState.selectedElement?.id);
    return item ? item.type === 'text' : false;
  }

  showFrontTemplate(): void {
    this.currentPageId = 'front';
    this.selectedCert = this.getTemplateForPage('front');
  }
  
  showBackTemplate(): void {
    this.currentPageId = 'back';
    this.selectedCert = this.getTemplateForPage('back');
  }
  
  getCurrentTemplate(): CertTemplate | null {
    return this.getTemplateForPage(this.currentPageId);
  }
}