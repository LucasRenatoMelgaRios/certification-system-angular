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
      imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3" //aqui agregamos las plantillas iniciales, se pueden eliminar o agregar más
    },
    { 
      id: 2, 
      name: "Certificado Profesional",
      imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
    }
  ];

  // datos de los estudiantes
  certificados: Certificado[] = [
    {
      "iIdCertificado": 56513,
      "iIdDetalle": 79029,
      "codigo": "COD0065-228710",
      "descripcion": null,
      "dateInit": "2024-12-05T17:00:00.000Z",
      "dateFin": "2025-01-06T17:00:00.000Z",
      "dateEmision": "2025-01-07T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 85,
      "ihrlectiva": 120,
      "curso": "COD0065 - QUECHUA CENTRAL - NIVEL BÁSICO",
      "asesora": "Equipo 001 CENAPRO Cesy Alcedo",
      "iIdPersona": 31,
      "estado": "Enviado a WhatsApp",
      "initFormat": "05/12/2024",
      "finFormat": "06/01/2025",
      "emisionFormat": "07/01/2025",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192697,
      "nombre": "Jhonatan Alcides",
      "apellido": "Solís Vilcarima",
      "dni": "70095771",
      "email": "jhonatansv40@gmail.com",
      "telefono": "929432917",
      "ciudad": "Ica",
      "usuario": "70095771",
      "clave": "solis70095771",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56512,
      "iIdDetalle": 79195,
      "codigo": "COD0020-186509",
      "descripcion": null,
      "dateInit": "2024-07-12T16:00:00.000Z",
      "dateFin": "2024-09-13T16:00:00.000Z",
      "dateEmision": "2024-09-14T16:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 0,
      "ihrlectiva": 200,
      "curso": "COD0020 - INNOVACIÓN TECNOLÓGICA EN GESTIÓN DOCUMENTAL Y BIBLIOTECAS",
      "asesora": "Equipo 101 ENACAP Deysi Aranda",
      "iIdPersona": 51,
      "estado": "Certificado Realizado",
      "initFormat": "12/07/2024",
      "finFormat": "13/09/2024",
      "emisionFormat": "14/09/2024",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 20,
      "color": "#fff",
      "background": "#007bff",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192756,
      "nombre": "Katherin Liz",
      "apellido": "Licla López",
      "dni": "72266717",
      "email": "katherin.liclalopez@gmail.com",
      "telefono": "931904680",
      "ciudad": "Ica",
      "usuario": "72266717",
      "clave": "liz72266717",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56510,
      "iIdDetalle": 79194,
      "codigo": "COD0741-643219",
      "descripcion": null,
      "dateInit": "2024-09-17T16:00:00.000Z",
      "dateFin": "2024-11-16T17:00:00.000Z",
      "dateEmision": "2024-11-18T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 0,
      "ihrlectiva": 200,
      "curso": "COD0741 - PSICOLOGÍA EDUCATIVA",
      "asesora": "Equipo 101 ENACAP Deysi Aranda",
      "iIdPersona": 51,
      "estado": "Certificado Realizado",
      "initFormat": "17/09/2024",
      "finFormat": "16/11/2024",
      "emisionFormat": "18/11/2024",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 20,
      "color": "#fff",
      "background": "#007bff",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192756,
      "nombre": "Katherin Liz",
      "apellido": "Licla López",
      "dni": "72266717",
      "email": "katherin.liclalopez@gmail.com",
      "telefono": "931904680",
      "ciudad": "Ica",
      "usuario": "72266717",
      "clave": "liz72266717",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56509,
      "iIdDetalle": 79193,
      "codigo": "COD0651-551605",
      "descripcion": null,
      "dateInit": "2024-11-20T17:00:00.000Z",
      "dateFin": "2025-01-22T17:00:00.000Z",
      "dateEmision": "2025-01-24T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 85,
      "ihrlectiva": 200,
      "curso": "COD0651 - AUXILIAR DE BIBLIOTECA",
      "asesora": "Equipo 101 ENACAP Deysi Aranda",
      "iIdPersona": 51,
      "estado": "Certificado Realizado",
      "initFormat": "20/11/2024",
      "finFormat": "22/01/2025",
      "emisionFormat": "24/01/2025",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 20,
      "color": "#fff",
      "background": "#007bff",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192756,
      "nombre": "Katherin Liz",
      "apellido": "Licla López",
      "dni": "72266717",
      "email": "katherin.liclalopez@gmail.com",
      "telefono": "931904680",
      "ciudad": "Ica",
      "usuario": "72266717",
      "clave": "liz72266717",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56507,
      "iIdDetalle": 79174,
      "codigo": "COD0065-228709",
      "descripcion": null,
      "dateInit": "2024-12-05T17:00:00.000Z",
      "dateFin": "2025-01-06T17:00:00.000Z",
      "dateEmision": "2025-01-07T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BN CODEPER - AGENTE",
      "precio": 65,
      "ihrlectiva": 120,
      "curso": "COD0065 - QUECHUA CENTRAL - NIVEL BÁSICO",
      "asesora": "Equipo 101 CODEPER Luz Mery Aniceto",
      "iIdPersona": 48,
      "estado": "Enviado a WhatsApp",
      "initFormat": "05/12/2024",
      "finFormat": "06/01/2025",
      "emisionFormat": "07/01/2025",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192748,
      "nombre": "Yelina Mayra",
      "apellido": "Rojas Torres",
      "dni": "45313496",
      "email": "yeligem6@gmail.com",
      "telefono": "965094698",
      "ciudad": "Cerro de Pasco",
      "usuario": "45313496",
      "clave": "rojas45313496",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56506,
      "iIdDetalle": 79189,
      "codigo": "COD0751-666501",
      "descripcion": "certificado acelerado",
      "dateInit": "2023-11-25T17:00:00.000Z",
      "dateFin": "2024-01-27T17:00:00.000Z",
      "dateEmision": "2024-01-29T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 0,
      "ihrlectiva": 200,
      "curso": "COD0751 - PLANIFICACIÓN CURRICULAR EN EDUCACIÓN SECUNDARIA",
      "asesora": "Equipo 101 INEPRO Georgina Timoteo",
      "iIdPersona": 118,
      "estado": "Enviado a WhatsApp",
      "initFormat": "25/11/2023",
      "finFormat": "27/01/2024",
      "emisionFormat": "29/01/2024",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192405,
      "nombre": "Mary Milagros",
      "apellido": "González Barbarán de Pereyra",
      "dni": "21143388",
      "email": "migonzalez2176@hotmail.com",
      "telefono": "961695205",
      "ciudad": "Pucallpa",
      "usuario": "21143388",
      "clave": "mary21143388",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56505,
      "iIdDetalle": 79188,
      "codigo": "COD0011-253110",
      "descripcion": "certificado acelerado",
      "dateInit": "2024-02-22T17:00:00.000Z",
      "dateFin": "2024-04-23T16:00:00.000Z",
      "dateEmision": "2024-04-24T16:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 0,
      "ihrlectiva": 200,
      "curso": "COD0011 - TIC EN LA EDUCACIÓN - NIVEL SECUNDARIA",
      "asesora": "Equipo 101 INEPRO Georgina Timoteo",
      "iIdPersona": 118,
      "estado": "Enviado a WhatsApp",
      "initFormat": "22/02/2024",
      "finFormat": "23/04/2024",
      "emisionFormat": "24/04/2024",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192405,
      "nombre": "Mary Milagros",
      "apellido": "González Barbarán de Pereyra",
      "dni": "21143388",
      "email": "migonzalez2176@hotmail.com",
      "telefono": "961695205",
      "ciudad": "Pucallpa",
      "usuario": "21143388",
      "clave": "mary21143388",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56504,
      "iIdDetalle": 79187,
      "codigo": "COD0018-097381",
      "descripcion": "certificado acelerado",
      "dateInit": "2024-11-28T17:00:00.000Z",
      "dateFin": "2025-01-29T17:00:00.000Z",
      "dateEmision": "2025-01-30T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 85,
      "ihrlectiva": 200,
      "curso": "COD0018 - GESTIÓN DE RECURSOS EDUCATIVOS Y MATERIALES DIDÁCTICOS",
      "asesora": "Equipo 101 INEPRO Georgina Timoteo",
      "iIdPersona": 118,
      "estado": "Enviado a WhatsApp",
      "initFormat": "28/11/2024",
      "finFormat": "29/01/2025",
      "emisionFormat": "30/01/2025",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192405,
      "nombre": "Mary Milagros",
      "apellido": "González Barbarán de Pereyra",
      "dni": "21143388",
      "email": "migonzalez2176@hotmail.com",
      "telefono": "961695205",
      "ciudad": "Pucallpa",
      "usuario": "21143388",
      "clave": "mary21143388",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56498,
      "iIdDetalle": 78288,
      "codigo": "COD0025-245847",
      "descripcion": null,
      "dateInit": "2024-08-09T16:00:00.000Z",
      "dateFin": "2024-10-10T16:00:00.000Z",
      "dateEmision": "2024-10-12T16:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 0,
      "ihrlectiva": 200,
      "curso": "COD0025 - TUTORÍA Y ORIENTACIÓN EDUCATIVA",
      "asesora": "Equipo 101 CENAPRO Kora Ordoñez",
      "iIdPersona": 32,
      "estado": "Enviado a WhatsApp",
      "initFormat": "09/08/2024",
      "finFormat": "10/10/2024",
      "emisionFormat": "12/10/2024",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192454,
      "nombre": "Karla Alexandra",
      "apellido": "Santillan Ruiz",
      "dni": "72686505",
      "email": "arka.santillan.15@gmail.com",
      "telefono": "918316686",
      "ciudad": "Iquitos",
      "usuario": "72686505",
      "clave": "karla72686505",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    },
    {
      "iIdCertificado": 56497,
      "iIdDetalle": 78287,
      "codigo": "COD0038-679068",
      "descripcion": null,
      "dateInit": "2024-11-09T17:00:00.000Z",
      "dateFin": "2025-01-08T17:00:00.000Z",
      "dateEmision": "2025-01-10T17:00:00.000Z",
      "dateExpidicion": "2025-02-28T17:00:00.000Z",
      "metodo": "BCP CODEPER - YAPE",
      "precio": 85,
      "ihrlectiva": 200,
      "curso": "COD0038 - AUXILIAR EN EDUCACIÓN",
      "asesora": "Equipo 101 CENAPRO Kora Ordoñez",
      "iIdPersona": 32,
      "estado": "Enviado a WhatsApp",
      "initFormat": "09/11/2024",
      "finFormat": "08/01/2025",
      "emisionFormat": "10/01/2025",
      "expidicionFormat": "28/02/2025",
      "pdfUrl": null,
      "iIdMultiTable": 21,
      "color": "#fff",
      "background": "#04B431",
      "iIdMultiTableCliente": 9,
      "iIdCliente": 192454,
      "nombre": "Karla Alexandra",
      "apellido": "Santillan Ruiz",
      "dni": "72686505",
      "email": "arka.santillan.15@gmail.com",
      "telefono": "918316686",
      "ciudad": "Iquitos",
      "usuario": "72686505",
      "clave": "karla72686505",
      "isEnvio": 0,
      "iIdIdentidad": 1,
      "identidadCodigo": "DNI",
      "identidad": "LIBRETA ELECTORAL",
      "fechaFormat": "28/02/2025"
    }
    
  ];

  certTemplates: CertTemplate[] = [];
  selectedCert: CertTemplate | null = null;
  selectedCertificado: Certificado | null = null;
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

  // Generate draggable items from selected certificate
  handleGenerateItems(): void {
    if (!this.selectedCertificado) return;

    const items: GeneratedItem[] = [
      { id: 'nombre', text: `${this.selectedCertificado.nombre} ${this.selectedCertificado.apellido}`, type: 'text' },
      { id: 'curso', text: this.selectedCertificado.curso, type: 'text' },
      { id: 'horas', text: `${this.selectedCertificado.ihrlectiva} horas lectivas`, type: 'text' }
    ];
    
    if (this.signature) {
      items.push({ id: 'firma', text: 'Firma', type: 'signature' });
    }
    
    this.generatedItems = items;
  }

  // Select a student certificate
  selectStudent(certificado: Certificado): void {
    this.selectedCertificado = certificado;
    this.generatedItems = []; // Clear existing items
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
      
      setTimeout(() => {
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