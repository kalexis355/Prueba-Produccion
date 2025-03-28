import { Component, inject, OnInit } from '@angular/core';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import { UsuarioConsultado } from '../../../login/interfaces';
import { DialogoGestionUsuariosComponent } from '../../components/dialogo-gestion-usuarios/dialogo-gestion-usuarios.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-gestion-solo-usuarios-page',
  templateUrl: './gestion-solo-usuarios-page.component.html',
  styleUrl: './gestion-solo-usuarios-page.component.scss'
})
export class GestionSoloUsuariosPageComponent implements OnInit {
  public gestionUsuarios = inject(GestionUsuariosService)
  public usuarios: UsuarioConsultado[] = [];
  public usuariosFiltrados: UsuarioConsultado[] = [];

  constructor(private dialog: MatDialog){}

  ngOnInit(): void {
    this.cargarUsuarios()
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

    openUserModal() {
      this.dialog.open(DialogoGestionUsuariosComponent, {
        width: '1000px',
        height: '550px',
        maxWidth: '100%', // Desactiva el ancho máximo
      });
    }
}
