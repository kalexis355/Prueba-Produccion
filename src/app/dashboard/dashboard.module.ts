import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PaginaPrincipalComponent } from './pages/pagina-principal/pagina-principal.component';
import { BuscadorComponent } from './components/buscador/buscador.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { OpcionesComponent } from './components/opciones/opciones.component';
import { MaterialModule } from '../material/material.module';
import { DialogoComponent } from './components/dialogo/dialogo.component';
import { BtnMasComponent } from './components/btn-mas/btn-mas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VistaCuadriculaComponent } from './components/vista-cuadricula/vista-cuadricula.component';
import { VistaListaComponent } from './components/vista-lista/vista-lista.component';
import { PrimengModule } from '../primeng/primeng.module';
import { MessageService } from 'primeng/api';
import { PrimeraUltimaPipe } from './pipes/primeraUltima.pipe';
import { TreeFolderComponent } from './components/tree-folder/tree-folder.component';
import { ArchivosPageComponent } from './pages/archivos-page/archivos-page.component';
import { ArrastrarSoltarComponent } from './components/arrastrar-soltar/arrastrar-soltar.component';
import { MessagesModule } from 'primeng/messages';
import { ToastService } from './services/toast.service';
import { OpcionesCarpetaComponent } from './components/opciones-carpeta/opciones-carpeta.component';
import { DialogoCambiarNombreComponent } from './components/dialogo-cambiar-nombre/dialogo-cambiar-nombre.component';
import { DialogoCompartirComponent } from './components/dialogo-compartir/dialogo-compartir.component';
import { GestionUsuariosPageComponent } from './pages/gestion-usuarios-page/gestion-usuarios-page.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { TodosUsuariosComponent } from './components/todos-usuarios/todos-usuarios.component';
import { DialogoRolesComponent } from './components/dialogo-roles/dialogo-roles.component';
import { FormOficinaComponent } from './components/form-oficina/form-oficina.component';
import { FormProcesosComponent } from './components/form-procesos/form-procesos.component';
import { DefaultGestionComponent } from './components/default-gestion/default-gestion.component';
import { DialogoGestionUsuariosComponent } from './components/dialogo-gestion-usuarios/dialogo-gestion-usuarios.component';
import { DialogoGestionOficinaComponent } from './components/dialogo-gestion-oficina/dialogo-gestion-oficina.component';
import { DialogoGestionProcesosComponent } from './components/dialogo-gestion-procesos/dialogo-gestion-procesos.component';
import { BuscadorGenericoComponent } from './components/buscador-generico/buscador-generico.component';
import { DialogoListadoOficinasProcesoComponent } from './components/dialogo-listado-oficinas-proceso/dialogo-listado-oficinas-proceso.component';
import { DialogoAsignarRolesComponent } from './components/dialogo-asignar-roles/dialogo-asignar-roles.component';
import { DialogoSubirArchivoComponent } from './components/dialogo-subir-archivo/dialogo-subir-archivo.component';
import { VisualizadorArchivosComponent } from './components/visualizador-archivos/visualizador-archivos.component';
import { ArbolIndiceComponent } from './components/arbol-indice/arbol-indice.component';
import { LoaderPersonalizadoComponent } from './components/loader-personalizado/loader-personalizado.component';
import { MenuContextualComponent } from './components/menu-contextual/menu-contextual.component';
import { DetallesCarpetaComponent } from './components/detalles-carpeta/detalles-carpeta.component';
import { CarpetasContenidoComponent } from './components/carpetas-contenido/carpetas-contenido.component';
import { ArchivosContenidoComponent } from './components/archivos-contenido/archivos-contenido.component';
import { BtnSubirArchivoComponent } from './components/btn-subir-archivo/btn-subir-archivo.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    PaginaPrincipalComponent,
    BuscadorComponent,
    PerfilComponent,
    OpcionesComponent,
    BtnMasComponent,
    DialogoComponent,
    VistaCuadriculaComponent,
    VistaListaComponent,
    TreeFolderComponent,
    ArchivosPageComponent,
    ArrastrarSoltarComponent,
    OpcionesCarpetaComponent,
    DialogoCambiarNombreComponent,
    DialogoCompartirComponent,
    GestionUsuariosPageComponent,
    FormularioComponent,
    TodosUsuariosComponent,
    DialogoRolesComponent,
    FormOficinaComponent,
    FormProcesosComponent,
    DefaultGestionComponent,
    DialogoGestionUsuariosComponent,
    DialogoGestionOficinaComponent,
    DialogoGestionProcesosComponent,
    BuscadorGenericoComponent,
    DialogoListadoOficinasProcesoComponent,
    DialogoAsignarRolesComponent,
    DialogoSubirArchivoComponent,
    VisualizadorArchivosComponent,
    ArbolIndiceComponent,
    LoaderPersonalizadoComponent,
    MenuContextualComponent,
    DetallesCarpetaComponent,
    CarpetasContenidoComponent,
    ArchivosContenidoComponent,
    BtnSubirArchivoComponent

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    FormsModule,
    PrimengModule,
    PrimeraUltimaPipe,
    MessagesModule,
    ReactiveFormsModule,
  ],
  providers:[MessageService,ToastService],
})
export class DashboardModule { }
