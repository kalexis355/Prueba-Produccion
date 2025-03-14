import { Component, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog } from '@angular/material/dialog';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../../login/services/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { Carpeta, CarpetaBase, CrearCarpeta, NivelVisualizacion } from '../../interfaces/carpeta.interface';
import { Auth2Service } from '../../../login/services/auth2.service';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { response } from 'express';
import Swal from 'sweetalert2'
import { ActivatedRoute } from '@angular/router';
import { IndexDbService } from '../../services/indexdb.service';


@Component({
  selector: 'dashboard-btn-mas',
  templateUrl: './btn-mas.component.html',
  styleUrl: './btn-mas.component.css'
})
export class BtnMasComponent implements OnInit,OnChanges  {

  @Input()
  public idPadre?:number

  @Input()
  public noEsSerieOSubserie:boolean = false;

  //injeccion de servicios o librerias
  public dashService = inject(DashboardService)
  public authService2 = inject(Auth2Service)
  public gestionCarpetaService = inject(GestionCarpetasService)
  public route = inject(ActivatedRoute)
  public indexdbService = inject(IndexDbService)


  roles: any[] = [];
  id!:number
  serie:number=0;

  //utilizacion de propiedades material
  constructor(public dialog: MatDialog) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['noEsSerieOSubserie']) {
      // Manejar el cambio aquí
      // console.log(' serie o subserie hijo', changes['noEsSerieOSubserie'].currentValue);
    }
  }



  ngOnInit(): void {
    // console.log('no es serie Ni subserie componente hijo',this.noEsSerieOSubserie);

    this.roles=this.authService2.getRolesUsuario()

    // console.log(this.roles,'roles Extraidos');

    this.obtenerSerie()

  }


  obtenerSerie(){
    const serie = localStorage.getItem('serie')
    if(serie)
    this.serie = +serie
  }



  openDialog(): void {
    const dialogRef = this.dialog.open(DialogoComponent,{
      width:'450px',
      height:'550px',
      disableClose: true,
      data:{
        esSerieOSubserie: this.noEsSerieOSubserie
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    this.route.paramMap.subscribe(params => {
    const id = params.get('id') ? +params.get('id')! : null;
    if (id !== null) {
      this.id= id
      console.log(this.id,'id de la ruta');
    } else {
        console.warn('El ID de la carpeta no está presente en la URL');
    }
    });
      if (result !== undefined && result !== '') {
       const carpeta:CrearCarpeta ={
         CodSerie: 0,
         CodSubSerie: result.codigoSubSerie ?? 0,
         Nombre: result.nombreCarpeta,
         Descripcion: result.descripcion,
         EstadoCarpeta: +result.carpetaEstado,
         CarpetaPadre: this.id,
         Delegado: +(result.delegado ?? 0),
         TipoCarpeta: +result.tipoCarpeta,
         SerieRaiz: this.serie,
         NivelVisualizacion: +result.nivelVisualizacion
       }

        // this.dashService.addNuevaCarpeta(carpeta)
        console.log(carpeta,'objeto carpeta nueva');
        this.gestionCarpetaService.crearCarpetas(carpeta)
        .subscribe({
          next: (response) =>{
            // this.gestionCarpetaService.notificarActualizacion()
            Swal.fire('Éxito', 'Carpeta Creada', 'success');

            const nuevaCarpeta: CarpetaBase = {
              Cod: response[0].Cod,
              CodSerie: response[0].CodSerie,
              CodSubSerie: response[0].CodSubSerie,
              Estado: response[0].Estado,
              EstadoCarpeta: response[0].EstadoCarpeta,
              NombreEstadoCarpeta: response[0].NombreEstadoCarpeta, // Ajustar según tus valores
              Nombre: response[0].Nombre,
              Descripcion: response[0].Descripcion,
              Copia: response[0].Copia,
              CarpetaPadre: response[0].CarpetaPadre,
              NombreCarpetaPadre: "", // Si tienes acceso al nombre de la carpeta padre, añádelo aquí
              FechaCreacion: response[0].FechaCreacion,
              IndiceElectronico: response[0].IndiceElectronico,
              Delegado: response[0].Delegado,
              TipoCarpeta: response[0].TipoCarpeta,
              NombreTipoCarpeta: "", // Obtener nombre según el tipo
              NivelVisualizacion: carpeta.NivelVisualizacion,
              NombreNivelVisualizacion: "", // Obtener nombre según el nivel
              SerieRaiz: carpeta.SerieRaiz,
              TipoNodo: "carpeta"
            };

            this.indexdbService.agregarElemento(nuevaCarpeta)
            .then(() => {
              console.log('Nueva carpeta agregada a IndexedDB');

              // Actualizar la visualización
            })
            .catch(error => {
              console.error('Error al guardar nueva carpeta en IndexedDB:', error);
            });
            console.log('carpetapadrecod',response[0].CarpetaPadre);
            console.log(response,'respuesta del server');
            // this.gestionCarpetaService.notificarActualizacion()

            this.indexdbService.carpetaExisteEnElementos(response[0].CarpetaPadre)
            .then(existe=>{
              if(existe){
                console.log('si esxiste');
            this.gestionCarpetaService.notificarActualizacion()
              }else{
                console.log('no existe');
                this.indexdbService.carpetaTieneContenidoEnIndexDB(response[0].CarpetaPadre)
                .then(existe=>{
                  if(existe){
                    console.log('si existe en indexdb');
                    this.gestionCarpetaService.notificarActualizacion()
                  }else{
                    console.log('no existe en indexdb');

                  }
                })
              }
            })


            this.indexdbService.obtenerCarpeta(response[0].CarpetaPadre)
            .then((carpetaPadre)=>{
              if(carpetaPadre.TipoCarpeta===2 || carpetaPadre.TipoCarpeta ===1){
                this.gestionCarpetaService.ObtenerYMostrarGzip()
                .subscribe({
                  next:()=>{
                    console.log('notificando');

                    this.gestionCarpetaService.notificarActualizacion()
                  },
                  error: (error) => {
                    console.error('Error al actualizar después de crear carpeta', error);
                  }

                })
              }
            })

            // this.gestionCarpetaService.ObtenerYMostrarGzip()
            // .subscribe({
            //   next:()=>{
            //     console.log('notificando');

            //     this.gestionCarpetaService.notificarActualizacion()
            //   },
            //   error: (error) => {
            //     console.error('Error al actualizar después de crear carpeta', error);
            //   }

            // })
          }
        })
      }
    })


}




}
