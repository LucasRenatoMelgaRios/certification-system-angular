import { Routes } from '@angular/router';
import { CertificationModuleComponent } from './certification-module/certification-module.component'; // ✅ Importa el componente

export const routes: Routes = [
  { path: '', component: CertificationModuleComponent }, // ✅ Agrega el componente a la ruta raíz
];
