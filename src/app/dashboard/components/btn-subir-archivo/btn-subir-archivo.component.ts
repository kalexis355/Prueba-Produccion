import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { ArchivoDatos, Documento } from '../../interfaces/archivos.interface';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { SnackBarProgresoComponent } from '../../../shared/components/snack-bar-progreso/snack-bar-progreso.component';
import { LoaderService } from '../../services/gestionLoader.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-btn-subir-archivo',
  templateUrl: './btn-subir-archivo.component.html',
  styleUrl: './btn-subir-archivo.component.css'
})
export class BtnSubirArchivoComponent {

  public loaderService = inject(LoaderService)

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



  // async subirArchivo(event: Event) {
  //   const input = event.target as HTMLInputElement;

  //   if (input.files && input.files.length > 0) {
  //     this.colaArchivos = [];

  //     // Esperar a que todos los archivos se procesen antes de continuar
  //     await Promise.all(
  //       Array.from(input.files).map(archivo => this.procesarArchivo(archivo))
  //     );

  //     // Una vez que todos los archivos están en la cola, iniciar el procesamiento
  //     if (!this.procesandoArchivos) {
  //       await this.procesarSiguienteArchivo();
  //     }

  //     input.value = '';
  //   }
  // }
  async subirArchivo(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
        this.colaArchivos = [];

        await Promise.all(
            Array.from(input.files).map(archivo => this.procesarArchivo(archivo))
        );

        if (!this.procesandoArchivos && this.colaArchivos.length > 0) {
            try {
                const resultadosProcesados = await this.mostrarDialogoSubida(this.colaArchivos);
                console.log('Resultados procesados:', resultadosProcesados);

                if (resultadosProcesados && Array.isArray(resultadosProcesados) && resultadosProcesados.length > 0) {
                    await this.crearArchivos(resultadosProcesados, this.colaArchivos);
                }
            } catch (error) {
                console.error('Error en el proceso:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al procesar los archivos',
                    timer: 3000,
                    showConfirmButton: false
                });
            } finally {
                this.colaArchivos = [];
                this.procesandoArchivos = false;
            }
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

  // private async procesarSiguienteArchivo() {
  //   if (this.procesandoArchivos || this.colaArchivos.length === 0) {
  //     return;
  //   }

  //   this.procesandoArchivos = true;

  //   try {
  //     for (const archivoActual of this.colaArchivos) {
  //       // Mostrar el diálogo y esperar su resultado
  //       const resultado = await this.mostrarDialogoSubida(
  //         archivoActual.archivo,
  //         archivoActual.arregloBits
  //       );

  //       if (resultado !== undefined && resultado !== '') {
  //         await this.crearArchivo(resultado, archivoActual.arregloBits);
  //       }
  //     }

  //     // Limpiar la cola una vez que todos los archivos han sido procesados
  //     this.colaArchivos = [];

  //   } catch (error) {
  //     console.error('Error procesando archivos:', error);
  //   } finally {
  //     this.procesandoArchivos = false;
  //   }
  // }

  // private async mostrarDialogoSubida(archivo: File, arregloBits: Uint8Array): Promise<any> {
  //   const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, {
  //     width: '80%',
  //     height: '550px',
  //     maxWidth: '100%', // Desactiva el ancho máximo
  //     data: {
  //       // archivo,
  //       // archivoBits: arregloBits,
  //       colaArchivos: this.colaArchivos
  //     },
  //     disableClose: true,
  //   });

  //   return firstValueFrom(dialogRef.afterClosed());
  // }
  private async mostrarDialogoSubida(archivos: { archivo: File, arregloBits: Uint8Array }[]): Promise<any[]> {
    const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, {
        width: '80%',
        height: '550px',
        maxWidth: '100%',
        data: {
            colaArchivos: archivos  // Enviamos todo el array de archivos
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

  // private async crearArchivo(resultadosArchivos: ArchivoDatos[], archivoBits: { archivo: File, arregloBits: Uint8Array }[]): Promise<void> {
  //   console.log(resultadosArchivos,'archivos procesados');

  //   const uploadAlert = Swal.mixin({
  //     title: 'Subiendo archivo',
  //     html: 'Iniciando subida...',
  //     allowOutsideClick: false,
  //     allowEscapeKey: false,
  //     allowEnterKey: false,
  //     showConfirmButton: false,
  //     didOpen: () => {
  //       Swal.showLoading();
  //     }
  //   });

  //   uploadAlert.fire();

  //   const archivo: Documento = {
  //     Nombre: result.nombre,
  //     Carpeta: this.carpetaId,
  //     FimarPor: result.firmarPor,
  //     TipoArchivo: +result.tipoArchivo,
  //     Formato: result.formato,
  //     NumeroHojas: result.numeroHojas,
  //     Duracion: result.duracion,
  //     Tamaño: result.tamaño,
  //     Indice: 0,
  //     Archivo: Array.from(arregloBits),
  //   };

  //   return new Promise((resolve, reject) => {
  //     this.gestionArchivosService.crearArchivo(archivo).subscribe({
  //       next: (event: any) => {
  //         switch (event.status) {
  //           case 'progress':
  //             const progressMessage = `⬆️ Subiendo: ${event.progress}% (${this.formatBytes(event.loaded)} / ${this.formatBytes(event.total)})`;
  //             this.updateProgressMessage(progressMessage);
  //             uploadAlert.update({
  //               html: progressMessage
  //             });
  //             break;

  //           case 'complete':
  //             // Mostrar mensaje final y cerrar después de 3 segundos
  //             this.updateProgressMessage('✅ Archivo subido completamente');
  //             setTimeout(() => {
  //               if (this.snackBarRef) {
  //                 this.snackBarRef.dismiss();
  //                 this.snackBarRef = null;
  //               }
  //             }, 3000);
  //             Swal.fire({
  //               icon: 'success',
  //               title: '¡Completado!',
  //               text: 'Archivo subido exitosamente',
  //               timer: 2000,
  //               // showConfirmButton: false
  //             });
  //             resolve();
  //             break;
  //         }
  //       },
  //       error: (error) => {
  //         this.updateProgressMessage('❌ Error al subir el archivo');
  //         setTimeout(() => {
  //           if (this.snackBarRef) {
  //             this.snackBarRef.dismiss();
  //             this.snackBarRef = null;
  //           }
  //         }, 5000);
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Error',
  //           text: 'Error al subir el archivo muy pesado',
  //           timer: 3000,
  //           showConfirmButton: false
  //         });
  //         console.error('Error en el callback:', error);
  //         reject(error);
  //       }
  //     });
  //   });
  // }
  private async crearArchivos(resultadosArchivos: ArchivoDatos[], archivoBits: { archivo: File, arregloBits: Uint8Array }[]): Promise<void> {
    console.log(resultadosArchivos, 'archivos procesados');

    // Arrays para rastrear éxitos y fallos
    const archivosExitosos: string[] = [];
    const archivosFallidos: string[] = [];

    const uploadAlert = Swal.mixin({
        title: 'Subiendo archivos',
        html: 'Iniciando subida...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    uploadAlert.fire();

    try {
        for (let i = 0; i < resultadosArchivos.length; i++) {
            const result = resultadosArchivos[i];
            const arregloBits = archivoBits[i].arregloBits;
            const archivoNumerico = Array.from(arregloBits).map(byte => Number(byte));

            const documento: Documento = {
                Nombre: result.nombre,
                Carpeta: Number(this.carpetaId),
                FimarPor: result.firmar || '',
                TipoArchivo: Number(result.tipoArchivo),
                Formato: result.formato || '',
                NumeroHojas: Number(result.numeroHojas) || 0,
                Duracion: result.duracion || '00:00:00',
                Tamaño: typeof result.tamanio === 'string' ? result.tamanio : '0KB',
                Indice: i,
                Archivo: archivoNumerico
            };

            uploadAlert.update({
                html: `Subiendo archivo ${i + 1} de ${resultadosArchivos.length}: ${documento.Nombre}`
            });

            try {
                await new Promise<void>((resolve, reject) => {
                    this.gestionArchivosService.crearArchivo(documento).subscribe({
                        next: (event: any) => {
                            switch (event.status) {
                                case 'progress':
                                    const progressMessage = `⬆️ Subiendo ${documento.Nombre}: ${event.progress}% (${this.formatBytes(event.loaded)} / ${this.formatBytes(event.total)})`;
                                    this.updateProgressMessage(progressMessage);
                                    uploadAlert.update({
                                        html: progressMessage,
                                        showConfirmButton: false,
                                        allowOutsideClick: false,

                                    });
                                    break;

                                case 'complete':
                                    this.updateProgressMessage(`✅ Archivo ${documento.Nombre} subido completamente`,);
                                    archivosExitosos.push(documento.Nombre);
                                    uploadAlert.update({
                                      html: `✅ Archivo ${documento.Nombre} subido completamente`,
                                      showConfirmButton: false,  // Asegura que no se muestre el botón
                                      allowOutsideClick: false,

                                  });
                                    resolve();
                                    break;
                            }
                        },
                        error: (error) => {
                            console.error(`Error al subir el archivo ${documento.Nombre}:`, error);
                            this.updateProgressMessage(`❌ Error al subir el archivo ${documento.Nombre}`);
                            archivosFallidos.push(documento.Nombre);
                            reject(error);
                        }
                    });
                });
            } catch (error) {
                // Capturamos el error pero continuamos con el siguiente archivo
                console.error(`Error al procesar archivo ${documento.Nombre}:`, error);
                if (!archivosFallidos.includes(documento.Nombre)) {
                    archivosFallidos.push(documento.Nombre);
                }
            }
        }

        // Preparar mensaje detallado para Swal
        let mensajeHtml = '';

        if (archivosExitosos.length > 0) {
            mensajeHtml += '<strong>Archivos subidos exitosamente:</strong><br>';
            archivosExitosos.forEach(archivo => {
                mensajeHtml += `✅ ${archivo}<br>`;
            });
        }

        if (archivosFallidos.length > 0) {
            if (archivosExitosos.length > 0) mensajeHtml += '<br>';
            mensajeHtml += '<strong>Archivos con error:</strong><br>';
            archivosFallidos.forEach(archivo => {
                mensajeHtml += `❌ ${archivo}<br>`;
            });
        }

        // Mostrar resultado final
        Swal.fire({
            icon: archivosFallidos.length === 0 ? 'success' : 'warning',
            title: 'Resumen de la subida',
            html: mensajeHtml,
            confirmButtonText: 'Aceptar'
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error general en el proceso de subida',
            confirmButtonText: 'Aceptar'
        });
        console.error('Error en la subida:', error);
        throw error;
    } finally {
        if (this.snackBarRef) {
            this.snackBarRef.dismiss();
            this.snackBarRef = null;
        }
    }
}
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

}
