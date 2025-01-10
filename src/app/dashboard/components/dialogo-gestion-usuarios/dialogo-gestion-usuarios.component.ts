import { Component, ViewChild } from '@angular/core';
import { User2, UsuarioConsultado } from '../../../login/interfaces';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-dialogo-gestion-usuarios',
  templateUrl: './dialogo-gestion-usuarios.component.html',
  styleUrl: './dialogo-gestion-usuarios.component.css'
})
export class DialogoGestionUsuariosComponent {

  usuarioParaEditar!: UsuarioConsultado;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  onEditarUsuario(usuario: any): void {
    this.usuarioParaEditar = usuario;  // Guarda el usuario seleccionado
    this.tabGroup.selectedIndex = 1;   // Cambia a la pestaña de "Registro / Modificación"
  }
}
