import { Injectable } from '@angular/core';
import { Carpeta } from '../interfaces/carpeta.interface';

@Injectable({providedIn: 'root'})
export class PermisosService {
  constructor() { }

  tienePermiso<T extends { permisos?: string[] }>(elementos: T[], permiso: string): boolean {
    // Recorre todos los elementos (carpetas o archivos) y verifica si todos tienen el permiso requerido
    for (const elemento of elementos) {
      // Si alguno no tiene el permiso, retorna false inmediatamente
      if (!elemento.permisos?.includes(permiso)) {
        return false;
      }
    }
    // Si todos los elementos tienen el permiso, retorna true
    return true;
  }

    permisoArrastrar(carpeta:Carpeta,permiso:string):boolean{
    if (carpeta.permisos?.includes(permiso)) {
      return true; // Si encuentra el permiso 'delete', retorna true inmediatamente
    }
    return false
  }
}
