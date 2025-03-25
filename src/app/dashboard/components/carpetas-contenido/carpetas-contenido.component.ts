import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CarpetaContenido } from '../../interfaces/contenidoCarpeta';
import { RolesUsuario } from '../../../login/interfaces';
import { Auth2Service } from '../../../login/services/auth2.service';
import { CarpetaBase, CarpetasPadre } from '../../interfaces/carpeta.interface';
import { log } from 'console';
import { IndexDbService } from '../../services/indexdb.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoCompartirComponent } from '../dialogo-compartir/dialogo-compartir.component';
import { DialogoDescargarCarpetaComponent } from '../dialogo-descargar-carpeta/dialogo-descargar-carpeta.component';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { DialogoEditarComponent } from '../dialogo-editar/dialogo-editar.component';

@Component({
  selector: 'app-carpetas-contenido',
  templateUrl: './carpetas-contenido.component.html',
  styleUrl: './carpetas-contenido.component.css'
})
export class CarpetasContenidoComponent {
  @Input() tipoVista: 'cuadricula' | 'lista' = 'cuadricula';
  @Input() carpetas: CarpetasPadre[] | CarpetaBase[] = [];
  @Input() rolesUsuario: RolesUsuario[]=[]
  // @Input() hayCarpetaSeleccionada: boolean = false;
  // @Input() carpetaParaCortar: number | null = null;
  // @Input() carpetaParaCopiar: number | null = null;

  private indexdbService = inject(IndexDbService)

  @Output() contextMenu = new EventEmitter<{event: MouseEvent, cod:number}>();

  @Output() carpetaClick = new EventEmitter<CarpetasPadre>();
  //Inyeccion de servicios
  public auth2Service = inject(Auth2Service);


  constructor(public dialog: MatDialog){

  }

  onCarpetaClick(carpeta: CarpetasPadre): void {
    this.carpetaClick.emit(carpeta);


  }

  onContextMenu(event: MouseEvent, cod:number) {
    this.contextMenu.emit({ event, cod });
  }

  // Todo visualizacion de carpetas

  esVisibleUltimoNivel(carpeta:CarpetasPadre):boolean{

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

  esVisible(carpeta:CarpetasPadre):boolean{

    const idOficina = localStorage.getItem('idOficina')
    const role = localStorage.getItem('role')
     // Si la carpeta tiene nivel de visualización 2

  if(role&&idOficina){
    // console.log('entre role oficina');

    if (carpeta.NivelVisualizacion === 2) {
      // console.log('entre porfin');

    // Verificar si el usuario es Administrador
    const esUsuarioAdministrador = +role ===2
    //  ||
    // Verificar si el usuario es inicio como encargado y si pertenece a la oficina



    const esUsuarioOEncargado = +role === 3 && this.rolesUsuario.some(
      (rol)=> +rol.Rol === 3 && +rol.Oficina === +idOficina
    );


    // La carpeta será visible si ambas condiciones se cumplen

    return esUsuarioAdministrador || esUsuarioOEncargado;
  }
  }

  return false;

  }


  get carpetasFiltradas() {
    // console.log(this.carpetas);

    return this.carpetas.filter((carpeta) => {
      switch (carpeta.NivelVisualizacion) {
        case 0:
          return true;
        case 1:
          return true;
        case 2:
          // console.log('hola es privada');

          return this.esVisible(carpeta);
          return true;

        case 3:
          //  return this.esVisibleUltimoNivel(carpeta);
          return true;

        default:
          return false;
      }
    });
  }

    getColor(index: number): string {
      const colors = ['#00BCD4', '#2E7895', '#FDB528', '#51CC28', '#6D788D', '#FF4D49'];
      return colors[index % colors.length];
    }


    openCompartir(){
       const dialogRef = this.dialog.open(DialogoCompartirComponent, {
            width: '900px',
            height: '500px',
            maxWidth: '100%',
            // disableClose: true,
          });
    }

    openDescargar(){
      const dialogRef = this.dialog.open(DialogoDescargarCarpetaComponent, {
           width: '1000px',
           height: '300px',
           maxWidth: '100%',
           // disableClose: true,
         });
   }

   openEditar(){
    const dialogRef = this.dialog.open(DialogoEditarComponent, {
      width: '900px',
      height: '550px',
      maxWidth: '100%',
      // disableClose: true,
    });
   }

}
