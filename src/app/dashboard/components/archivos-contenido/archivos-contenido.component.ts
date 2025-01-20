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

  constructor(public dialog: MatDialog){}

  obtenerImagenPrevisualizacion(formato: string): string {
    switch (formato) {
      case 'jpg':
        return 'assets/imgs/imagenDefault.png'; // Crea una URL para mostrar imagen
      case 'png':
        return 'assets/imgs/imagenDefault.png'; // Crea una URL para mostrar imagen
      case 'gif':
        return 'assets/imgs/imagenDefault.png'; // Crea una URL para mostrar imagen
      case 'pdf':
        return 'assets/imgs/pdf.png';
      case 'docx':
        return 'assets/imgs/word.png';
      case 'xlsx':
        return 'assets/imgs/excel.png';
      case 'mp4':
        return 'assets/imgs/video.png';
      case 'zip':
      case 'rar':
        return 'assets/imgs/winrar.png';
      case 'pptx':
        return 'assets/imgs/power.png';
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
