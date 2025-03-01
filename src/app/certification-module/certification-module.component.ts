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
  FormData, 
  DropZone, 
  DroppedItem, 
  GeneratedItem, 
  Signature, 
  CertSize, 
  SelectedElement 
} from '../models/certificate.model';

// Register FilePond plugins
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
})

export class CertificationModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('certificateRef') certificateRef!: ElementRef;
  @ViewChild('certificateContainerRef') certificateContainerRef!: ElementRef;
  @ViewChild('signaturePond') signaturePond!: FilePondComponent;
  @ViewChild('templatePond') templatePond!: FilePondComponent;

  // Add Object to component to make it available in the template
  Object = Object;

  // Initial templates
  initialTemplates: CertTemplate[] = [
    { 
      id: 1, 
      name: "Certificado Básico",
      imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
    },
    { 
      id: 2, 
      name: "Certificado Profesional",
      imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
    }
  ];

  certTemplates: CertTemplate[] = [];
  selectedCert: CertTemplate | null = null;
  formData: FormData = { nombre: "", apellido: "", curso: "" };
  signature: Signature | null = null;
  droppedItems: { [key: string]: DroppedItem } = {};
  dropZones: DropZone[] = [
    { id: 1, label: "a nombre de", position: { x: 50, y: 150 } },
    { id: 2, label: "Curso", position: { x: 50, y: 220 } },
    { id: 3, label: "Firma", position: { x: 200, y: 350 } }
  ];
  generatedItems: GeneratedItem[] = [];
  showAddTemplate: boolean = false;
  newTemplateName: string = "";
  newTemplateImage: { file: File, dataURL: string } | null = null;
  isAddingDropZone: boolean = false;
  newDropZoneLabel: string = "";
  selectedElement: SelectedElement | null = null;
  certSize: CertSize = { width: 1123, height: 794 };
  zoomLevel: number = 1;
  
  // FilePond options
  signatureUploadOptions: FilePondOptions = {
    allowMultiple: false,
    labelIdle: 'DROP HERE',
    acceptedFileTypes: ['image/*'],
    onaddfile: (err: any, fileItem: { file: any; }) => {
      if (err || !fileItem.file) return;
      
      const file = fileItem.file;
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.signature = {
          file: file,
          dataURL: e.target?.result as string
        };
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  templateUploadOptions: FilePondOptions = {
    allowMultiple: false,
    labelIdle: 'Subir imagen de plantilla',
    acceptedFileTypes: ['image/*'],
    onaddfile: (err: any, fileItem: { file: any; }) => {
      if (err || !fileItem.file) return;
      
      const file = fileItem.file;
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.newTemplateImage = {
          file: file,
          dataURL: e.target?.result as string
        };
        console.log("Template image loaded:", this.newTemplateImage);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Dragging state
  draggingItem: GeneratedItem | null = null;
  draggingZone: DropZone | null = null;
  dragStartX: number = 0;
  dragStartY: number = 0;
  dragOffsetX: number = 0;
  dragOffsetY: number = 0;
  dragOverZone: string | null = null;
  
  constructor() {}

  ngOnInit(): void {
    this.loadTemplatesFromStorage();
    if (this.certTemplates.length > 0) {
      this.selectedCert = this.certTemplates[0];
    }
  }

  ngAfterViewInit(): void {
    this.updateCertificateSize();
  }

  // Helper method to check if droppedItems is empty
  hasDroppedItems(): boolean {
    return Object.keys(this.droppedItems).length > 0;
  }

  // Load templates from localStorage
  loadTemplatesFromStorage(): void {
    const storedTemplates = localStorage.getItem('certTemplates');
    this.certTemplates = storedTemplates ? JSON.parse(storedTemplates) : this.initialTemplates;
  }

  // Save templates to localStorage
  saveTemplatesToStorage(): void {
    localStorage.setItem('certTemplates', JSON.stringify(this.certTemplates));
  }

  // Update certificate size based on the selected template image
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

  // Handle form input changes
  handleInputChange(event: Event, field: string): void {
    const target = event.target as HTMLInputElement;
    this.formData = { ...this.formData, [field]: target.value };
  }

  // Generate draggable items from form data
  handleGenerateItems(): void {
    const items: GeneratedItem[] = [];
    
    if (this.formData.nombre) {
      items.push({ id: 'nombre', text: this.formData.nombre, type: 'text' });
    }
    
    if (this.formData.apellido) {
      items.push({ id: 'apellido', text: this.formData.apellido, type: 'text' });
    }
    
    if (this.formData.curso) {
      items.push({ id: 'curso', text: this.formData.curso, type: 'text' });
    }
    
    if (this.signature) {
      items.push({ id: 'firma', text: 'Firma', type: 'signature' });
    }
    
    this.generatedItems = items;
  }

  // Handle dropping items on certificate
  handleDrop(zoneLabel: string, item: GeneratedItem): void {
    this.droppedItems = {
      ...this.droppedItems,
      [zoneLabel]: item
    };
  }

  // Start dragging an item
  startDraggingItem(event: MouseEvent, item: GeneratedItem): void {
    event.preventDefault();
    this.draggingItem = item;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    document.body.style.cursor = 'grabbing';
  }

  // Start dragging a drop zone
  startDraggingZone(event: MouseEvent, zone: DropZone): void {
    event.preventDefault();
    this.draggingZone = zone;
    this.dragOffsetX = event.clientX - zone.position.x;
    this.dragOffsetY = event.clientY - zone.position.y;
    document.body.style.cursor = 'grabbing';
  }

  // Handle mouse move for dragging
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.draggingZone) {
      const newX = event.clientX - this.dragOffsetX;
      const newY = event.clientY - this.dragOffsetY;
      this.handleDropZoneMove(this.draggingZone.id, newX, newY);
    }
    
    if (this.draggingItem) {
      // Check if mouse is over any drop zone
      const certRect = this.certificateRef.nativeElement.getBoundingClientRect();
      
      // Check each drop zone
      for (const zone of this.dropZones) {
        const zoneX = zone.position.x + certRect.left;
        const zoneY = zone.position.y + certRect.top;
        const zoneWidth = 150; // Approximate width of drop zone
        const zoneHeight = 40; // Approximate height of drop zone
        
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

  // Handle mouse up to stop dragging
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

  // Check if a zone is being dragged over
  isDraggedOver(zoneLabel: string): boolean {
    return this.dragOverZone === zoneLabel;
  }

  // Handle drop zone position change
  handleDropZoneMove(id: number, x: number, y: number): void {
    this.dropZones = this.dropZones.map(zone =>
      zone.id === id ? { ...zone, position: { x, y } } : zone
    );
  }

  // Add new certificate template
  handleAddTemplate(): void {
    if (this.newTemplateName.trim() && this.newTemplateImage) {
      const newTemplate: CertTemplate = {
        id: Date.now(),
        name: this.newTemplateName,
        imageUrl: this.newTemplateImage.dataURL
      };
      
      this.certTemplates = [...this.certTemplates, newTemplate];
      this.selectedCert = newTemplate;
      this.newTemplateName = "";
      this.newTemplateImage = null;
      this.showAddTemplate = false;
      this.saveTemplatesToStorage();
      this.updateCertificateSize();
      
      // Instead of trying to access the private pond property,
      // we'll just set a new empty array to the templateUploadOptions
      // and then force a refresh of the component
      setTimeout(() => {
        // This will effectively reset the FilePond component
        this.templateUploadOptions = {
          ...this.templateUploadOptions,
          files: []
        };
      }, 0);
    }
  }

  // Handle file upload for signature
  handleFileUpload(fileItems: any[]): void {
    if (fileItems && fileItems.length > 0) {
      const fileItem = fileItems[0];
      const file = fileItem.file;
      
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.signature = {
          file: file,
          dataURL: e.target?.result as string
        };
      };
      
      reader.readAsDataURL(file);
    } else {
      this.signature = null;
    }
  }

  // Handle template image upload
  handleTemplateImageUpload(fileItems: any[]): void {
    if (fileItems && fileItems.length > 0) {
      const fileItem = fileItems[0];
      const file = fileItem.file;
      
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.newTemplateImage = {
          file: file,
          dataURL: e.target?.result as string
        };
      };
      
      reader.readAsDataURL(file);
    } else {
      this.newTemplateImage = null;
    }
  }

  // Export certificate as PDF
  handleExportPDF(): void {
    if (!this.certificateRef?.nativeElement || this.certSize.width === 0 || this.certSize.height === 0) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [this.certSize.width, this.certSize.height]
    });

    // Add background image
    if (this.selectedCert?.imageUrl) {
      try {
        doc.addImage(this.selectedCert.imageUrl, 'JPEG', 0, 0, this.certSize.width, this.certSize.height);
      } catch (error) {
        console.error("Error al agregar la imagen de fondo al PDF:", error);
      }
    }

    // Add dropped items
    Object.entries(this.droppedItems).forEach(([zoneLabel, item]) => {
      const zone = this.dropZones.find(z => z.label === zoneLabel);
      if (zone) {
        const xPos = zone.position.x;
        const yPos = zone.position.y + 30;

        doc.setFontSize(24);

        if (item.type === 'signature' && this.signature) {
          try {
            const sigWidth = 150;
            const sigHeight = 75;
            doc.addImage(this.signature.dataURL, 'PNG', xPos, yPos, sigWidth, sigHeight);
          } catch (error) {
            console.error("Error al agregar la firma al PDF:", error);
          }
        } else {
          doc.text(item.text, xPos, yPos);
        }
      }
    });

    // Save the PDF
    if (this.selectedCert) {
      doc.save(`certificado_${this.selectedCert.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } else {
      doc.save('certificado.pdf');
    }
  }

  // Add new drop zone
  handleAddDropZone(): void {
    if (this.newDropZoneLabel.trim()) {
      const newDropZone: DropZone = {
        id: Date.now(),
        label: this.newDropZoneLabel,
        position: { x: 100, y: 100 }
      };
      
      this.dropZones = [...this.dropZones, newDropZone];
      this.newDropZoneLabel = "";
      this.isAddingDropZone = false;
    }
  }

  // Remove drop zone
  handleRemoveDropZone(id: number): void {
    const zoneToRemove = this.dropZones.find(zone => zone.id === id);
    if (zoneToRemove) {
      const { [zoneToRemove.label]: _, ...updatedDroppedItems } = this.droppedItems;
      this.droppedItems = updatedDroppedItems;
    }

    this.dropZones = this.dropZones.filter(zone => zone.id !== id);

    // Clear selection if the removed zone was selected
    if (this.selectedElement && this.selectedElement.type === 'dropZone' && this.selectedElement.id === id) {
      this.selectedElement = null;
    }
  }

  // Handle selecting an element for keyboard movement
  handleSelectElement(type: string, id: number | string): void {
    this.selectedElement = { type, id };
  }

  // Handle keyboard events for moving selected elements
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.selectedElement) return;

    const step = event.shiftKey ? 10 : 5;
    let newX, newY;

    if (this.selectedElement.type === 'dropZone') {
      const zone = this.dropZones.find(z => z.id === this.selectedElement?.id);
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

  // Delete template
  handleDeleteTemplate(id: number): void {
    if (this.certTemplates.length <= 1) {
      alert("Debe haber al menos una plantilla de certificado.");
      return;
    }

    this.certTemplates = this.certTemplates.filter(template => template.id !== id);

    // If the deleted template is the selected one, select another
    if (this.selectedCert && this.selectedCert.id === id) {
      this.selectedCert = this.certTemplates[0];
      this.updateCertificateSize();
    }

    this.saveTemplatesToStorage();
  }

  // Select certificate template
  selectTemplate(cert: CertTemplate): void {
    this.selectedCert = cert;
    this.updateCertificateSize();
  }

  // Check if an item is dropped in a zone
  isItemDroppedInZone(zoneLabel: string): boolean {
    return !!this.droppedItems[zoneLabel];
  }

  // Get content for a drop zone
  getDropZoneContent(zoneLabel: string): string | null {
    const item = this.droppedItems[zoneLabel];
    if (!item) return null;
    
    if (item.type === 'signature' && this.signature) {
      return 'signature';
    }
    
    return item.text;
  }

  // Zoom in
  handleZoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
  }

  // Zoom out
  handleZoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
  }
}