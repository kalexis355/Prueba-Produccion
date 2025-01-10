import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Archivo, Carpeta } from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';
import { ToastService } from '../../services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogModule, DialogRef } from '@angular/cdk/dialog';
import { DialogoCambiarNombreComponent } from '../dialogo-cambiar-nombre/dialogo-cambiar-nombre.component';
import Swal from 'sweetalert2';
import { DialogoCompartirComponent } from '../dialogo-compartir/dialogo-compartir.component';
import { PermisosService } from '../../services/permisos.service';
import { CheckBoxService } from '../../services/checkBox.service';

@Component({
  selector: 'app-opciones-carpeta',
  templateUrl: './opciones-carpeta.component.html',
  styleUrl: './opciones-carpeta.component.css',
})
export class OpcionesCarpetaComponent implements OnInit, OnChanges {

  @Input()
  public carpetasSeleccionadas?: Carpeta[];

  @Input()
  public archivosSeleccionados?:Archivo[];

  public archivosTotal: (Archivo | Carpeta)[] = [];

  public dashService = inject(DashboardService);
  public permisoService = inject(PermisosService)
  public checkService = inject(CheckBoxService)
  public toast = inject(ToastService);
  public dialogo = inject(MatDialog);



  mostrarBotonEliminar:boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.archivosTotal = [...(this.carpetasSeleccionadas || []), ...(this.archivosSeleccionados || [])];
    this.checkService.archivosTotal.set(this.archivosTotal)
  }

  ngOnInit(): void {

  }

  abrirDialogoCompartir(){
    const dialogoReferente = this.dialogo.open(DialogoCompartirComponent);
    dialogoReferente.afterClosed().subscribe((nombre) => {
      if (nombre !== undefined && nombre !== '' && this.carpetasSeleccionadas) {
        console.log(this.carpetasSeleccionadas[0].id);
        this.dashService.cambiarNombreCarpeta(
          this.carpetasSeleccionadas[0].id!,
          nombre
        );
        if (this.dashService.nombreIgual) {
          Swal.fire('Error', 'El nombre ya existe', 'error');
        } else {
          Swal.fire('Exito', 'Nombre de la carpeta cambiado', 'success');
        }
      }
    });
  }


  abrirDialogo() {
    const dialogoReferente = this.dialogo.open(DialogoCambiarNombreComponent);

    dialogoReferente.afterClosed().subscribe((nombre) => {
      if(nombre !== undefined && nombre !== '' && this.carpetasSeleccionadas && this.carpetasSeleccionadas.length>0){
        this.dashService.cambiarNombreCarpeta(
              this.carpetasSeleccionadas[0].id!,
              nombre
            );
            if (this.dashService.nombreIgual) {
              Swal.fire('Error', 'El nombre ya existe', 'error');
            } else {
              Swal.fire('Exito', 'Nombre de la carpeta cambiado', 'success');
            }
      }

      if(nombre !== undefined && nombre !== '' && this.archivosSeleccionados){
        if(this.archivosSeleccionados.length>0){
          const idPadre = this.archivosSeleccionados[0].padreId!
          const idArchivo = this.archivosSeleccionados[0].id

          this.dashService.cambiarNombreArchivo(idPadre,idArchivo,nombre)
          if (this.dashService.nombreIgual) {
            Swal.fire('Error', 'El nombre ya existe', 'error');
          } else {
            Swal.fire('Exito', 'Nombre de la carpeta cambiado', 'success');
          }
        }
      }

    });
  }

  descargarCarpetas() {
    console.log('hola');

    this.dashService.descargarCarpetasSeleccionadas();
  }

  public borrarCarpetas(): void {
    let cantidadCarpetasEliminadas = 0;
    let cantidadArchivosEliminados = 0;

    // Verificar si hay carpetas seleccionadas
    if (this.carpetasSeleccionadas && this.carpetasSeleccionadas.length > 0) {
      cantidadCarpetasEliminadas = this.dashService.borrarCarpetas(this.carpetasSeleccionadas.map(carpeta => carpeta.id!));
    }

    // Verificar si hay archivos seleccionados
    if (this.archivosSeleccionados && this.archivosSeleccionados.length > 0) {
      cantidadArchivosEliminados = this.dashService.borrarArchivos(this.archivosSeleccionados.map(archivo => archivo.id));
    }

    // Mostrar mensaje si se eliminó al menos un elemento
    if (cantidadCarpetasEliminadas > 0 || cantidadArchivosEliminados > 0) {
      this.toast.showToast(
        `${cantidadCarpetasEliminadas} Carpetas Eliminadas y ${cantidadArchivosEliminados} Archivos Eliminados`,
        'Éxito',
        'success'
      );
    } else {
      this.toast.showToast(
        'No se eliminó ninguna carpeta o archivo',
        'Error',
        'error'
      );
    }

    // Limpiar las selecciones de carpetas y archivos después de la eliminación
    this.carpetasSeleccionadas = [];
    this.archivosSeleccionados = [];
  }

  permisoEliminar(carpetas:Carpeta[],permiso:string): boolean {
    return this.permisoService.tienePermiso(carpetas,permiso)
  }

  permisoEliminarArchivo(archivos:Archivo[],permiso:string):boolean{

    return this.permisoService.tienePermiso(archivos,permiso)
  }

  permisoCambiarNombre( permiso:string):boolean{
    if(this.carpetasSeleccionadas && this.carpetasSeleccionadas.length > 0){
      return this.permisoService.tienePermiso(this.carpetasSeleccionadas,permiso)
    }

    if(this.archivosSeleccionados && this.archivosSeleccionados.length > 0){
      return this.permisoService.tienePermiso(this.archivosSeleccionados,permiso)
    }

    return false
  }

  permisoEscribir(carpetas:Carpeta[], permiso:string):boolean{
    return this.permisoService.tienePermiso(carpetas,permiso)
  }

}
