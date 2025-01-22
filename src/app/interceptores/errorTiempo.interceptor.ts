import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, timeout, catchError, TimeoutError, throwError } from "rxjs";
import { Auth2Service } from "../login/services/auth2.service";

import Swal from 'sweetalert2';
import { Router } from "@angular/router";


@Injectable()
export class errorTiempoInterceptor implements HttpInterceptor {

  private router = inject(Router)
  private authService = inject(Auth2Service)

  private readonly EXCLUDED_URLS = ['https://api.nublu.cloud/nublu/Api/Archivos']; // URLs a excluir
 constructor(
 ) {}

 intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Verificar si es una petición de subida de archivos
    if (this.isFileUpload(req)) {
      // Si es subida de archivos, no aplicar el timeout
      return next.handle(req);
    }


   return next.handle(req).pipe(
     timeout(10000), // 10 segundos
     catchError(error => {
       if (error instanceof TimeoutError) {
        Swal.fire('Sesión expirada', 'La operación tardó demasiado tiempo', 'warning');
        this.authService.logout2();
       }
       return throwError(() => error);
     })
   );
 }

 private isFileUpload(request: HttpRequest<any>): boolean {
  // Verificar por URL
  const isExcludedUrl = this.EXCLUDED_URLS.some(url =>
    request.url.includes(url)
  );

  // Verificar si es una petición multipart/form-data (típico en subidas de archivos)
  const isMultipartFormData = request.headers.get('Content-Type')?.includes('multipart/form-data');

  // Verificar si hay un FormData en el body
  const isFormData = request.body instanceof FormData;

  return isExcludedUrl || isMultipartFormData || isFormData;
}
}
