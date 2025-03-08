export interface CertTemplate {
  id: number;
  name: string;
  imageUrl: string;
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
  label: string;
  position: { x: number; y: number };
}

export interface DroppedItem {
  id: string;
  text: string;
  type: string;
}

export interface GeneratedItem {
  id: string;
  text: string;
  type: string;
}

export interface Signature {
  file: File;
  dataURL: string;
}

export interface CertSize {
  width: number;
  height: number;
}

export interface SelectedElement {
  type: string;
  id: number | string;
}