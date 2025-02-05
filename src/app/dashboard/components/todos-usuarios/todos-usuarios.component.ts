import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import {  RolUsuario, User2, UserResponse, UsuarioConsultado } from '../../../login/interfaces';
import Swal from 'sweetalert2'
import { Roles } from '../../../login/interfaces/roles.interface';
import { RolesService } from '../../services/obtencionRoles.service';
import { catchError } from 'rxjs';
import { error } from 'console';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-todos-usuarios',
  templateUrl: './todos-usuarios.component.html',
  styleUrl: './todos-usuarios.component.css'
})
export class TodosUsuariosComponent implements OnInit {
  public gestionUsuarios = inject(GestionUsuariosService)
  public roleService = inject(RolesService)


  public usuarios: UsuarioConsultado[] = [];
  public usuariosFiltrados: UsuarioConsultado[] = [];

  public roles:Roles[]=[]


  constructor(private dialog: MatDialog) {}

  @Output()
  public editarUsuario:EventEmitter<UsuarioConsultado> = new EventEmitter();



  ngOnInit(): void {
    this.cargarUsuarios()
    this.cargarRoles()
    this.gestionUsuarios.usuarios$.subscribe(usuarios=>{
      this.usuarios=usuarios
      this.usuariosFiltrados = usuarios
    })
  }

  cargarUsuarios(): void {
    this.gestionUsuarios.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioConsultado[]) => {

        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
      },
      error: (err) => {
        console.error('Error al obtener los usuarios:', err);
      }
    });
  }

  eliminarUsuario(id:number){

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) =>{
      if(result.isConfirmed){
        this.gestionUsuarios.eliminarUsuario(id)
        .subscribe({
          next: (response: any) => {
        // Accede al primer elemento del arreglo y toma el mensaje

          Swal.fire('Éxito', response, 'success');
          this.cargarUsuarios();
        },
        error: (error) => {
        console.error('Error en la respuesta:', error);
        Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
      }
    })
      }
    })

  }

  cargarRoles():void{
    this.roleService.obtenerRoles()
    .subscribe(rolesObtenidos=>{
      this.roles=rolesObtenidos
    })
  }

  obtenerNombreRol(codRol: number): string {
    const rol = this.roles.find(r => r.Cod === codRol);
    return rol ? rol.Nombre : 'Rol desconocido';
  }

  obtenerNombresRoles(rolesUsuario: RolUsuario[]): string {
    return rolesUsuario
      .map(rol => this.obtenerNombreRol(rol.Rol)) // Obtén el nombre de cada rol
      .join(', '); // Concatenar con comas
  }

  modificarUsuario(usuario:UsuarioConsultado){
    this.editarUsuario.emit(usuario)
  }

  modificarEstadoUsuario(usuario:User2){
    const usuarioModificado = { ...usuario, Estado: !usuario.Estado };

    this.gestionUsuarios.actualizarEstadoUsuario(usuarioModificado)
    .subscribe(()=>{
      if(usuarioModificado.Estado === true){

        Swal.fire('Éxito', 'Usuario Activado', 'success');
      }else{
        Swal.fire('Éxito', 'Usuario Desactivado', 'success');

      }

      this.cargarUsuarios();

    }

  )
  }
  onBuscarUsuario(termino:string){
    if (!termino) {
      // Si no hay término de búsqueda, mostrar todos los usuarios
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    // Filtrar desde la lista original de usuarios
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.Nombres.toLowerCase().includes(termino.toLowerCase())
    );
  }



}
