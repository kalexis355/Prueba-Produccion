import { Component, Input, OnInit } from '@angular/core';
import { CarpetaContenido } from '../../interfaces/contenidoCarpeta';
import { DetalleCarpeta } from '../../interfaces/carpeta.interface';

@Component({
  selector: 'app-detalles-carpeta',
  templateUrl: './detalles-carpeta.component.html',
  styleUrl: './detalles-carpeta.component.css'
})
export class DetallesCarpetaComponent implements OnInit {

  @Input() carpetaSeleccionada!: DetalleCarpeta;

  ngOnInit(): void {
    console.log(this.carpetaSeleccionada,'carpetaSeleccionada');

  }


}
