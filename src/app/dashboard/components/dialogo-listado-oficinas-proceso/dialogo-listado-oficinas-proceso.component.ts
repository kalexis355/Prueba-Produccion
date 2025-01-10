import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-listado-oficinas-proceso',
  templateUrl: './dialogo-listado-oficinas-proceso.component.html',
  styleUrl: './dialogo-listado-oficinas-proceso.component.css'
})
export class DialogoListadoOficinasProcesoComponent {


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nombresOficinas: string[]
    }){}
}
