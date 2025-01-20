import { Injectable } from '@angular/core';
import { CarpetaContenido } from '../interfaces/contenidoCarpeta';
import { BehaviorSubject } from 'rxjs';

interface MenuState {
  visible: boolean;
  posX: number;
  posY: number;
  carpetaSeleccionada: CarpetaContenido | null;
  submenuPosition: 'left' | 'right';
  permisos: {
    cortar: boolean;
    copiar: boolean;
    pegar: boolean;
    eliminar: boolean;
  };
  hayCarpetaSeleccionada: boolean;
}


@Injectable({providedIn: 'root'})
export class MenuContextualService {

  //inicializacion y declaracion de propiedades
  private initialState: MenuState = {
    visible: false,
    posX: 0,
    posY: 0,
    carpetaSeleccionada: null,
    submenuPosition: 'right',
    permisos: {
      cortar: false,
      copiar: false,
      pegar: false,
      eliminar: false
    },
    hayCarpetaSeleccionada: false
  };

  private menuState = new BehaviorSubject<MenuState>(this.initialState);
  menuState$ = this.menuState.asObservable();

  constructor() { }

  calcularPosicionMenu(event: MouseEvent): { posX: number; posY: number; submenuPosition: 'left' | 'right' } {
    const menuWidth = 230;
    const menuHeight = 250;
    const submenuWidth = 200;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let posX = event.clientX + scrollX;
    let posY = event.clientY + scrollY;

    const spaceForSubmenu = windowWidth - (event.clientX + menuWidth);
    const submenuPosition = spaceForSubmenu < submenuWidth ? 'left' : 'right';

    if (posX + menuWidth > windowWidth + scrollX) {
      posX = windowWidth + scrollX - menuWidth;
    }
    if (posX < scrollX) {
      posX = scrollX;
    }

    const spaceBelow = windowHeight - (event.clientY - scrollY);
    if (spaceBelow < menuHeight) {
      posY = event.clientY + scrollY - menuHeight;
    }

    posX = Math.max(scrollX, Math.min(posX, windowWidth + scrollX - menuWidth));
    posY = Math.max(scrollY, Math.min(posY, windowHeight + scrollY - menuHeight));

    return { posX, posY, submenuPosition };
  }

  actualizarPermisos(permisos: {
    cortar: boolean;
    copiar: boolean;
    pegar: boolean;
    eliminar: boolean;
  }): void {
    const currentState = this.menuState.value;
    this.menuState.next({
      ...currentState,
      permisos
    });
  }

  actualizarVisibilidad(visible: boolean): void {
    if (!visible) {
      this.menuState.next(this.initialState);
    } else {
      const currentState = this.menuState.value;
      this.menuState.next({
        ...currentState,
        visible
      });
    }
  }

  actualizarEstado(
    estado: Partial<MenuState>
  ): void {
    const currentState = this.menuState.value;
    this.menuState.next({
      ...currentState,
      ...estado
    });
  }


}
