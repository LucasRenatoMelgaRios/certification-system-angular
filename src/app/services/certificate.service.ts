import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertTemplate } from '../models/certificate.model';
import { Certificado } from '../models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiTemplatesUrl = 'https://67e2eb6f97fc65f5353824c6.mockapi.io/certificados';
  private apiStudentsUrl = 'https://67e2eb6f97fc65f5353824c6.mockapi.io/estudiante';

  constructor(private http: HttpClient) { }

  // Obtener todas las plantillas de certificados
  getTemplates(): Observable<CertTemplate[]> {
    return this.http.get<CertTemplate[]>(this.apiTemplatesUrl);
  }

  // Obtener plantilla por ID
  getTemplateById(id: number): Observable<CertTemplate> {
    return this.http.get<CertTemplate>(`${this.apiTemplatesUrl}/${id}`);
  }

  // Obtener plantillas por tipo de página
  getTemplatesByPageType(pageType: 'front' | 'back'): Observable<CertTemplate[]> {
    return this.http.get<CertTemplate[]>(`${this.apiTemplatesUrl}?pageType=${pageType}`);
  }

  // Obtener datos del estudiante
  getStudentData(): Observable<Certificado[]> {
    return this.http.get<Certificado[]>(this.apiStudentsUrl);
  }

  // Obtener estudiante por ID
  getStudentById(id: number): Observable<Certificado> {
    return this.http.get<Certificado>(`${this.apiStudentsUrl}/${id}`);
  }

  // Obtener estudiantes por tipo de certificado
  getStudentsByType(type: 'certificado' | 'diplomado'): Observable<Certificado[]> {
    return this.http.get<Certificado[]>(`${this.apiStudentsUrl}?tipo=${type}`);
  }
}