export interface CertTemplate {
    id: number;
    name: string;
    imageUrl: string;
  }
  
  export interface FormData {
    nombre: string;
    apellido: string;
    curso: string;
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