import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { Observable, finalize, tap } from "rxjs";
import { LoaderService } from "../dashboard/services/gestionLoader.service";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregamos logs para debug
    // console.log('URL interceptada:', req.url);
    // console.log('¿URL incluye el patrón?:', req.url.includes('api.soft-solutions.org/Api/Carpetas?CarpetasRaizIdUser='));

    // Probablemente necesitas incluir https:// en la verificación
    if (req.url.includes('https://api.soft-solutions.org/Api/Carpetas?CarpetasRaizIdUser=')) {
      // console.log('URL excluida del loader');
      return next.handle(req);
    }

    // console.log('Mostrando loader para:', req.url);
    this.loaderService.mostrar();

    return next.handle(req).pipe(
      finalize(() => this.loaderService.ocultar())
    );
  }
}
