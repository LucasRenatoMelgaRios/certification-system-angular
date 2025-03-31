import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CertTemplate, Certificado, ConfigApiResponse, CERTIFICATE_LAYOUTS } from '../models/certificate.model';
import { switchMap } from 'rxjs/operators'; // Añadir este import

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiTemplatesUrl = 'https://67e2eb6f97fc65f5353824c6.mockapi.io/certificados'; // Actualiza con tu endpoint real
  private apiStudentsUrl = 'https://67e2eb6f97fc65f5353824c6.mockapi.io/estudiante'; // Actualiza con tu endpoint real
  private apiConfigUrl = 'https://67e8c749bdcaa2b7f5b7caf8.mockapi.io/config-templates';

  constructor(private http: HttpClient) { }

saveGlobalConfig(configToAdd: any): Observable<any> {
  const configId = "1";
  
  return this.http.get<any>(`${this.apiConfigUrl}/${configId}`).pipe(
    switchMap(existingResponse => { // Usando switchMap correctamente
      const existingConfig = existingResponse.configTemplate 
        ? JSON.parse(existingResponse.configTemplate) 
        : {};

      const mergedConfig = {
        ...existingConfig,
        ...configToAdd
      };

      return this.http.put(`${this.apiConfigUrl}/${configId}`, {
        id: configId,
        configTemplate: JSON.stringify(mergedConfig),
        updatedAt: new Date().toISOString()
      });
    }),
    catchError(err => {
      return this.http.post(this.apiConfigUrl, {
        id: configId,
        configTemplate: JSON.stringify(configToAdd),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    })
  );
}

getGlobalConfig(): Observable<any> {
  const configId = "1";
  return this.http.get<any>(`${this.apiConfigUrl}/${configId}`).pipe(
    map(response => {
      try {
        return response.configTemplate 
          ? JSON.parse(response.configTemplate) 
          : {};
      } catch {
        return {};
      }
    }),
    catchError(() => of({})) // Devuelve objeto vacío si hay error
  );
}
  /**
   * Obtiene todas las plantillas de certificados y las adapta al modelo interno
   */
  getTemplates(): Observable<CertTemplate[]> {
    return this.http.get<any[]>(this.apiTemplatesUrl).pipe(
      map(templates => templates.map(template => this.mapToCertTemplate(template)))
    );
  }

  /**
   * Obtiene plantilla por ID
   */
  getTemplateById(id: number): Observable<CertTemplate> {
    return this.http.get<any>(`${this.apiTemplatesUrl}/${id}`).pipe(
      map(template => this.mapToCertTemplate(template)))
  }

  /**
   * Obtiene plantillas por tipo de página (front/back)
   */
  getTemplatesByPageType(pageType: 'front' | 'back'): Observable<CertTemplate[]> {
    return this.getTemplates().pipe(
      map(templates => templates.filter(t => t.pageType === pageType)))
  }

  /**
   * Obtiene datos del estudiante y los adapta al modelo interno
   */
  getStudentData(): Observable<Certificado[]> {
    return this.http.get<any[]>(this.apiStudentsUrl).pipe(
      map(students => students.map(student => this.mapToCertificado(student))))
  }

  /**
   * Obtiene estudiante por ID
   */
  getStudentById(id: number): Observable<Certificado> {
    return this.http.get<any>(`${this.apiStudentsUrl}/${id}`).pipe(
      map(student => this.mapToCertificado(student)))
  }

  /**
   * Mapea los datos de la API al modelo CertTemplate
   */
  private mapToCertTemplate(apiTemplate: any): CertTemplate {
    return {
      iIdPlantilla: apiTemplate.iIdPlantilla,
      iIdTPlantilla: apiTemplate.iIdTPlantilla,
      iIdCurso: apiTemplate.iIdCurso,
      codigo: apiTemplate.codigo,
      descripcion: apiTemplate.descripcion,
      cloudUrl: apiTemplate.cloudUrl,
      cloudKey: apiTemplate.cloudKey,
      fechaFormat: apiTemplate.fechaFormat,
      // Campos calculados
      pageType: apiTemplate.descripcion === 'REVERSO' ? 'back' : 'front',
      hasSignature: apiTemplate.codigo === 'CNF',
      // Mantener compatibilidad con campos antiguos
      id: apiTemplate.iIdPlantilla,
      name: apiTemplate.descripcion,
      imageUrl: apiTemplate.cloudUrl,
      dimensions: { width: 1123, height: 794 } // Puedes obtener esto de la API si está disponible
    };
  }

  /**
   * Mapea los datos de la API al modelo Certificado
   */
  private mapToCertificado(apiStudent: any): Certificado {
    return {
      // Campos del nuevo formato
      iIdCertificado: apiStudent.iIdCertificado,
      iIdDetalle: apiStudent.iIdDetalle,
      iIdCurso: apiStudent.iIdCurso,
      codigo: apiStudent.codigo,
      descripcion: apiStudent.descripcion,
      dateInit: apiStudent.dateInit,
      dateFin: apiStudent.dateFin,
      dateEmision: apiStudent.dateEmision,
      dateExpidicion: apiStudent.dateExpidicion,
      metodo: apiStudent.metodo,
      precio: apiStudent.precio,
      ihrlectiva: apiStudent.ihrlectiva,
      curso: apiStudent.curso,
      asesora: apiStudent.asesora,
      iIdPersona: apiStudent.iIdPersona,
      estado: apiStudent.estado,
      initFormat: apiStudent.initFormat,
      finFormat: apiStudent.finFormat,
      emisionFormat: apiStudent.emisionFormat,
      expidicionFormat: apiStudent.expidicionFormat,
      pdfUrl: apiStudent.pdfUrl,
      iIdMultiTable: apiStudent.iIdMultiTable,
      color: apiStudent.color,
      background: apiStudent.background,
      iIdMultiTableCliente: apiStudent.iIdMultiTableCliente,
      iIdCliente: apiStudent.iIdCliente,
      nombre: apiStudent.nombre,
      apellido: apiStudent.apellido,
      dni: apiStudent.dni,
      email: apiStudent.email,
      telefono: apiStudent.telefono,
      ciudad: apiStudent.ciudad,
      usuario: apiStudent.usuario,
      clave: apiStudent.clave,
      isEnvio: apiStudent.isEnvio,
      iIdIdentidad: apiStudent.iIdIdentidad,
      identidadCodigo: apiStudent.identidadCodigo,
      identidad: apiStudent.identidad,
      fechaFormat: apiStudent.fechaFormat,
      // Campos con valores por defecto
      nota: apiStudent.nota || 'Aprobado'
    };
  }

  /**
   * Obtiene plantillas frontales con o sin firma según parámetro
   */
  getFrontTemplates(hasSignature: boolean): Observable<CertTemplate[]> {
    const code = hasSignature ? 'CNF' : 'SNF';
    return this.getTemplates().pipe(
      map(templates => templates.filter(t => 
        t.pageType === 'front' && t.codigo === code
      ))
    );
  }

  /**
   * Obtiene plantilla trasera (REVERSO)
   */
  getBackTemplate(): Observable<CertTemplate | undefined> {
    return this.getTemplates().pipe(
      map(templates => templates.find(t => t.pageType === 'back'))
    );
  }
}