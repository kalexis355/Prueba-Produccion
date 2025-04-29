import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { CarpetaEstructura, CarpetasPadre, DetalleCarpeta } from '../../interfaces/carpeta.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogoCompartirComponent } from '../../components/dialogo-compartir/dialogo-compartir.component';
import { DialogoDescargarCarpetaComponent } from '../../components/dialogo-descargar-carpeta/dialogo-descargar-carpeta.component';
import { DialogoEditarComponent } from '../../components/dialogo-editar/dialogo-editar.component';
import { IndiceElectronicoComponent } from '../../components/indice-electronico/indice-electronico.component';
import { IndexDbService } from '../../services/indexdb.service';

@Component({
  selector: 'app-gestion-expedientes',
  templateUrl: './gestion-expedientes.component.html',
  styleUrl: './gestion-expedientes.component.scss'
})
export class GestionExpedientesComponent implements OnInit{

  public carpetaService = inject(GestionCarpetasService)
  public indexdbService = inject(IndexDbService)
  @Output() contextMenu = new EventEmitter<{event: MouseEvent, cod:number}>();

  public carpetasDelegado: CarpetasPadre[] = []
  public tipoVista: 'cuadricula' | 'lista' = 'cuadricula';

  menuVisible: boolean = false; // Bandera para mostrar/ocultar el menú
  menuPosX: number = 0; // Posición X del menú
  menuPosY: number = 0; // Posición Y del menú
  carpetaSeleccionada: DetalleCarpeta = {
    Cod: 0,
    CodSerie: 0,
    CodSubSerie: 0,
    Estado: false,
    EstadoCarpeta: 0,
    NombreEstadoCarpeta: '',
    Nombre: '',
    Descripcion: '',
    Copia: false,
    CarpetaPadre: 0,
    FechaCreacion: '',
    IndiceElectronico: '',
    Delegado: 0,
    TipoCarpeta: 0,
    NombreTipoCarpeta: '',
    NivelVisualizacion: 0,
    NombreNivelVisualizacion: '',
    SerieRaiz: 0,
    NombreCarpetaPadre: ''
  };

    constructor(public dialog: MatDialog){

    }

  ngOnInit(): void {
    this.carpetasDelegado = this.carpetaService.carpetasDelegado;
  }


  onBuscarOficina(termino:string){

  }
  getColor(index: number): string {
    const colors = ['#00BCD4', '#2E7895', '#FDB528', '#51CC28', '#6D788D', '#FF4D49'];
    return colors[index % colors.length];
  }

  openCompartir(){
         const dialogRef = this.dialog.open(DialogoCompartirComponent, {
              width: '900px',
              height: '500px',
              maxWidth: '100%',
              // disableClose: true,
            });
      }

      openDescargar(){
        const dialogRef = this.dialog.open(DialogoDescargarCarpetaComponent, {
             width: '1000px',
             height: '300px',
             maxWidth: '100%',
             // disableClose: true,
           });
     }

     openEditar(){
      const dialogRef = this.dialog.open(DialogoEditarComponent, {
        width: '900px',
        height: '550px',
        maxWidth: '100%',
        // disableClose: true,
      });
     }

     openIndice(){
      const dialogRef = this.dialog.open(IndiceElectronicoComponent, {
        width: '1400px',
        height: '550px',
        maxWidth: '100%',
        // disableClose: true,
      });
     }

     onContextMenu(event: MouseEvent, cod:number) {
      // this.contextMenu.emit({ event, cod });
    }

    onCarpetaClick(carpeta: CarpetasPadre): void {
      console.log(carpeta, 'carpeta a la cual se esta navegando');
      this.carpetaService.agregarACamino(carpeta.Cod, carpeta.Nombre)
      this.indexdbService.guardarCarpetaFrecuente(carpeta)
      // this.carpetaClick.emit(carpeta);


    }




}
