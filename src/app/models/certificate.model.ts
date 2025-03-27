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
}

export interface DropZone {
  id: number;
  fieldKey: string;  // Cambiado de 'label' a 'fieldKey'
  position: {
    x: number;
    y: number;
  };
  pageId: 'front' | 'back';
  hidden?: boolean;
  type: 'text' | 'dates';
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

export const CERTIFICATE_LAYOUTS: { [key: string]: PageLayout } = {
  curso: {
    front: [
      { id: 1, fieldKey: 'nombre', position: { x: 50, y: 150 }, pageId: 'front', type: 'text' },
      { id: 2, fieldKey: 'curso', position: { x: 50, y: 220 }, pageId: 'front', type: 'text' },
      { id: 3, fieldKey: 'descripcion', position: { x: 50, y: 290 }, pageId: 'front', type: 'dates' },
      { id: 4, fieldKey: 'ihrlectiva', position: { x: 50, y: 360 }, pageId: 'front', type: 'text' },
      { id: 5, fieldKey: 'emisionFormat', position: { x: 50, y: 430 }, pageId: 'front', type: 'text' }
    ],
    back: [
      { id: 6, fieldKey: 'fechaFormat', position: { x: 50, y: 150 }, pageId: 'back', type: 'text' },
      { id: 7, fieldKey: 'nombre', position: { x: 50, y: 220 }, pageId: 'back', type: 'text' },
      { id: 8, fieldKey: 'dni', position: { x: 50, y: 290 }, pageId: 'back', type: 'text' },
      { id: 9, fieldKey: 'codigo', position: { x: 50, y: 360 }, pageId: 'back', type: 'text' },
      { id: 10, fieldKey: 'iIdCertificado', position: { x: 50, y: 430 }, pageId: 'back', type: 'text' }
    ]
  },
  diplomado: {
    front: [
      { id: 11, fieldKey: 'nombre', position: { x: 50, y: 150 }, pageId: 'front', type: 'text' },
      { id: 12, fieldKey: 'curso', position: { x: 50, y: 220 }, pageId: 'front', type: 'text' },
      { id: 13, fieldKey: 'descripcion', position: { x: 50, y: 290 }, pageId: 'front', type: 'dates' },
      { id: 14, fieldKey: 'ihrlectiva', position: { x: 50, y: 360 }, pageId: 'front', type: 'text' },
      { id: 15, fieldKey: 'emisionFormat', position: { x: 50, y: 430 }, pageId: 'front', type: 'text' }
    ],
    back: [
      { id: 16, fieldKey: 'fechaFormat', position: { x: 50, y: 150 }, pageId: 'back', type: 'text' },
      { id: 17, fieldKey: 'nombre', position: { x: 50, y: 220 }, pageId: 'back', type: 'text' },
      { id: 18, fieldKey: 'dni', position: { x: 50, y: 290 }, pageId: 'back', type: 'text' },
      { id: 19, fieldKey: 'codigo', position: { x: 50, y: 360 }, pageId: 'back', type: 'text' },
      { id: 20, fieldKey: 'iIdCertificado', position: { x: 50, y: 430 }, pageId: 'back', type: 'text' }
    ]
  }
};