import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalService {
  private swalActive = false;

  mostrarCargando() {
    if (!this.swalActive) {
      this.swalActive = true;
      Swal.fire({
        title: 'Procesando información',
        html: 'Cargando datos...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }
  }

  cerrarCargando() {
    if (this.swalActive) {
      this.swalActive = false;
      Swal.close();
    }
  }

  mostrarError(mensaje: string) {
    this.swalActive = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

  mostrarTimeoutDialog(): Promise<boolean> {
    return Swal.fire({
      title: '¿Qué desea hacer?',
      text: 'La operación está tardando demasiado tiempo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Reintentar',
      cancelButtonText: 'Cerrar sesión'
    }).then((result) => result.isConfirmed);
  }

  mostrarExito(mensaje: string) {
    this.swalActive = false;
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: mensaje
    });
  }

  mostrarConfirmacion(titulo: string, mensaje: string): Promise<boolean> {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => result.isConfirmed);
  }

  mostrarAdvertencia(mensaje: string) {
    this.swalActive = false;
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: mensaje
    });
  }

  isSwalActive(): boolean {
    return this.swalActive;
  }
}
