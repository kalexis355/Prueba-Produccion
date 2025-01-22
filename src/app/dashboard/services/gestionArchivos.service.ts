import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { Documento, TipoArchivos } from '../interfaces/archivos.interface';
import { catchError, map, Observable, of, Subject, tap } from 'rxjs';

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

    // crearArchivo(documentoBody: Documento): Observable<any> {
    //   const token = localStorage.getItem('token');
    //   const url = `${this.baseUrl2}/Api/Archivos`;
    //   const headers = new HttpHeaders({
    //     'Authorization': `Bearer ${token}`
    //   });

    //   return this.http.post(url, documentoBody, {
    //     headers,
    //     reportProgress: true,
    //     observe: 'events'
    //   }).pipe(
    //     map(event => {
    //       console.log('Tipo de evento:', event.type);

    //       switch (event.type) {
    //         case HttpEventType.Sent: // 0
    //           return {
    //             status: 'sent',
    //             message: 'Solicitud enviada'
    //           };

    //         case HttpEventType.UploadProgress: // 1
    //           const uploadProgress = Math.round(100 * (event.loaded / (event.total || event.loaded)));
    //           return {
    //             status: 'progress',
    //             progress: uploadProgress,
    //             loaded: event.loaded,
    //             total: event.total,
    //             type: 'upload'
    //           };

    //         case HttpEventType.DownloadProgress: // 3
    //           const downloadProgress = Math.round(100 * (event.loaded / (event.total || event.loaded)));
    //           return {
    //             status: 'progress',
    //             progress: downloadProgress,
    //             loaded: event.loaded,
    //             total: event.total,
    //             type: 'download'
    //           };

    //         case HttpEventType.ResponseHeader: // 2
    //           return {
    //             status: 'headers',
    //             headers: event.headers
    //           };

    //         case HttpEventType.Response: // 4
    //           this.notificarActualizacion();
    //           return {
    //             status: 'complete',
    //             response: event.body
    //           };

    //         default:
    //           return {
    //             status: 'other',
    //             event
    //           };
    //       }
    //     }),
    //     catchError(error => {
    //       console.error('Error al crear archivo:', error);
    //       throw error;
    //     })
    //   );
    // }
    crearArchivo(documentoBody: Documento): Observable<any> {
      return new Observable(observer => {
        const token = localStorage.getItem('token');
        const url = `${this.baseUrl2}/Api/Archivos`;

        // Crear XMLHttpRequest
        const xhr = new XMLHttpRequest();

        // Configurar el evento de progreso
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            observer.next({
              status: 'progress',
              progress: percentComplete,
              loaded: event.loaded,
              total: event.total,
              type: 'upload'
            });
          }
        };

        // Configurar el evento de completado
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            this.notificarActualizacion();
            observer.next({
              status: 'complete',
              response: JSON.parse(xhr.response)
            });
            observer.complete();
          } else {
            observer.error(`Error ${xhr.status}: ${xhr.statusText}`);
          }
        };

        // Configurar el evento de error
        xhr.onerror = () => {
          observer.error('Error de red');
        };

        // Abrir la conexión
        xhr.open('POST', url, true);

        // Configurar headers
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        // Enviar la solicitud
        const data = JSON.stringify(documentoBody);
        console.log('📦 Tamaño del archivo a subir:', data.length, 'bytes');
        xhr.send(data);

        // Retornar una función de limpieza
        return () => {
          if (xhr.readyState !== 4) {
            xhr.abort();
          }
        };
      });
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
