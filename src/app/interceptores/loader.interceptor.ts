import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { Observable, finalize, tap } from "rxjs";
import { LoaderService } from "../dashboard/services/gestionLoader.service";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  private readonly EXCLUDED_URLS = [
    'https://api.soft-solutions.org/Api/Carpetas?CarpetasRaizIdUser=',
    'https://api.soft-solutions.org/Api/Carpetas?EstructuraDocumental=true',
    // Agrega aquí más URLs que quieras excluir
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregamos logs para debug
    // console.log('URL interceptada:', req.url);
    // console.log('¿URL incluye el patrón?:', req.url.includes('api.soft-solutions.org/Api/Carpetas?CarpetasRaizIdUser='));



    // Probablemente necesitas incluir https:// en la verificación
    if (this.EXCLUDED_URLS.some(url => req.url.includes(url))) {
      return next.handle(req);
    }

    // console.log('Mostrando loader para:', req.url);
    this.loaderService.mostrar();

    return next.handle(req).pipe(
      finalize(() => this.loaderService.ocultar())
    );
  }
}
