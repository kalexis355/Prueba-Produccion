import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { EstadoCarpeta, TipoCarpeta, NivelVisualizacion } from '../../interfaces/carpeta.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioConsultado } from '../../../login/interfaces';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import Swal from 'sweetalert2'
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.component.html',
  styleUrl: './dialogo.component.css'
})
export class DialogoComponent implements OnInit {


  public gestionCarpetas = inject(GestionCarpetasService);
  public gestionUsuarios = inject(GestionUsuariosService);
    public route = inject(ActivatedRoute);



  CarpetaForm!: FormGroup;


  //valor
  //se crea la propiedad que tendra el input
  nombreCarpeta: string = '';
  descripcion:string = ''
  selectedTipo: string = '' ;
  subserie:string='';

  subserieActiva: boolean = false;
  nivelVisualizacionActivo: boolean = false;

  tiposCarpetas:TipoCarpeta[]=[];
  usuarios: UsuarioConsultado[] = [];
  estadoCarpeta: EstadoCarpeta[]=[];
  NivelVisualizacion: NivelVisualizacion[]=[]



  //se injectala propiedad del dialogo pasando como referencia el mismo
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogoComponent>) { }


  ngOnInit(): void {
    this.ObtenertiposCarpetas();
    this.ObtenerUsuarios();
    this.ObtenerEstadoCarpeta();
    this.obtenerNivelVisualizacion();

    this.inicializarFormulario();

        // Escuchar cambios en "tipoCarpeta"
        this.CarpetaForm.get('tipoCarpeta')?.valueChanges.subscribe(value => {
          this.onTipoChange(value);
        });



  }

  inicializarFormulario(){
    this.CarpetaForm = this.fb.group({
      nombreCarpeta:['',Validators.required],
      descripcion:['',Validators.required],
      tipoCarpeta:['',Validators.required],
      carpetaEstado:['',Validators.required],
      codigoSubSerie:[],
      delegado:[],
      nivelVisualizacion:[]
    })
  }

  onTipoChange(event: Event): void {
    // Verifica si event.target es un elemento HTML
    const target = event.target as HTMLSelectElement;

    if (!target || !target.value) {

      return; // Evita errores si target es indefinido
    }

    const valorSeleccionado = target.value;
    // console.log('Tipo seleccionado:', valorSeleccionado);

    const codigoSubSerieControl = this.CarpetaForm.get('codigoSubSerie');
    const controlNivelVisualizacion = this.CarpetaForm.get('nivelVisualizacion');

    if (valorSeleccionado === '2') {
      this.subserieActiva = true;
      // Aplicar el validador requerido
      codigoSubSerieControl?.setValidators(Validators.required);
    } else {
      this.subserieActiva = false;
      // Eliminar cualquier validador
      codigoSubSerieControl?.clearValidators();
    }

    if(valorSeleccionado=== '3' || valorSeleccionado ==='4'){
      this.nivelVisualizacionActivo = true;

      controlNivelVisualizacion?.setValidators(Validators.required);
    }else{
      this.nivelVisualizacionActivo = false;
      controlNivelVisualizacion?.clearValidators();

    }

    controlNivelVisualizacion?.updateValueAndValidity();
    // Actualiza el estado del control
    codigoSubSerieControl?.updateValueAndValidity();
  }





  ObtenertiposCarpetas(){
    this.gestionCarpetas.ObtenerTipoCarpetas()
    .subscribe((tipoCarpetas)=>{
      this.tiposCarpetas = tipoCarpetas
      console.log(this.tiposCarpetas,'tipos');

    })
  }

  ObtenerUsuarios(){
    this.gestionUsuarios.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioConsultado[]) => {

        this.usuarios = usuarios;

      },
      error: (err) => {
        console.error('Error al obtener los usuarios:', err);
      }
    });
  }

  ObtenerEstadoCarpeta(){
    this.gestionCarpetas.ObtenerEstadosCarpeta()
    .subscribe({
      next:(estadosObtenidos: EstadoCarpeta[]) =>{
        this.estadoCarpeta = estadosObtenidos;
      },
      error:(err)=>console.log('error al obtener los estados')

    })
  }

  //si da clic en cerrar
  onNoClick(): void {
    this.dialogRef.close();
  }

  //si da clic en guardar se cierra pero pasando el valor por
  onSaveClick(): void {
    this.CarpetaForm.markAllAsTouched()

    if(this.CarpetaForm.valid){
      this.dialogRef.close(this.CarpetaForm.value)
    }else{

    }
  }

  obtenerNivelVisualizacion(){
    this.gestionCarpetas.obtenerNivelVisualizacion()
    .subscribe({
      next:(nivelesObtenidos:NivelVisualizacion[])=>{
        this.NivelVisualizacion= nivelesObtenidos
      }
    })
  }
}
