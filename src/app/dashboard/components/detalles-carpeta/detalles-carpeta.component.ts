import { Component, Input } from '@angular/core';
import { CarpetaContenido } from '../../interfaces/contenidoCarpeta';

@Component({
  selector: 'app-detalles-carpeta',
  templateUrl: './detalles-carpeta.component.html',
  styleUrl: './detalles-carpeta.component.css'
})
export class DetallesCarpetaComponent {
  @Input() carpetaSeleccionada!: CarpetaContenido;

}
