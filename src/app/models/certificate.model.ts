export interface CertTemplate {
  // Campos del nuevo formato de API
  iIdPlantilla: number;
  iIdTPlantilla: number;
  iIdCurso: number;
  codigo: 'CNF' | 'SNF' | 'REV'; // CNF=Con firma, SNF=Sin firma, REV=Reverso
  descripcion: string;
  cloudUrl: string;
  cloudKey: string;
  fechaFormat: string;

  // Campos del modelo original (mantenidos para compatibilidad)
  id: number;              // Mapeado desde iIdPlantilla
  name: string;            // Mapeado desde descripcion
  imageUrl: string;        // Mapeado desde cloudUrl
  pageType: 'front' | 'back'; // Calculado: 'back' si descripcion es 'REVERSO', sino 'front'
  hasSignature: boolean;   // Calculado: true si codigo es 'CNF'

  // Dimensiones opcionales
  dimensions?: {
    width: number;
    height: number;
  };

  // Campos adicionales útiles para la UI
  isDefault?: boolean;
  thumbnailUrl?: string;   // URL alternativa para thumbnails
}
export interface Certificado {
  // Campos del nuevo formato
  iIdCertificado: number;
  iIdDetalle: number;
  iIdCurso: number; // <-- Nuevo campo añadido
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
  configTemplate?: string; // Nuevo campo para almacenar configuraciones

  // Campos opcionales
  nota?: string | number; // Puede ser string o number según la API
  
  // Campos adicionales para compatibilidad
  // (si necesitas mantener compatibilidad con versiones anteriores)
  iIdCertificadoOriginal?: number; // Ejemplo de campo alternativo
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
  textColor: string;
  fontFamily: string;
  customText?: string;
  customPrefix?: string;
  customSuffix?: string;
  isItalic?: boolean; // Nueva propiedad
  fontSize: number; // Nueva propiedad
  lineBreaks: number;

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

// export const CERTIFICATE_LAYOUTS: { [key: string]: PageLayout } = {
//   curso: {
//     front: [
//       { id: 1, fieldKey: 'nombre', position: { x: 50, y: 150 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 2, fieldKey: 'curso', position: { x: 50, y: 220 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 3, fieldKey: 'descripcion', position: { x: 50, y: 290 }, pageId: 'front', type: 'dates', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 4, fieldKey: 'ihrlectiva', position: { x: 50, y: 360 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 5, fieldKey: 'emisionFormat', position: { x: 50, y: 430 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 }
//     ],
//     back: [
//       { id: 6, fieldKey: 'fechaFormat', position: { x: 50, y: 150 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 7, fieldKey: 'nombre', position: { x: 50, y: 220 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 8, fieldKey: 'dni', position: { x: 50, y: 290 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 9, fieldKey: 'codigo', position: { x: 50, y: 360 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 10, fieldKey: 'iIdCertificado', position: { x: 50, y: 430 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 }
//     ]
//   },
//   diplomado: {
//     front: [
//       { id: 11, fieldKey: 'nombre', position: { x: 50, y: 150 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 12, fieldKey: 'curso', position: { x: 50, y: 220 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 13, fieldKey: 'descripcion', position: { x: 50, y: 290 }, pageId: 'front', type: 'dates', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 14, fieldKey: 'ihrlectiva', position: { x: 50, y: 360 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 15, fieldKey: 'emisionFormat', position: { x: 50, y: 430 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 }
//     ],
//     back: [
//       { id: 16, fieldKey: 'fechaFormat', position: { x: 50, y: 150 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 17, fieldKey: 'nombre', position: { x: 50, y: 220 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 18, fieldKey: 'dni', position: { x: 50, y: 290 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 19, fieldKey: 'codigo', position: { x: 50, y: 360 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 20, fieldKey: 'iIdCertificado', position: { x: 50, y: 430 }, pageId: 'back', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 }
//     ]
//   },
//   constancia: {
//     front: [
//       { id: 21, fieldKey: 'descripcion', position: { x: 50, y: 150 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 22, fieldKey: 'descripcion2', position: { x: 50, y: 220 }, pageId: 'front', type: 'dates', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 23, fieldKey: 'nota', position: { x: 50, y: 290 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 },
//       { id: 24, fieldKey: 'emisionFormat', position: { x: 50, y: 360 }, pageId: 'front', type: 'text', textColor: 'black', fontFamily: 'Arial', fontSize: 52 }
//     ],
//     back: []
//   }
// };