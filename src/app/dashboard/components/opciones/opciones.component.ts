import { Component, inject } from '@angular/core';
import { AuthService } from '../../../login/services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Carpeta } from '../../interfaces/carpeta.interface';
import { RutaService } from '../../services/ruta.service';
import { Auth2Service } from '../../../login/services/auth2.service';

@Component({
  selector: 'app-opciones',
  templateUrl: './opciones.component.html',
  styleUrl: './opciones.component.css'
})
export class OpcionesComponent {

  //se injecta los servicios
  private authService = inject(AuthService)
  private authService2 = inject(Auth2Service)

  private dashService = inject(DashboardService)
  private rutaService = inject(RutaService)

  //controlar el despliegue y cambio de icono
  isActive = false;


  //metodo para traer las carpetas del servicio de datos
  get carpetas():Carpeta[]{
    return this.dashService.getCarpetas();
  }

  // rolAdministrador():boolean{


  //   //   if(this.authService.getSelectedRole() === 'Administrador'){
  //   //     return true
  //   // }else {
  //   //   for (const rol of this.authService.currentUSer()!.roles) {
  //   //     if(rol === 'Administrador'){
  //   //       return true
  //   //     }
  //   //   }
  //   // }
  //   // return false;
  //   if(this.authService.currentUSer2()!.RolesUsuario.length>1){
  //     if(this.authService.getSelectedRole() === 'Administrador'){
  //       return true
  //   }
  //   }else{
  //     for (const rol of this.authService.currentUSer()!.roles) {
  //       if(rol==='Administrador'){
  //         return true
  //       }
  //     }
  //   }

  //     return false
  // }

  rolAdminSa():boolean{
    const rol = localStorage.getItem('role')
    // 1 es Sa y 2 es Administrador 
    return rol ==='1' || rol==='2'
  }


  //metodo para cerrar sesion
  onLogout(){
    this.authService2.logout2()
  }

  //metodo para cambiar el estado de la propiedad de despliegue
  setActive() {
    this.isActive = !this.isActive;
  }
  borrarTodaRuta(){
    this.rutaService.guardarRuta.set([])
  }

}
