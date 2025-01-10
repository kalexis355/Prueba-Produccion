import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog } from '@angular/material/dialog';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../../login/services/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { Carpeta, CrearCarpeta, NivelVisualizacion } from '../../interfaces/carpeta.interface';
import { Auth2Service } from '../../../login/services/auth2.service';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { response } from 'express';
import Swal from 'sweetalert2'
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'dashboard-btn-mas',
  templateUrl: './btn-mas.component.html',
  styleUrl: './btn-mas.component.css'
})
export class BtnMasComponent implements OnInit {

  @Input()
  public idPadre?:number

  //injeccion de servicios o librerias
  public dashService = inject(DashboardService)
  public authService2 = inject(Auth2Service)
  public gestionCarpetaService = inject(GestionCarpetasService)
  public route = inject(ActivatedRoute)


  roles: any[] = [];
  id!:number
  serie:number=0;

  //utilizacion de propiedades material
  constructor(public dialog: MatDialog) { }



  ngOnInit(): void {
    this.roles=this.authService2.getRolesUsuario()

    // console.log(this.roles,'roles Extraidos');

    this.obtenerSerie()

  }


  obtenerSerie(){
    const serie = localStorage.getItem('serie')
    if(serie)
    this.serie = +serie
  }


  //metodo para abrir el dialogo
  // openDialog(): void {
  //   //se crea una constante con la propiedad del constructur llamando al componente que tiene la estructura del dialogo
  //   const dialogRef = this.dialog.open(DialogoComponent);

  //   //se usa la propiedad creada anteriormente para cerrar el dialogo pero antes del cierre
  //   //se suscribe para poder obtener los datos de ese dialogo
  //   dialogRef.afterClosed().subscribe(result => {
  //     //se verifica si el resultado es vacio o undefined
  //     if (result !== undefined && result !== '') {
  //       // se crean las propiedades que se desean agregar
  //       const fecha = new Date()
  //       const nombreCarpeta = result;
  //       // se llama al metodo para agregar una nueva carpeta con todos sus atributos
  //       if(this.idPadre){
  //         const carpetaPadre = this.dashService.getCarpetaId(this.idPadre)
  //         const carpetahijo:Carpeta = {
  //           id:uuidv4(),
  //           PadreId2:this.idPadre,
  //           nombre:nombreCarpeta,
  //           fechaCreacion:fecha,
  //           creador:this.authService2.currentUSer2()!.Nombres,
  //           tipo:'carpeta',
  //           hijos:[],
  //           permisos:['read', 'write', 'delete', 'share', 'rename', 'manage_permissions', 'upload', 'download', 'view_audit_logs', 'lock']
  //         }
  //         carpetaPadre?.hijos?.push(carpetahijo)
  //         console.log('holas');

  //       }else{
  //         console.log('hola');

  //         this.dashService.addCarpeta({
  //           id:uuidv4(),
  //           nombre:nombreCarpeta,
  //           fechaCreacion:fecha,
  //           creador:this.authService2.currentUSer2()!.Nombres,
  //           tipo:'carpeta',hijos:[],
  //           permisos:['read', 'write', 'delete', 'share', 'rename', 'manage_permissions',
  //              'upload', 'download', 'view_audit_logs', 'lock']
  //             });
  //       }

  //     }else{

  //     }

  //   });
  // }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogoComponent,{
      width:'450px',
      height:'550px',
      disableClose: true,
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
            Swal.fire('Éxito', 'Carpeta Creada', 'success');
            this.gestionCarpetaService.notificarActualizacion(); // Notificar actualización
          }
        })
      }
    })


}


}
