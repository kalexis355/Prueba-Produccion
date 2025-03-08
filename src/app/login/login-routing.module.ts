import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LayoutPageComponent } from './layouts/layout-page/layout-page.component';
import { RecuperaContrasenaComponent } from './pages/recupera-contrasena/recupera-contrasena.component';
import { ReiniciarContrasenaComponent } from './pages/reiniciar-contrasena/reiniciar-contrasena.component';

const routes: Routes=[{
  path:'',
  component:LayoutPageComponent,
  children:[
    {path:'sign-in', component:LoginPageComponent},
    {path:'recuperar', component:RecuperaContrasenaComponent},
    {path:'reiniciar',component:ReiniciarContrasenaComponent},
    {path:'**',redirectTo:'sign-in'}
  ]
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [
    RouterModule
  ],
})
export class loginRoutingModule { }
