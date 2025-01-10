import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-cambiar-nombre',
  templateUrl: './dialogo-cambiar-nombre.component.html',
  styleUrl: './dialogo-cambiar-nombre.component.css'
})
export class DialogoCambiarNombreComponent {
  //valor
  //se crea la propiedad que tendra el input
  nombreCarpeta: string = '';

  //se injectala propiedad del dialogo pasando como referencia el mismo
  constructor(public dialogRef: MatDialogRef<DialogoCambiarNombreComponent>) { }

  //si da clic en cerrar
  onNoClick(): void {
    this.dialogRef.close();
  }

  //si da clic en guardar se cierra pero pasando el valor por
  onSaveClick(): void {
    this.dialogRef.close(this.nombreCarpeta);
    // console.log(this.nombreCarpeta);

  }
}
