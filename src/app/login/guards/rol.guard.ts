import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const rolGuard: CanActivateFn = (route, state) => {
  // const authService = inject(AuthService); // Inyectamos el AuthService
  // const router = inject(Router); // Inyectamos el Router

  // const role = authService.getSelectedRole(); // Obtenemos el rol actual del usuario
  // const role2 = authService.currentUSer()!.roles

  // if (role === 'Administrador' ||  role2?.includes('Administrador')) {
  //   return true; // Permitimos el acceso si el rol es 'Administrador'
  // } else {
  //   // Si no es administrador, redirigir a otra ruta, como una página de acceso denegado
  //   router.navigate(['/dashboard/principal/cuadricula']);
  //   return false; // Bloqueamos el acceso
  // }

  return false
};
