import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CarpetaContenido } from '../../interfaces/contenidoCarpeta';
import { RolesUsuario } from '../../../login/interfaces';
import { Auth2Service } from '../../../login/services/auth2.service';

@Component({
  selector: 'app-carpetas-contenido',
  templateUrl: './carpetas-contenido.component.html',
  styleUrl: './carpetas-contenido.component.css'
})
export class CarpetasContenidoComponent {
  @Input() carpetas: CarpetaContenido[] = [];
  @Input() rolesUsuario: RolesUsuario[]=[]
  // @Input() hayCarpetaSeleccionada: boolean = false;
  // @Input() carpetaParaCortar: number | null = null;
  // @Input() carpetaParaCopiar: number | null = null;

  @Output() contextMenu = new EventEmitter<{event: MouseEvent, carpeta: CarpetaContenido}>();

  //Inyeccion de servicios
  public auth2Service = inject(Auth2Service);


  onContextMenu(event: MouseEvent, carpeta: CarpetaContenido) {
    this.contextMenu.emit({ event, carpeta });
  }

  // Todo visualizacion de carpetas

  esVisibleUltimoNivel(carpeta:CarpetaContenido):boolean{

    const role = localStorage.getItem('role')
    const idOficina = localStorage.getItem('idOficina')
    const idUsuario = this.auth2Service.currentUSer2()?.Cod

    if(role && idOficina)
    if(carpeta.NivelVisualizacion === 3){
      const esAdmin = +role ===2
      // Verificar si el usuario tiene un rol válido en la oficina correspondiente
    const perteneceOficina = this.rolesUsuario.some(
      (rol) => rol.Rol === 3 && rol.Oficina === +idOficina

    );

    const esDelegado = idUsuario === carpeta.Delegado;
      return esAdmin || perteneceOficina || esDelegado;
    }

    return false;
  }

  esVisible(carpeta:CarpetaContenido):boolean{
    const idOficina = localStorage.getItem('idOficina')
    const role = localStorage.getItem('role')
     // Si la carpeta tiene nivel de visualización 2

  if(role && idOficina)

    if (carpeta.NivelVisualizacion === 2) {
    // Verificar si el usuario es Administrador
    const esUsuarioAdministrador = +role ===2
    //  ||
    // Verificar si el usuario es inicio como encargado y si pertenece a la oficina
    const esUsuarioOEncargado = +role === 3 && this.rolesUsuario.some(
      (rol)=> rol.Rol === 3 && rol.Oficina === +idOficina
    );

    // La carpeta será visible si ambas condiciones se cumplen
    return esUsuarioAdministrador || esUsuarioOEncargado;
  }

  return false;

  }


  get carpetasFiltradas() {
    return this.carpetas.filter((carpeta) => {
      switch (carpeta.NivelVisualizacion) {
        case 0:
          return true;
        case 1:
          return true;
        case 2:
          return this.esVisible(carpeta);
        case 3:
          return this.esVisibleUltimoNivel(carpeta);
        default:
          return false;
      }
    });
  }
}
