import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../login/services/validators.service';
import { GestionProcesosService } from '../../services/gestionProcesos.service';
import { OficinaParticipante, ProcesoNuevo, Procesos } from '../../../login/interfaces/proceso.interface';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';

import Swal from 'sweetalert2'

@Component({
  selector: 'app-form-procesos',
  templateUrl: './form-procesos.component.html',
  styleUrl: './form-procesos.component.css'
})
export class FormProcesosComponent implements OnInit, OnChanges {

  processForm!: FormGroup;

  @Input()
  procesoAEditar!:Procesos | null

  esModoEdicion: boolean = false;

  public procesoService = inject(GestionProcesosService)
  public oficinaService = inject(GestionOficinasService)


  public oficinas:Oficinas[]= [];

  public oficinasParticipantes:OficinaParticipante[]= []

  public procesosObtenidos:Procesos[]=[]

  constructor(private fb: FormBuilder,
    private validatorService: ValidatorsService,
) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['procesoAEditar'] && changes['procesoAEditar'].currentValue) {
      this.esModoEdicion= true
      this.processForm.patchValue({
        nombre: this.procesoAEditar!.Nombre,
        participantes: this.procesoAEditar!.OficinasProceso.map(op => op.Oficina)
      });
    }
  }

  ngOnInit(): void {
    this.inicializarForm();
    this.cargarOficinas();
    this.oficinaSeleccionada();
  }

  inicializarForm(){
    this.processForm= this.fb.group({
      nombre:['',[Validators.required]],
      participantes:['',[Validators.required]]
    })
  }



  cargarOficinas(){
    this.oficinaService.obtenerOficinas()
    .subscribe(oficinasObtenidas =>{
      this.oficinas = oficinasObtenidas
    })
  }

  oficinaSeleccionada(){
    this.processForm.get('participantes')?.valueChanges
    .subscribe((oficinasProceso:number[]) =>{
      if(oficinasProceso){
        this.oficinasParticipantes = oficinasProceso.map(oficina => ({
          Oficina: oficina
        }));
      }else{
        this.oficinasParticipantes = [];
      }


    })
  }




  onSubmit(){

    this.processForm.markAllAsTouched()

    if(this.processForm.valid && this.oficinasParticipantes.length>0){
      const {nombre}= this.processForm.value

      const nuevoProceso:ProcesoNuevo={
        Nombre: nombre,
        OficinasProceso:this.oficinasParticipantes
      }

      this.procesoService.crearNuevoProceso(nuevoProceso).subscribe(data =>{
        Swal.fire('Exito',`Proceso de ${data.Nombre} creado`,'success')
        this.procesoService.actualizarProcesos()
        this.processForm.reset()
      })


    }else{

    }
  }

  cancelar(){
    this.esModoEdicion = false
    this.processForm.reset()
    this.procesoAEditar = null
  }
}
