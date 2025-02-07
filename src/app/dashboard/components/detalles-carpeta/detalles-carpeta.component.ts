import { Component, Input, OnInit } from '@angular/core';
import { CarpetaContenido } from '../../interfaces/contenidoCarpeta';

@Component({
  selector: 'app-detalles-carpeta',
  templateUrl: './detalles-carpeta.component.html',
  styleUrl: './detalles-carpeta.component.css'
})
export class DetallesCarpetaComponent implements OnInit {

  @Input() carpetaSeleccionada!: CarpetaContenido;

  ngOnInit(): void {
    console.log(this.carpetaSeleccionada,'carpetaSeleccionada');

  }


}
