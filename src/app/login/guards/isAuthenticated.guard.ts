import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';
import { Auth2Service } from '../services/auth2.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

  // const url = state.url;
  // //es opcional si se quiere guardar la ruta a la cual se esta tratando de acceder
  // localStorage.setItem('url',url);
  //se realizan las injecciones
  const authService2 = inject(Auth2Service);
  const router = inject(Router)


  // se realiza una verificacion del estatus de la seña
  if( authService2.authStatus() === AuthStatus.authenticated){
    //si esta autenticado se retorna true y deja pasar al modulo
    return true
  }

  // si el estado es checking se retorna false y no se deja pasar a la ruta
  if(authService2.authStatus() === AuthStatus.checking){
    return false
  }

  //en caso de que la señal no sea autenticada se retorna false y se envia directamente al login
  router.navigateByUrl('/auth/login')

  return false;
};
