import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../services/dashboard.service';
import Swal from 'sweetalert2';
import { CheckBoxService } from '../../services/checkBox.service';

@Component({
  selector: 'app-dialogo-compartir',
  templateUrl: './dialogo-compartir.component.html',
  styleUrl: './dialogo-compartir.component.css'
})
export class DialogoCompartirComponent {
 //valor
  //se crea la propiedad que tendra el input
  nombreCarpeta: string = '';

  public dashService = inject(DashboardService)
  public checkService = inject(CheckBoxService)

  //se injectala propiedad del dialogo pasando como referencia el mismo
  constructor(public dialogRef: MatDialogRef<DialogoCompartirComponent>) { }

  //si da clic en cerrar
  onNoClick(): void {
    this.dialogRef.close();
  }

  //si da clic en guardar se cierra pero pasando el valor por
  onSaveClick(): void {
    this.dialogRef.close(this.nombreCarpeta);
    // console.log(this.nombreCarpeta);
    Swal.fire('Exito','Carpeta compartida','success')

  }

  nombreCarpetaDom():string{
    if(this.checkService.carpetasSeleccionadas().length ===1){
      return `"${this.checkService.carpetasSeleccionadas()[0].nombre}"`
    }
    return `"${this.checkService.carpetasSeleccionadas(). length} elementos"`
  }
}
