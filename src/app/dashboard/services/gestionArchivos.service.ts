import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { Documento, TipoArchivos } from '../interfaces/archivos.interface';
import { catchError, Observable, of, Subject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GestionArchivosService {
  constructor() { }

    private http = inject(HttpClient);
    private readonly baseUrl2: string = environments2.baseUrl

    private actualizarContenidoSource = new Subject<void>();
    actualizarContenido$ = this.actualizarContenidoSource.asObservable();

    notificarActualizacion() {
      this.actualizarContenidoSource.next();
    }

  crearArchivo(documentoBody:Documento):Observable<any>{
    const token = localStorage.getItem('token')
        const url = `${this.baseUrl2}/Api/Archivos`;

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

    return this.http.post(url,documentoBody,{headers})
    .pipe(
      tap({
        next: (respuesta) => {
          console.log('Archivo creado exitosamente:', respuesta);
          this.notificarActualizacion(); // Notificar actualización
        },
        error: (error) => {
          console.error('Error al crear archivo:', error);
        }
      })
    )
  }

  obtenerTipoArchivo():Observable<TipoArchivos[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaTiposArchivos=true`;

    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    });

    return this.http.get<TipoArchivos[]>(url,{headers})
    .pipe(
      catchError(()=>of([]))
    )

  }

}
