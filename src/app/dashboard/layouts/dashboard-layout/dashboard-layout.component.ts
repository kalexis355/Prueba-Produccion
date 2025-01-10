import { Component, computed, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../login/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoRolesComponent } from '../../components/dialogo-roles/dialogo-roles.component';
import { Router } from '@angular/router';
import { Auth2Service } from '../../../login/services/auth2.service';
import { ProcesosUsuarioService } from '../../services/procesoUsuarios.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent implements OnInit {

    // Estado de carga
    public isLoading = true;

  private authService2 = inject(Auth2Service)
  private dialogo = inject(MatDialog)
  private router = inject(Router)
  public procesoUsuarioService = inject(ProcesosUsuarioService)



    //Formas de poder obtener el usuario de manera actualizada
  public user = computed(()=> this.authService2.currentUSer2())

  constructor(){
    this.checkLoginStatus();

  }
  ngOnInit(): void {
    if(this.user()!.RolesUsuario.length >1){
      this.abrirDialogoRoles()
    }else{
      this.procesoUsuarioService.setRol2(this.user()?.RolesUsuario[0].Rol!)
    }
  }

  abrirDialogoRoles(){
    const dialogoReferente = this.dialogo.open(DialogoRolesComponent,{
      disableClose: true
    });
    dialogoReferente.afterClosed().subscribe((nombre) => {
      if(nombre){
        if(nombre === 'Sa' || nombre=== 'Administrador'){
          this.router.navigateByUrl('/dashboard/gestion')
        }
      }
    });
  }

    // Método para verificar el estado del login y cargar los datos
    checkLoginStatus() {

      // console.log(this.authService2.currentUSer2(),'checkingLogin');

      // Simular un tiempo de carga o una verificación
      setTimeout(() => {
        if (this.authService2.currentUSer2()) {
          // Usuario autenticado, terminar la carga
          this.isLoading = false;
        }
      }, 1000); // Simulación de 1 segundo de carga, puedes cambiar esto a tus necesidades
    }



}
