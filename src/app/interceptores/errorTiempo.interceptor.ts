import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, timeout, catchError, TimeoutError, throwError } from "rxjs";
import { Auth2Service } from "../login/services/auth2.service";
import { Router } from "@angular/router";
import { SwalService } from "../dashboard/services/swal.service";

@Injectable()
export class errorTiempoInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private authService = inject(Auth2Service);
  private swalService = inject(SwalService);

  private readonly EXCLUDED_URLS = ['https://api.soft-solutions.org/nublu/Api/Archivos'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isFileUpload(req)) {
      return next.handle(req);
    }

    const mostrarSwal = req.headers.has('X-Show-Loading-Swal');

    return new Observable<HttpEvent<any>>(observer => {
      const makeRequest = () => {
        if (mostrarSwal) {
          this.swalService.mostrarCargando();
        }

        next.handle(req).pipe(
          timeout(30000),
          catchError(error => {
            if (error instanceof TimeoutError) {
              this.swalService.cerrarCargando();

              return new Observable<HttpEvent<any>>(timeoutObserver => {
                this.swalService.mostrarTimeoutDialog().then(retry => {
                  if (retry) {
                    if (mostrarSwal) {
                      this.swalService.mostrarCargando();
                    }
                    makeRequest();
                  } else {
                    this.authService.logout2();
                    timeoutObserver.complete();
                  }
                });
              });
            }
            return throwError(() => error);
          })
        ).subscribe({
          next: (event) => {
            observer.next(event);
          },
          error: (err) => {
            if (!(err instanceof TimeoutError)) {
              this.swalService.cerrarCargando();
              observer.error(err);
            }
          },
          complete: () => {
            if (mostrarSwal) {
              this.swalService.cerrarCargando();
            }
            observer.complete();
          }
        });
      };

      makeRequest();
    });
  }

  private isFileUpload(request: HttpRequest<any>): boolean {
    // Verificar por URL
    const isExcludedUrl = this.EXCLUDED_URLS.some(url =>
      request.url.includes(url)
    );

    // Verificar si es una petición multipart/form-data
    const isMultipartFormData = request.headers.get('Content-Type')?.includes('multipart/form-data');

    // Verificar si hay un FormData en el body
    const isFormData = request.body instanceof FormData;

    return isExcludedUrl || isMultipartFormData || isFormData;
  }
}
