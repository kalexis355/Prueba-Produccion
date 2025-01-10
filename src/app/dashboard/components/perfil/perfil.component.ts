import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { LoginResponse2, RolUsuario, User } from '../../../login/interfaces';
import { AuthService } from '../../../login/services/auth.service';
import { timingSafeEqual } from 'crypto';
import { Router } from '@angular/router';
import { Auth2Service } from '../../../login/services/auth2.service';
import { ProcesosUsuarioService } from '../../services/procesoUsuarios.service';
import { RolesService } from '../../services/obtencionRoles.service';
import { Roles } from '../../../login/interfaces/roles.interface';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {


  //injeccion de servicios
  public authService = inject(AuthService)
  public authService2 = inject(Auth2Service)
  public procesoUsuarioServicio = inject(ProcesosUsuarioService)
  public roleService = inject(RolesService)


  public router = inject(Router)
  public selectedRole?: string
  rolesNombres: string[] = [];
  public roles:Roles[]=[]

  public user = computed(() => this.authService2.currentUSer2());

  //señal para saber el usuario actual
  // public user = computed(()=> this.authService.currentUSer())

  //propiedad para recibir informacion del usuario
  @Input()
  public usuario?: LoginResponse2 | null

  ngOnInit(): void {
    this.rolesNombres = this.obtenerNombresRoles(this.user()!.RolesUsuario);
    this.cargarRoles()
  }

  //metodo para cerrar sesion
  onLogout(){
    this.authService2.logout2()
  }


  onRoleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedRole = selectElement.value;

    // Aquí puedes ejecutar lógica adicional dependiendo del rol seleccionado

    // this.procesoUsuarioServicio.setRol(this.selectedRole)
    if(this.selectedRole==='Administrador'){
      this.procesoUsuarioServicio.setRol2(2)
    }else {
      this.procesoUsuarioServicio.setRol2(3)
    }
    // Añade más lógica si es necesario
    this.redireccionarRol(this.selectedRole)
  }

  redireccionarRol(rol:string){
    if(rol !== 'Administrador' && rol !== 'Sa'){
      this.router.navigateByUrl('/dashboard/principal/cuadricula')
    }else{
      this.router.navigateByUrl('/dashboard/gestion/default')

    }
  }

  cargarRoles():void{
    this.roleService.obtenerRoles()
    .subscribe(rolesObtenidos=>{
      this.roles=rolesObtenidos
      this.cargarNombresRolesUsuario();
    })
  }

  cargarNombresRolesUsuario(): void {

    const rolesFiltrados = this.user()!.RolesUsuario.filter(rol =>
      this.esRolValido(rol.Rol)
    );

    this.rolesNombres = this.obtenerOpcionesRol(rolesFiltrados);
  }

  obtenerOpcionesRol(rolesUsuario:RolUsuario[]):string[]{
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
    return nombreRol === 'Administrador' || nombreRol === 'Usuario'  || nombreRol === 'Encargado';
  }

}
