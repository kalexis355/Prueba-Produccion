import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { Documento } from '../../interfaces/archivos.interface';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';

@Component({
  selector: 'app-btn-subir-archivo',
  templateUrl: './btn-subir-archivo.component.html',
  styleUrl: './btn-subir-archivo.component.css'
})
export class BtnSubirArchivoComponent {
  @Input() carpetaId!: number;
  @Input() mostrarBoton: boolean = true;

  constructor(
    private dialog: MatDialog,
    private gestionArchivosService: GestionArchivosService
  ) {}

  subirArchivo(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        this.procesarArchivo(input.files[i]);
      }
      input.value = '';
    }
  }

  private procesarArchivo(archivo: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const arregloBits = new Uint8Array(reader.result as ArrayBuffer);
      this.mostrarDialogoSubida(archivo, arregloBits);
    };

    reader.readAsArrayBuffer(archivo);
  }

  private mostrarDialogoSubida(archivo: File, arregloBits: Uint8Array) {
    const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, {
      width: '450px',
      height: '550px',
      data: {
        archivo,
        archivoBits: arregloBits,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined && result !== '') {
        this.crearArchivo(result, arregloBits);
      }
    });
  }

  private crearArchivo(result: any, arregloBits: Uint8Array) {
    const archivo: Documento = {
      Nombre: result.nombre,
      Carpeta: this.carpetaId,
      FimarPor: result.firmarPor,
      TipoArchivo: +result.tipoArchivo,
      Formato: result.formato,
      NumeroHojas: result.numeroHojas,
      Duracion: result.duracion,
      Tamaño: result.tamaño,
      Indice: 0,
      Archivo: Array.from(arregloBits),
    };

    this.gestionArchivosService.crearArchivo(archivo).subscribe({
      next: (respuesta) => {
        console.log(respuesta, 'respuesta al crear un archivito');
      },
      error: (error) => {
        console.error('Error en el callback:', error);
      }
    });
  }
}
