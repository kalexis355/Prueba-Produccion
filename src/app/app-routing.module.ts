import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isAuthenticatedGuard, isNotAuthenticatedGuard } from './login/guards';

const routes: Routes = [
  {
    path:'auth',
    canActivate: [isNotAuthenticatedGuard],
    loadChildren: () => import('./login/login.module').then( m => m.LoginModule)
  },
  {
    path:'dashboard',
    canActivate: [isAuthenticatedGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path:'',
    redirectTo:'auth',
    pathMatch:'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
