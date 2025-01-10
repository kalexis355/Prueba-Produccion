import { Component, computed, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../login/services/auth.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { Roles } from '../../../login/interfaces/roles.interface';
import { RolesService } from '../../services/obtencionRoles.service';
import { RolUsuario } from '../../../login/interfaces';
import { ProcesosUsuarioService } from '../../services/procesoUsuarios.service';

@Component({
  selector: 'app-dialogo-roles',
  templateUrl: './dialogo-roles.component.html',
  styleUrl: './dialogo-roles.component.css'
})
export class DialogoRolesComponent implements OnInit {

  public authService = inject(AuthService)
  private authService2 = inject(Auth2Service)
  public roleService = inject(RolesService)
  public procesoUsuarioService = inject(ProcesosUsuarioService)


  public user = computed(() => this.authService2.currentUSer2());

  selectedRole: string = '' ;
  public roles:Roles[]=[]
  rolesNombres: string[] = [];

  constructor(public dialogRef: MatDialogRef<DialogoRolesComponent>){

  }


  ngOnInit(): void {
    this.cargarOpcionesRoles()
    this.cargarRoles()

  }




  aceptar(){
    if (this.selectedRole) {
      // Primero cerramos el diálogo con el rol seleccionado
      this.dialogRef.close(this.selectedRole);

      // Luego, de forma separada, puedes configurar el rol en tu servicio (si es necesario)
      if(this.selectedRole==='Administrador'){
        this.procesoUsuarioService.setRol2(2)
      }else {
        this.procesoUsuarioService.setRol2(3)
      }
      // this.procesoUsuarioService.setRol(this.selectedRole);
    } else {
      console.log('Por favor, selecciona un rol');
    }
  }

  cargarRoles():void{
    this.roleService.obtenerRoles()
    .subscribe(rolesObtenidos=>{
      this.roles=rolesObtenidos
      this.cargarOpcionesRoles();
    })
  }

  cargarOpcionesRoles(){

    const rolesFiltrados = this.user()!.RolesUsuario.filter(rol =>
      this.esRolValido(rol.Rol)
    );

    // this.rolesNombres = this.obtenerNombresRoles(rolesFiltrados);
    this.rolesNombres = this.obtenerOpcionesRol(rolesFiltrados);
  }


  // cargarNombresRolesUsuario(): void {

  //   this.rolesNombres = this.obtenerNombresRoles(this.user()!.RolesUsuario);
  //   console.log(this.rolesNombres,'cargarNombresRolesUsuarios');

  // }

  obtenerOpcionesRol(rolesUsuario: RolUsuario[]):string[]{
    const nombresRoles = rolesUsuario.map((rol) =>
      this.obtenerNombreRol(rol.Rol)
    );

    const esAdmin = nombresRoles.includes('Administrador');
    const esUsuario =
      nombresRoles.includes('Usuario') || nombresRoles.includes('Encargado');

      const opciones: string[] = [];
      if (esAdmin) {
        opciones.push('Administrador');
      }
      if (esUsuario) {
        opciones.push('Usuario');
      }

      return opciones;


  }

  obtenerNombreRol(codRol: number): string {
    const rol = this.roles.find(r => r.Cod === codRol);
    return rol ? rol.Nombre : 'Rol desconocido';
  }

  obtenerNombresRoles(rolesUsuario: RolUsuario[]): string[] {
    return rolesUsuario.map(rol => this.obtenerNombreRol(rol.Rol));
  }

  esRolValido(codRol: number): boolean {
    const nombreRol = this.obtenerNombreRol(codRol);
    return nombreRol === 'Administrador' ||
    nombreRol === 'Usuario' ||
    nombreRol ==='Encargado';
  }
}
