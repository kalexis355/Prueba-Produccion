import { Component, Inject, ViewChild } from '@angular/core';
import { User2, UsuarioConsultado } from '../../../login/interfaces';
import { MatTabGroup } from '@angular/material/tabs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-gestion-usuarios',
  templateUrl: './dialogo-gestion-usuarios.component.html',
  styleUrl: './dialogo-gestion-usuarios.component.css'
})
export class DialogoGestionUsuariosComponent {

  usuarioParaEditar!: UsuarioConsultado;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { usuario: UsuarioConsultado }
  ) {
    if (this.data && this.data.usuario) {
      console.log('Usuario recibido:', this.data.usuario);
    } else {
      console.log('Creando nuevo usuario');
    }
  }

  onEditarUsuario(usuario: any): void {
    this.usuarioParaEditar = usuario;  // Guarda el usuario seleccionado
    this.tabGroup.selectedIndex = 1;   // Cambia a la pestaña de "Registro / Modificación"
  }
}
