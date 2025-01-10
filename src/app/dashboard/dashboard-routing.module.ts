import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PaginaPrincipalComponent } from './pages/pagina-principal/pagina-principal.component';
import { VistaCuadriculaComponent } from './components/vista-cuadricula/vista-cuadricula.component';
import { VistaListaComponent } from './components/vista-lista/vista-lista.component';
import { ArchivosPageComponent } from './pages/archivos-page/archivos-page.component';
import { GestionUsuariosPageComponent } from './pages/gestion-usuarios-page/gestion-usuarios-page.component';
import { rolGuard } from '../login/guards/rol.guard';
import { FormOficinaComponent } from './components/form-oficina/form-oficina.component';
import { FormProcesosComponent } from './components/form-procesos/form-procesos.component';
import { TodosUsuariosComponent } from './components/todos-usuarios/todos-usuarios.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { DefaultGestionComponent } from './components/default-gestion/default-gestion.component';

const routes: Routes = [
  {
    path: '',
    component:DashboardLayoutComponent,
    children: [
      {path:'principal', component:PaginaPrincipalComponent,
      children:[
        {path:'cuadricula',component:VistaCuadriculaComponent},
        {path:'lista', component:VistaListaComponent},
        {path:'**', redirectTo:'cuadricula'}
        ]},
      {path:'carpeta/:id',component:ArchivosPageComponent},
      {path:'gestion', component:GestionUsuariosPageComponent,
        children:[
          {path:'oficina', component:FormOficinaComponent},
          {path:'usuarios',component:FormularioComponent},
          {path:'procesos',component:FormProcesosComponent},
          {path:'all',component:TodosUsuariosComponent},
          {path:'default',component:DefaultGestionComponent},
          {path:'**', redirectTo:'default'},
        ],
        // canActivate: [rolGuard]
      },
      {path:'**',redirectTo:'principal'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
