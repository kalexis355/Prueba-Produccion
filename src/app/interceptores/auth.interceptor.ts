import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        console.log('Interceptor captó error:', error.status);

        if (error.status === 401) {
          console.log('Interceptor ejecutando logout por 401');
          console.log('Condición de 401 cumplida');
          Swal.fire({
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
            icon: 'warning',
            timer: 5000,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
          });

          // Ejecutamos el logout después de 4 segundos
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 3000);
        }
        return throwError(() => error);
      })
    );
  }
}
