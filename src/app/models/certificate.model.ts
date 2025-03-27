export interface CertTemplate {
  id: number;
  name: string;
  imageUrl: string;
  pageType: 'front' | 'back';
  hasSignature: boolean;
}

export interface Certificado {
  iIdCertificado: number;
  iIdDetalle: number;
  codigo: string;
  descripcion: string | null;
  dateInit: string;
  dateFin: string;
  dateEmision: string;
  dateExpidicion: string;
  metodo: string;
  precio: number;
  ihrlectiva: number;
  curso: string;
  asesora: string;
  iIdPersona: number;
  estado: string;
  initFormat: string;
  finFormat: string;
  emisionFormat: string;
  expidicionFormat: string;
  pdfUrl: string | null;
  iIdMultiTable: number;
  color: string;
  background: string;
  iIdMultiTableCliente: number;
  iIdCliente: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  ciudad: string;
  usuario: string;
  clave: string;
  isEnvio: number;
  iIdIdentidad: number;
  identidadCodigo: string;
  identidad: string;
  fechaFormat: string;
  nota?: string;
}

export interface DropZone {
  id: number;
  fieldKey: string;
  position: {
    x: number;
    y: number;
  };
  pageId: 'front' | 'back';
  hidden?: boolean;
  type: 'text' | 'dates';
  textColor?: string;  // Added property
  fontFamily?: string; // Added property
}

export interface DroppedItem {
  id: string;
  text: string;
  type: 'text' | 'signature';
  color?: string;
  signatureIndex?: number;
  pageId?: 'front' | 'back';
}

export interface CertSize {
  width: number;
  height: number;
}

export interface PageState {
  dropZones: DropZone[];
  droppedItems: { [key: string]: DroppedItem };
  selectedElement: {
    type: 'dropZone' | 'item';
    id: number | string;
    pageId: 'front' | 'back';
  } | null;
}

export interface PageStates {
  front: PageState;
  back: PageState;
}

export interface PageLayout {
  front: DropZone[];
  back: DropZone[];
}

export const AVAILABLE_FONTS = [
  'EngraversGothic BT',
  'Maratre',
  'Bahnschrift',
  'Calibri',
  'Times New Roman',
  'Italianno',
  'Roboto',
  'PaddingtonSC',
  'Romanesque Serif',
  'BernhardMod BT',
  'Arial'
];

export const CERTIFICATE_LAYOUTS: { [key: string]: PageLayout } = {
  curso: {
    front: [
      { id: 1, fieldKey: 'nombre', position: { x: 50, y: 150 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 2, fieldKey: 'curso', position: { x: 50, y: 220 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 3, fieldKey: 'descripcion', position: { x: 50, y: 290 }, pageId: 'front', type: 'dates', textColor: 'black', fontFamily: 'Arial' },
      { id: 4, fieldKey: 'ihrlectiva', position: { x: 50, y: 360 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 5, fieldKey: 'emisionFormat', position: { x: 50, y: 430 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' }
    ],
    back: [
      { id: 6, fieldKey: 'fechaFormat', position: { x: 50, y: 150 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 7, fieldKey: 'nombre', position: { x: 50, y: 220 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 8, fieldKey: 'dni', position: { x: 50, y: 290 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 9, fieldKey: 'codigo', position: { x: 50, y: 360 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 10, fieldKey: 'iIdCertificado', position: { x: 50, y: 430 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' }
    ]
  },
  diplomado: {
    front: [
      { id: 11, fieldKey: 'nombre', position: { x: 50, y: 150 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 12, fieldKey: 'curso', position: { x: 50, y: 220 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 13, fieldKey: 'descripcion', position: { x: 50, y: 290 }, pageId: 'front', type: 'dates', textColor: 'black', fontFamily: 'Arial' },
      { id: 14, fieldKey: 'ihrlectiva', position: { x: 50, y: 360 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 15, fieldKey: 'emisionFormat', position: { x: 50, y: 430 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' }
    ],
    back: [
      { id: 16, fieldKey: 'fechaFormat', position: { x: 50, y: 150 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 17, fieldKey: 'nombre', position: { x: 50, y: 220 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 18, fieldKey: 'dni', position: { x: 50, y: 290 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 19, fieldKey: 'codigo', position: { x: 50, y: 360 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 20, fieldKey: 'iIdCertificado', position: { x: 50, y: 430 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial' }
    ]
  },
  constancia: {
    front: [
      { id: 21, fieldKey: 'descripcion', position: { x: 50, y: 150 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 22, fieldKey: 'descripcion2', position: { x: 50, y: 220 }, pageId: 'front', type: 'dates', textColor: 'black', fontFamily: 'Arial' },
      { id: 23, fieldKey: 'nota', position: { x: 50, y: 290 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' },
      { id: 24, fieldKey: 'emisionFormat', position: { x: 50, y: 360 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial' }
    ],
    back: []
  }
};