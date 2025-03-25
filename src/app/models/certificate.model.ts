export interface CertTemplate {
  id: number;
  name: string;
  imageUrl: string;
  pageType?: 'front' | 'back'; // Nueva propiedad para identificar tipo de página
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
  tipo: "certificado" | "diplomado";
}

export interface DropZone {
  id: number;
  label: string;
  position: { x: number; y: number };
  pageId?: 'front' | 'back'; // Nueva propiedad para asociar zona a página
}

export interface DroppedItem {
  id: string;
  text: string;
  type: 'text' | 'signature';
  signatureIndex?: number;
  color?: string;
  pageId?: 'front' | 'back'; // Nueva propiedad para asociar item a página
}

export interface GeneratedItem {
  id: string;
  text: string;
  type: 'text' | 'signature';
  signatureIndex?: number;
  color?: string;
  // No necesita pageId ya que son elementos compartidos
}

export interface Signature {
  id: number;
  file: File;
  dataURL: string;
  label: string;
}

export interface CertSize {
  width: number;
  height: number;
}

export interface SelectedElement {
  type: 'dropZone' | 'item';
  id: number | string;
  pageId?: 'front' | 'back'; // Nueva propiedad para contexto de selección
}

// Nueva interfaz para el estado por página
export interface PageState {
  dropZones: DropZone[];
  droppedItems: { [key: string]: DroppedItem };
  selectedElement?: SelectedElement | null;
}

// Tipo para mapeo de estados de página
export type PageStates = {
  front: PageState;
  back: PageState;
};