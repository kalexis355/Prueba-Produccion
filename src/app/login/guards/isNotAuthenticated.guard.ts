import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';
import { Auth2Service } from '../services/auth2.service';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {

  // const url = state.url;
  // //es opcional si se quiere guardar la ruta a la cual se esta tratando de acceder
  // localStorage.setItem('url',url);

  //se realizan injecciones
  const authService2 = inject(Auth2Service);
  const router = inject(Router)

  // se verifica el status de la señal del servicio de autenticacion
  if( authService2.authStatus() === AuthStatus.authenticated){
    //si esta autenticado se vuelve a envia directamente al dasboard
  router.navigateByUrl('/dashboard')
  //y se retorna false para no dejar cargar el modulo de auth
    return false
  }
  //si no esta autenticado se retorna true y deja pasar al modulo auth
  return true;
};
