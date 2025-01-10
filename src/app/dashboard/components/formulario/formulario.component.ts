import { GestionOficinasService } from './../../services/gestionOficinas.service';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../login/services/validators.service';
import Swal from 'sweetalert2'
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import { RolesService } from '../../services/obtencionRoles.service';
import { Roles } from '../../../login/interfaces/roles.interface';
import {  RolesUsuario, RolUsuario, User2, UsuarioConsultado } from '../../../login/interfaces';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import { TodosUsuariosComponent } from '../todos-usuarios/todos-usuarios.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogoAsignarRolesComponent } from '../dialogo-asignar-roles/dialogo-asignar-roles.component';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent implements OnInit,OnChanges {


  userForm!: FormGroup;

  @Input()
  public usuarioAEditar!: UsuarioConsultado | null;

  esModoEdicion:boolean = false



  public rolesSeleccionado:number[]= []

  public oficinaService = inject(GestionOficinasService)
  public roleService = inject(RolesService)
  public usuarioService = inject(GestionUsuariosService)


  public Oficinas:Oficinas[]= [];
  public usuarios: UsuarioConsultado[] = [];
  public roles:Roles[]=[]
  public rolesEscogidos:RolUsuario[]=[]
  public ofiSeleccionada:number =0

  constructor(
              private fb: FormBuilder,
              private validatorService: ValidatorsService,
              private dialog:MatDialog,
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioAEditar'] && changes['usuarioAEditar'].currentValue) {
      this.esModoEdicion= true
      console.log("Datos de usuarioAEditar recibidos:", this.usuarioAEditar);
      if(this.usuarioAEditar)
      this.userForm.patchValue({
        nombre: this.usuarioAEditar.Nombres,
        apellido: this.usuarioAEditar.Apellidos,
        telefono: this.usuarioAEditar.Telefono,
        identificacion: this.usuarioAEditar.Documento,
        usuario: this.usuarioAEditar.Usuario,
        contrasena: this.usuarioAEditar.Contraseña,
        repetircontraseña: this.usuarioAEditar.Contraseña,
        estado: this.usuarioAEditar.Estado

      });
    }
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nombre:['Cristian',Validators.required],
      apellido:['Gomez',Validators.required],
      telefono:['23456',Validators.required],
      identificacion:['12347674',[Validators.required]],
      usuario:['Cris',Validators.required],
      contrasena:['123456',[Validators.required]],
      repetircontraseña:['123456',[Validators.required]],
      estado: [],
    },
  {validators: this.validatorService.passwordsMatchValidator()});

  this.oficinaService.obtenerOficinas().subscribe(oficinas =>{
    this.Oficinas=oficinas
  })

  // this.rolesSeleccionados()
  // this.oficinaSeleccionada()
  this.cargarRoles()
  this.cargarUsuarios()

  }


  rolEncargado(): boolean {
    // Verificar que existan roles seleccionados y que el rol con id 3 esté entre ellos
    return this.rolesSeleccionado.length > 0 && (this.rolesSeleccionado.includes(3) || this.rolesSeleccionado.includes(5));
  }

  cargarRoles():void{
    this.roleService.obtenerRoles()
    .subscribe(rolesObtenidos=>{
      this.roles=rolesObtenidos
    })
  }


  enviarUsuarioEditado():User2{
    const {nombre,apellido,telefono,identificacion,usuario,contrasena,estado} = this.userForm.value

    const usuarioModificado:User2={
      Cod: this.usuarioAEditar!.Cod,
      Nombres:nombre,
      Apellidos:apellido,
      Telefono:telefono,
      Documento:identificacion,
      Usuario:usuario,
      Contraseña:contrasena,
      Estado: estado,
      Entidad:this.usuarioAEditar!.Entidad,
      RolesUsuario:this.rolesEscogidos
    }

    return usuarioModificado
  }


  // Método para enviar el formulario
  onSubmit(): void {
    this.userForm.markAllAsTouched()
    if (this.userForm.valid) {
      const {nombre,apellido,telefono,identificacion,usuario,contrasena} = this.userForm.value

      const nuevoUsuario:User2={
        Nombres:nombre,
        Apellidos:apellido,
        Telefono:telefono,
        Documento:identificacion,
        Usuario:usuario,
        Contraseña:contrasena,
        Entidad:0,
        RolesUsuario:this.rolesEscogidos

      }

      console.log(this.rolesEscogidos);

      if(this.esModoEdicion && this.usuarioAEditar){
        const usuarioModificado = this.enviarUsuarioEditado()

        this.usuarioService.actualizarUsuario(usuarioModificado)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', `Usuario ${usuarioModificado.Nombres} actualizado correctamente`, 'success');
            this.userForm.reset()
            this.usuarioAEditar = null
            this.rolesEscogidos=[]
            this.esModoEdicion = false;
            this.usuarioService.actualizarListaUsuarios();
          },
          error: (err) => {
            console.error('Error al actualizar el usuario:', err);
            Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
          }
        });

      }else{
        this.usuarioService.crearUsuario(nuevoUsuario)
        .subscribe((data=>{
          Swal.fire('Éxito', `Usuario ${data[0].Nombres}  creado correctamente`, 'success');
          this.userForm.reset()
          this.usuarioAEditar = null
          this.rolesEscogidos=[]
          this.esModoEdicion = false;
          this.usuarioService.actualizarListaUsuarios()
        }))
      }

    } else {
      // Si el formulario es inválido, verificar si las contraseñas no coinciden
      if (this.userForm.hasError('passwordsMismatch')) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      } else {
        // Iterar sobre los controles para detectar qué campo tiene errores
        for (const key in this.userForm.controls) {
          if (this.userForm.controls.hasOwnProperty(key)) {
            const controlErrors = this.userForm.get(key)?.errors;
            if (controlErrors) {
              Swal.fire('Error', `Error en el campo ${key}`, 'error');
              break; // Detener después de mostrar el primer error para no inundar con alertas
            }
          }
        }
      }
    }
  }


  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioConsultado[]) => {

        this.usuarios = usuarios;
      },
      error: (err) => {
        console.error('Error al obtener los usuarios:', err);
      }
    });
  }

  abrirDialogoRoles(){
    const dialogRef= this.dialog.open(DialogoAsignarRolesComponent,{
    width:'850px',
    height:'400px',
    maxWidth: '100%',
    data:{
      rolesEscogidos: this.usuarioAEditar?.RolesUsuario,
      modoEdicion: this.esModoEdicion}
    })

    console.log(this.usuarioAEditar?.RolesUsuario,'holita');


    dialogRef.afterClosed().subscribe(
      (rolesAsignados:RolesUsuario[])=>{
        if(rolesAsignados){
          this.rolesEscogidos = rolesAsignados
        }
      })


  }

  tieneRolesAsignados(): boolean {
    return this.rolesEscogidos.length > 0;
  }

  cancelar(){
    this.esModoEdicion = false;
    this.userForm.reset()
    this.usuarioAEditar = null
    this.rolesEscogidos=[]
  }


}

