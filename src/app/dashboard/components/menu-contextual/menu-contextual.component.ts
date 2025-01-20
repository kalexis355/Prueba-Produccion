import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CarpetaContenido } from '../../interfaces/contenidoCarpeta';

@Component({
  selector: 'app-menu-contextual',
  templateUrl: './menu-contextual.component.html',
  styleUrl: './menu-contextual.component.css'
})
export class MenuContextualComponent {
  @Input() visible: boolean = false;
  @Input() posX: number = 0;
  @Input() posY: number = 0;
  @Input() carpetaSeleccionada?: CarpetaContenido;
  @Input() permisoCortar: boolean = false;
  @Input() permisoCopiar: boolean = false;
  @Input() permisoPegar: boolean = false;
  @Input() permisoEliminar: boolean = false;
  @Input() hayCarpetaSeleccionada: boolean = false;
  @Input() submenuPosition: 'left' | 'right' = 'right';

  @Output() cerrarMenu = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<void>();
  @Output() cortar = new EventEmitter<CarpetaContenido>();
  @Output() copiar = new EventEmitter<CarpetaContenido>();
  @Output() pegar = new EventEmitter<CarpetaContenido>();
  @Output() eliminar = new EventEmitter<CarpetaContenido>();

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Evita que se cierre el menú cuando se hace clic dentro de él
    const menu = (event.target as HTMLElement).closest('app-context-menu');
    if (!menu) {
      this.cerrarMenu.emit();
    }
  }

  onDetalles() {
    this.verDetalles.emit();
  }

  onCortar() {
    if (this.carpetaSeleccionada) {
      this.cortar.emit(this.carpetaSeleccionada);
    }
  }

  onCopiar() {
    if (this.carpetaSeleccionada) {
      this.copiar.emit(this.carpetaSeleccionada);
    }
  }

  onPegar() {
    if (this.carpetaSeleccionada) {
      this.pegar.emit(this.carpetaSeleccionada);
    }
  }

  onEliminar() {
    if (this.carpetaSeleccionada) {
      this.eliminar.emit(this.carpetaSeleccionada);
    }
  }

}
