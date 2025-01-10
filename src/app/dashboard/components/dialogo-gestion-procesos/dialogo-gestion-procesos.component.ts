import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { GestionProcesosService } from '../../services/gestionProcesos.service';
import Swal from 'sweetalert2';
import { Procesos } from '../../../login/interfaces/proceso.interface';
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoListadoOficinasProcesoComponent } from '../dialogo-listado-oficinas-proceso/dialogo-listado-oficinas-proceso.component';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-dialogo-gestion-procesos',
  templateUrl: './dialogo-gestion-procesos.component.html',
  styleUrl: './dialogo-gestion-procesos.component.css'
})
export class DialogoGestionProcesosComponent implements OnInit {

  public procesoService = inject(GestionProcesosService)
  public oficinaService = inject(GestionOficinasService)

  public procesosObtenidos:Procesos[]=[]

  oficinas: Oficinas[] = [];
  oficinasProcesoActual: string[] = [];

  procesoSeleccionado!:Procesos

@ViewChild('tabGroup') tabGroup!: MatTabGroup;


  constructor(private dialog: MatDialog){}

  ngOnInit(): void {
    this.cargarProcesos()
    this.procesoService.procesos$.subscribe(procesos=>{
      this.procesosObtenidos = procesos
    })

    this.cargarOficinas();

  }

  cargarOficinas():void{
    this.oficinaService.obtenerOficinas()
    .subscribe(oficinas=>{
      this.oficinas=oficinas;
    })
  }

  cargarProcesos():void{
    this.procesoService.obtenerProcesos()
    .subscribe( procesos =>{
      this.procesosObtenidos= procesos
      console.log(this.procesosObtenidos,'hola');
    }
    )
  }

  borrarProceso(id:number,nombre:string){
    this.procesoService.borrarProceso(id)
    .subscribe(()=>{
      Swal.fire('Exito',`${nombre} borrado con exito`,'success')
      this.cargarProcesos();
    })
  }

  verListaOficina(procesoId:number){

    const proceso = this.procesosObtenidos.find((p) => p.Cod === procesoId);

    console.log(proceso );
    if (proceso) {
      // Filtrar las oficinas por los códigos en OficinasProceso del proceso
      this.oficinasProcesoActual = proceso.OficinasProceso.map((oficinaProceso) => {
        const oficina = this.oficinas.find((o) => o.Cod === oficinaProceso.Oficina);
        return oficina ? oficina.Nombre : 'Oficina desconocida';
      });

      // Mostrar la lista de nombres en consola o en otro lugar, como un modal
      console.log('Oficinas del proceso:', this.oficinasProcesoActual);

      this.dialog.open(DialogoListadoOficinasProcesoComponent,{
        data:{nombresOficinas: this.oficinasProcesoActual},
        width:'200px',
        height:'400px'
      })
    }
  }

  editarProceso(proceso:Procesos){
    this.procesoSeleccionado = proceso
    this.tabGroup.selectedIndex = 1;
  }

}
