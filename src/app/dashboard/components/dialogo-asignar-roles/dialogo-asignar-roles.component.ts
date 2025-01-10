import { Component, Inject, inject, OnInit } from '@angular/core';
import { RolesService } from '../../services/obtencionRoles.service';
import { BodyCodRol, BorrarRolResponse, Roles } from '../../../login/interfaces/roles.interface';
import { RolesUsuario, RolesUsuarioConsultado, RolUsuario } from '../../../login/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import Swal from 'sweetalert2';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';

@Component({
  selector: 'app-dialogo-asignar-roles',
  templateUrl: './dialogo-asignar-roles.component.html',
  styleUrl: './dialogo-asignar-roles.component.css'
})
export class DialogoAsignarRolesComponent implements OnInit {

  public roleService = inject(RolesService)
  public oficinaService = inject(GestionOficinasService)
  public usuarioService = inject(GestionUsuariosService)


  rolForm!: FormGroup;

  // public roles:Roles[]=[]
  public roles: (Roles & { asignado: boolean })[] = []; // Nueva propiedad "asignado"
  public oficinas:Oficinas[]=[]
  public nombresRoles: string[] = [];

  public rolesSeleccionados:RolesUsuarioConsultado[]=[]

  public rolesNuevosSeleccionados:RolUsuario[]=[]


   public rolSeleccion!:number
   public oficinaSeleccion!:number

   constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogoAsignarRolesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rolesEscogidos: RolesUsuarioConsultado[], modoEdicion:boolean }

   ){}

  ngOnInit(): void {

    this.cargarOficinas();
    this.cargarRoles();
    this.initializeForm();
    this.rolAsignado();
    this.oficinaAsignada()

  }

  cargarRolesFormulario(){

    console.log(this.rolesSeleccionados,'holota');

    if(this.data.rolesEscogidos && this.data.rolesEscogidos.length>0){
      this.rolesSeleccionados = this.data.rolesEscogidos

      this.roles.forEach((rol) => {
        // Revisa si el `Cod` de cada `rol` en `roles` coincide con `Rol` en `rolesSeleccionados`
        rol.asignado = this.rolesSeleccionados.some(
          (rolAsignado) => rolAsignado.Rol === rol.Cod
        );
      });
      console.log('Roles con estado asignado:', this.roles);
    }
  }

  initializeForm() {
    this.rolForm = this.fb.group({
      rol: ['', [Validators.required]],
      oficina:['']
    });
  }

  rolAsignado(){
    this.rolForm.get('rol')?.valueChanges.subscribe(
      (rolSeleccionado)=>{
        console.log(rolSeleccionado);
        this.rolSeleccion = +rolSeleccionado
        this.obligatorioOficina();
      }
    )
  }

  oficinaAsignada(){
    this.rolForm.get('oficina')?.valueChanges.subscribe(
      (oficinaSeleccionada)=>{
        this.oficinaSeleccion = +oficinaSeleccionada
      }
    )
  }

  rolEncargadoUsuario():boolean{


    return this.rolSeleccion !== null && (this.rolSeleccion===3 || this.rolSeleccion===5 )
  }

  obligatorioOficina(){
    const esEncargadoSeleccionado = this.rolEncargadoUsuario();
        const oficinaControl = this.rolForm.get('oficina');

        if (esEncargadoSeleccionado) {
          oficinaControl?.setValidators(Validators.required);
        } else {
          // Si no se selecciona Encargado, quitamos la validación requerida
          oficinaControl?.clearValidators();
        }

        oficinaControl?.updateValueAndValidity();
  }


  cargarRoles(): void {
    this.roleService.obtenerRoles()
      .subscribe(rolesObtenidos => {
        this.roles = rolesObtenidos.map(rol => ({
          ...rol,
          asignado: false // Inicialmente, todos los roles están disponibles
        }));

        this.cargarRolesFormulario();
      });
  }

  cargarOficinas():void{
    this.oficinaService.obtenerOficinas().subscribe(oficinas =>{
      this.oficinas=oficinas
    })
  }




  onSubmit(){
    this.rolForm.markAllAsTouched()
    if(this.rolForm.valid){
      if(this.rolSeleccion ===1 || this.rolSeleccion ===2 ||  this.rolSeleccion ===4){
        if(this.editarUSuario(this.data.rolesEscogidos)){
          const objetoRolNuevo:RolesUsuarioConsultado ={
            Oficina:0,
            Rol:this.rolSeleccion,
            Usuario:this.data.rolesEscogidos[0].Usuario,

          }

        this.rolesSeleccionados.push(objetoRolNuevo)
        const rolIndex = this.roles.findIndex(rol => rol.Cod === this.rolSeleccion);
        if (rolIndex !== -1) {
          this.roles[rolIndex].asignado = true;
        }
        this.rolForm.reset()

        console.log(this.rolesSeleccionados,'roles nuevos');

        }else{

          const objetoRoles:RolesUsuarioConsultado ={
            Oficina:0,
            Rol:this.rolSeleccion,
            Usuario:0,
          }

        this.rolesSeleccionados.push(objetoRoles)
        const rolIndex = this.roles.findIndex(rol => rol.Cod === this.rolSeleccion);
        if (rolIndex !== -1) {
          this.roles[rolIndex].asignado = true;
        }
        this.rolForm.reset()
        console.log(this.rolesSeleccionados,'roles nuevos');

        }

      }else{
        if(this.editarUSuario(this.data.rolesEscogidos)){
          const objetoRoles:RolesUsuario ={
            Oficina:this.oficinaSeleccion,
            Rol:this.rolSeleccion,
            Usuario: this.data.rolesEscogidos[0].Usuario,
          }
          console.log(this.oficinaSeleccion);

        this.rolesSeleccionados.push(objetoRoles)
        const rolIndex = this.roles.findIndex(rol => rol.Cod === this.rolSeleccion);
        if (rolIndex !== -1) {
          this.roles[rolIndex].asignado = true;
        }
        this.rolForm.reset()
        console.log(this.rolesSeleccionados,'roles nuevos user y encar');

        }else{
          const objetoRoles:RolesUsuario ={
            Oficina:this.oficinaSeleccion,
            Rol:this.rolSeleccion,
            Usuario: 0,
          }
          console.log(this.oficinaSeleccion);

        this.rolesSeleccionados.push(objetoRoles)
        const rolIndex = this.roles.findIndex(rol => rol.Cod === this.rolSeleccion);
        if (rolIndex !== -1) {
          this.roles[rolIndex].asignado = true;
        }
        this.rolForm.reset()
        console.log(this.rolesSeleccionados,'roles nuevos user y encar');
        }

      }
    }else{
      Swal.fire('Error', `Complete todos los campos`, 'error');

    }
  }

  obtenerNombreRol(codRol: number): string {
    const rol = this.roles.find(r => r.Cod === codRol);
    return rol ? rol.Nombre : 'Rol desconocido';
  }

  obtenerNombresRoles(rolesUsuario: RolUsuario[]): string[] {
    // Llena el arreglo `nombresRoles` con los nombres de los roles
    this.nombresRoles = rolesUsuario.map(rol => this.obtenerNombreRol(rol.Rol));
    return this.nombresRoles
  }

  cancelar(){
    this.rolSeleccion =0
    this.oficinaSeleccion = 0
    this.rolesSeleccionados=[]
    this.rolForm.reset()

    // this.dialogRef.close(); // Cierra el modal
    this.roles.forEach(rol => {
      rol.asignado = false;
    });

  }

  borrarRolAsignado(codRol:number){
    this.rolesSeleccionados = this.rolesSeleccionados.filter(rol => rol.Rol !== codRol);

    const rolIndex = this.roles.findIndex(rol => rol.Cod === codRol);
  if (rolIndex !== -1) {
    this.roles[rolIndex].asignado = false;
  }

    console.log(this.rolesSeleccionados,'rol despues de borrar');

  }




  borrarRolAsignadoBaseDatos(codRolUsuario:number){
    console.log(this.data.rolesEscogidos,'RolesDeUsuarioAEditar');

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result)=>{
      if(result.isConfirmed){
        this.usuarioService.eliminarRolAsignado(codRolUsuario)
        .subscribe({
          next: (response) => {
            Swal.fire('Éxito', response[0].Msg, 'success');

            this.rolesSeleccionados = this.rolesSeleccionados.filter(rol => rol.CodRolUsuario !== codRolUsuario);

            //Habilitar rol en el select
            // Habilitar el rol en el select:
            // Encontrar el rol eliminado en `this.rolesEscogidos` por `CodRolUsuario` y luego habilitarlo en `this.roles`.
            const rolUserEliminado = this.data.rolesEscogidos.find(rol => rol.CodRolUsuario === codRolUsuario);
            if (rolUserEliminado) {
              const rolIndex = this.roles.findIndex(rol => rol.Cod === rolUserEliminado.Rol);
              if (rolIndex !== -1) {
                this.roles[rolIndex].asignado = false;  // Cambiar el estado de asignado a `false`
              }
            }
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar el rol', 'error');
            console.error('Error al eliminar el rol:', error);
          }
        });
      }
    })

  }

  editarUSuario(roles: RolesUsuarioConsultado[] | undefined): boolean {
    if (roles && roles.length > 0) { // Verifica si `roles` está definido y no está vacío
      return roles.some(rol => rol.Usuario !== 0);
    } else {
      return false;
    }
  }

  desactivarRol(codRol:number){
    const bodyCodRol:BodyCodRol={
      CodRolUsuario: codRol
    }
    console.log(bodyCodRol);

    this.usuarioService.desactivarRolAsignado(bodyCodRol)
    .subscribe(mensaje=>{
      console.log('hola desactivar');

      Swal.fire('Éxito', mensaje, 'success');
      const rolIndex = this.rolesSeleccionados.findIndex(rol => rol.CodRolUsuario === codRol);
      if (rolIndex !== -1) {
        this.rolesSeleccionados[rolIndex].Estado = false; // Cambiar estado a 'Inactivo'
      }
    })
  }

  guardar(){
    this.dialogRef.close(this.rolesSeleccionados);
  }


  abrirListadoDependencias(oficina:number):string{
    console.log(oficina);
    console.log(this.oficinas);

    // Encontrar la oficina con el código proporcionado
    const oficinaEncontrada = this.oficinas.find(of => of.Cod === oficina);

    if (oficinaEncontrada) {
        return oficinaEncontrada.Nombre
    } else {
        return 'Sin dependencia'
    }


  }



}
