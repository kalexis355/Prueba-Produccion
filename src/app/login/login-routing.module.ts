import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LayoutPageComponent } from './layouts/layout-page/layout-page.component';
import { RecuperaContrasenaComponent } from './pages/recupera-contrasena/recupera-contrasena.component';

const routes: Routes=[{
  path:'',
  component:LayoutPageComponent,
  children:[
    {path:'sign-in', component:LoginPageComponent},
    {path:'recuperar', component:RecuperaContrasenaComponent},
    {path:'**',redirectTo:'recuperar'}
  ]
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [
    RouterModule
  ],
})
export class loginRoutingModule { }
