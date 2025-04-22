import { Component, computed, inject, OnInit } from '@angular/core';
import { Auth2Service } from '../../../login/services/auth2.service';
import { IndexDbService } from '../../services/indexdb.service';
import { CarpetaBase, CarpetasPadre } from '../../interfaces/carpeta.interface';
import { DocumentoContenido } from '../../interfaces/contenidoCarpeta';
import { MatDialog } from '@angular/material/dialog';
import { VisualizadorArchivosComponent } from '../../components/visualizador-archivos/visualizador-archivos.component';

@Component({
  selector: 'app-tablero-principal-page',
  templateUrl: './tablero-principal-page.component.html',
  styleUrl: './tablero-principal-page.component.scss'
})
export class TableroPrincipalPageComponent implements OnInit {

  private indexdbService = inject(IndexDbService)
  public authService2 = inject(Auth2Service);
  public user = computed(() => this.authService2.currentUSer2());

  carpetasFrecuentes: CarpetasPadre[] | CarpetaBase[] = [];

  archivosFrecuentes: DocumentoContenido[] = [];

    constructor(public dialog: MatDialog){}


    ngOnInit(): void {
      localStorage.removeItem('nombreOficina')
      this.cargarCarpetasFrecuentes();
      this.cargarArchivosFrecuentes();
    }

    async cargarArchivosFrecuentes(): Promise<void>{
      try {
        this.archivosFrecuentes = await this.indexdbService.obtenerArchivosFrecuentes();
        console.log('archivos frecuentes: ', this.archivosFrecuentes );

      } catch (error) {
        console.error('Error al cargar carpetas frecuentes:', error);
      }
    }

    async cargarCarpetasFrecuentes(): Promise<void> {
      try {
        this.carpetasFrecuentes = await this.indexdbService.obtenerCarpetasFrecuentes();
        console.log('Carpetas frecuentes cargadas:', this.carpetasFrecuentes);
      } catch (error) {
        console.error('Error al cargar carpetas frecuentes:', error);
      }

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

        this.indexdbService.guardarArchivosFrecuentes(documento)


        const dialogRef = this.dialog.open(VisualizadorArchivosComponent, {
          width: '900px',
          height: '550px',
          maxWidth: '100%',
          // disableClose: true,
          data: documento,
        });
      }

}
