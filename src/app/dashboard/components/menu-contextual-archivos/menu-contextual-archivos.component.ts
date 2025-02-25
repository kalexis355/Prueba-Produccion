import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DetalleArchivo } from '../../interfaces/archivos.interface';

@Component({
  selector: 'app-menu-contextual-archivos',
  templateUrl: './menu-contextual-archivos.component.html',
  styleUrl: './menu-contextual-archivos.component.css'
})
export class MenuContextualArchivosComponent {
  @Input() visible: boolean = false;
  @Input() posX: number = 0;
  @Input() posY: number = 0;
  @Input() carpetaSeleccionada?: DetalleArchivo;
  // @Input() permisoCortar: boolean = false;
  // @Input() permisoCopiar: boolean = false;
  // @Input() permisoPegar: boolean = false;
  // @Input() permisoEliminar: boolean = false;
  @Input() hayCarpetaSeleccionada: boolean = false;
  @Input() submenuPosition: 'left' | 'right' = 'right';



  @Output() verDetalles = new EventEmitter<any>();
  @Output() cerrarMenu = new EventEmitter<void>();

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

}
