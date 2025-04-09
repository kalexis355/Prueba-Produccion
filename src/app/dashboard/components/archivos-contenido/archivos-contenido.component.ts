import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentoContenido } from '../../interfaces/contenidoCarpeta';
import { MatDialog } from '@angular/material/dialog';
import { VisualizadorArchivosComponent } from '../visualizador-archivos/visualizador-archivos.component';

@Component({
  selector: 'app-archivos-contenido',
  templateUrl: './archivos-contenido.component.html',
  styleUrl: './archivos-contenido.component.css'
})
export class ArchivosContenidoComponent {
  @Input() archivos: DocumentoContenido[] = [];
  @Output() archivoClick = new EventEmitter<DocumentoContenido>();

  @Output() contextMenu = new EventEmitter<{event: MouseEvent, cod:number}>();
  @Input() tipoVista: 'cuadricula' | 'lista' = 'cuadricula';

  constructor(public dialog: MatDialog){}

  onContextMenu(event: MouseEvent, cod:number) {
    this.contextMenu.emit({ event, cod });
  }

  obtenerImagenPrevisualizacion(formato: string): string {
    switch (formato) {
      case 'jpg':
      case 'jpeg':
        return 'assets/iconos/jpg.png'; // Crea una URL para mostrar imagen
      case 'png':
        return 'assets/iconos/png.png'; // Crea una URL para mostrar imagen
      case 'gif':
        return 'assets/iconos/gif.png'; // Crea una URL para mostrar imagen
      case 'pdf':
        return 'assets/iconos/pdf.png';
      case 'docx':
        return 'assets/iconos/doc.png';
      case 'xlsx':
        return 'assets/iconos/xls.png';
      case 'mp4':
        return 'assets/iconos/mp4.png';
      case 'zip':
      case 'rar':
        return 'assets/iconos/rar.png';
      case 'pptx':
        return 'assets/iconos/ppt.png';
      case 'mp3':
        return 'assets/iconos/mp3.png';
      default:
        return 'assets/imgs/archivoDe.png';
    }
  }



  openVisualizador(documento: DocumentoContenido) {
    const dialogRef = this.dialog.open(VisualizadorArchivosComponent, {
      width: '900px',
      height: '550px',
      maxWidth: '100%',
      // disableClose: true,
      data: documento,
    });
  }


}
