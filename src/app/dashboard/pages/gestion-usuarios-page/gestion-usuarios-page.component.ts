import { Component, inject } from '@angular/core';
import { AuthService } from '../../../login/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoGestionUsuariosComponent } from '../../components/dialogo-gestion-usuarios/dialogo-gestion-usuarios.component';
import { DialogoGestionOficinaComponent } from '../../components/dialogo-gestion-oficina/dialogo-gestion-oficina.component';
import { DialogoGestionProcesosComponent } from '../../components/dialogo-gestion-procesos/dialogo-gestion-procesos.component';

@Component({
  selector: 'app-gestion-usuarios-page',
  templateUrl: './gestion-usuarios-page.component.html',
  styleUrl: './gestion-usuarios-page.component.css'
})
export class GestionUsuariosPageComponent {


  public authService = inject(AuthService)


  public usuario:boolean = false

  constructor(private dialog: MatDialog){}

  crearUsuario(){
    this.usuario = true;
  }
  gestionUsuario(){
    this.usuario = false;
  }

  openUserModal() {
    this.dialog.open(DialogoGestionUsuariosComponent, {
      width: '1200px',
      height: '600px',
      maxWidth: '100%', // Desactiva el ancho máximo
    });
  }

  openOficinaModal() {
    this.dialog.open(DialogoGestionOficinaComponent, {
      width: '1200px',
      height: '600px',
      maxWidth: '100%', // Desactiva el ancho máximo
    });
  }

  openProcesoModal() {
    this.dialog.open(DialogoGestionProcesosComponent, {
      width: '1200px',
      height: '600px',
      maxWidth: '100%', // Desactiva el ancho máximo
    });
  }
}
