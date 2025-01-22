import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { Documento } from '../../interfaces/archivos.interface';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { SnackBarProgresoComponent } from '../../../shared/components/snack-bar-progreso/snack-bar-progreso.component';

@Component({
  selector: 'app-btn-subir-archivo',
  templateUrl: './btn-subir-archivo.component.html',
  styleUrl: './btn-subir-archivo.component.css'
})
export class BtnSubirArchivoComponent {
  @Input() carpetaId!: number;
  @Input() mostrarBoton: boolean = true;
  private colaArchivos: { archivo: File, arregloBits: Uint8Array }[] = [];
  private procesandoArchivos = false;

  private snackBarRef: MatSnackBarRef<SnackBarProgresoComponent> | null = null;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private dialog: MatDialog,
    private gestionArchivosService: GestionArchivosService,
    private _snackBar: MatSnackBar
  ) {}



  async subirArchivo(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.colaArchivos = [];

      // Esperar a que todos los archivos se procesen antes de continuar
      await Promise.all(
        Array.from(input.files).map(archivo => this.procesarArchivo(archivo))
      );

      // Una vez que todos los archivos están en la cola, iniciar el procesamiento
      if (!this.procesandoArchivos) {
        await this.procesarSiguienteArchivo();
      }

      input.value = '';
    }
  }

  private procesarArchivo(archivo: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const arregloBits = new Uint8Array(reader.result as ArrayBuffer);
        this.colaArchivos.push({ archivo, arregloBits });
        resolve();
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsArrayBuffer(archivo);
    });
  }

  private async procesarSiguienteArchivo() {
    if (this.procesandoArchivos || this.colaArchivos.length === 0) {
      return;
    }

    this.procesandoArchivos = true;

    try {
      for (const archivoActual of this.colaArchivos) {
        // Mostrar el diálogo y esperar su resultado
        const resultado = await this.mostrarDialogoSubida(
          archivoActual.archivo,
          archivoActual.arregloBits
        );

        if (resultado !== undefined && resultado !== '') {
          await this.crearArchivo(resultado, archivoActual.arregloBits);
        }
      }

      // Limpiar la cola una vez que todos los archivos han sido procesados
      this.colaArchivos = [];

    } catch (error) {
      console.error('Error procesando archivos:', error);
    } finally {
      this.procesandoArchivos = false;
    }
  }

  private async mostrarDialogoSubida(archivo: File, arregloBits: Uint8Array): Promise<any> {
    const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, {
      width: '450px',
      height: '550px',
      data: {
        archivo,
        archivoBits: arregloBits,
      },
      disableClose: true,
    });

    return firstValueFrom(dialogRef.afterClosed());
  }

  private showProgressSnackBar() {
    if (!this.snackBarRef) {
      this.snackBarRef = this._snackBar.openFromComponent(SnackBarProgresoComponent, {
        duration: undefined,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
    }
  }
  
  private updateProgressMessage(message: string) {
    if (!this.snackBarRef) {
      this.showProgressSnackBar();
    }
    if (this.snackBarRef) {
      this.snackBarRef.instance.message = message;
    }
  }

  private async crearArchivo(result: any, arregloBits: Uint8Array): Promise<void> {
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

    return new Promise((resolve, reject) => {
      this.gestionArchivosService.crearArchivo(archivo).subscribe({
        next: (event: any) => {
          switch (event.status) {
            case 'progress':
              const progressMessage = `⬆️ Subiendo: ${event.progress}% (${this.formatBytes(event.loaded)} / ${this.formatBytes(event.total)})`;
              this.updateProgressMessage(progressMessage);
              break;

            case 'complete':
              // Mostrar mensaje final y cerrar después de 3 segundos
              this.updateProgressMessage('✅ Archivo subido completamente');
              setTimeout(() => {
                if (this.snackBarRef) {
                  this.snackBarRef.dismiss();
                  this.snackBarRef = null;
                }
              }, 3000);
              resolve();
              break;
          }
        },
        error: (error) => {
          this.updateProgressMessage('❌ Error al subir el archivo');
          setTimeout(() => {
            if (this.snackBarRef) {
              this.snackBarRef.dismiss();
              this.snackBarRef = null;
            }
          }, 5000);
          console.error('Error en el callback:', error);
          reject(error);
        }
      });
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

}
