import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import {
  catchError,
  delay,
  finalize,
  firstValueFrom,
  from,
  interval,
  map,
  Observable,
  of,
  retry,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import {
  ArchivoGenericoExpediente,
  CarpetaBase,
  CarpetaEstructura,
  CarpetaRaiz,
  CarpetasResponse,
  ContenidoCarpetaProcesado,
  CopiarPegar,
  CortarPegar,
  CrearCarpeta,
  CrearCarpetaResponse,
  DetalleCarpeta,
  EstadoCarpeta,
  FolderNavigationState,
  IndiceUnificado,
  NivelVisualizacion,
  TipoCarpeta,
} from '../interfaces/carpeta.interface';
import {
  CarpetaContenido,
  DocumentoContenido,
} from '../interfaces/contenidoCarpeta';
import { LoaderService } from './gestionLoader.service';
import { IndexDbService } from './indexdb.service';
import * as pako from 'pako';
import { openDB } from 'idb';
interface MixedItem {
  Cod: number;
  Nombre: string;
  Estado: boolean;
  // Propiedades específicas de carpetas
  TipoCarpeta?: number;
  CarpetaPadre?: number;
  // Propiedades específicas de documentos
  TipoArchivo?: number;
  Carpeta?: number;
  Ruta?: string;
  [key: string]: any; // Para otras propiedades que puedan existir
}
@Injectable({ providedIn: 'root' })
export class GestionCarpetasService implements OnDestroy {
  private http = inject(HttpClient);
  private loaderService = inject(LoaderService);
  private indexService = inject(IndexDbService);

  private readonly baseUrl2: string = environments2.baseUrl;

  public tiposDeCarpeta = signal<TipoCarpeta[]>([]);
  public estadosCarpeta = signal<EstadoCarpeta[]>([]);

  private actualizarContenidoSource = new Subject<void>();

  // Observable que otros componentes pueden suscribirse
  actualizarContenido$ = this.actualizarContenidoSource.asObservable();
  private dbName = 'FilyDB';
  private storeName = 'estructuraDocumental';

  private updateInterval$ = interval(5000);
  private destroy$ = new Subject<void>();
  private actualizacionIniciada = false; // Nuevo flag para controlar el estado
  private primeraVezIniciado = false;
  private subscription: Subscription | null = null;




  constructor() {}

  notificarActualizacion() {
    this.actualizarContenidoSource.next();
  }

  unificarIndicesElectronicos(carpetas: CarpetaRaiz[]): IndiceUnificado {
    const indiceUnificado: IndiceUnificado = {
      IndiceElectronico: [],
    };

    carpetas.forEach((carpeta) => {
      try {
        const indiceActual = JSON.parse(
          carpeta.IndiceElectronico
        ) as IndiceUnificado;
        indiceUnificado.IndiceElectronico.push(
          ...indiceActual.IndiceElectronico
        );
      } catch (error) {
        console.log(
          `Error al procesar carpeta ${carpeta.Cod}: No tiene indice electronico`,
          error
        );
      }
    });

    return indiceUnificado;
  }

  obtenerCarpetaRaiz(codUsuario: number): Observable<CarpetasResponse> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas?CarpetasRaizIdUser=${codUsuario}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'X-Show-Loading-Swal': 'true',
    });

    return this.http.get<CarpetaRaiz[]>(url, { headers }).pipe(
      map((carpetas) => ({
        carpetasOriginales: carpetas,
        indiceUnificado: this.unificarIndicesElectronicos(carpetas),
      })),
      tap((datos) => console.log('datos servicio', datos)),
      catchError(() =>
        of({
          carpetasOriginales: [],
          indiceUnificado: { IndiceElectronico: [] },
        })
      )
    );
  }



  inicializarServicio() {

    this.detenerActualizacion();

    if (this.primeraVezIniciado) {
      return; // Si ya se inicializó, no hacemos nada
    }

    // Primera carga y configuración
    this.ObtenerYMostrarGzip().subscribe({
      next: (data: CarpetaEstructura) => {
        this.iniciarActualizacionPeriodica();
        this.primeraVezIniciado = true;
      },
      error: (error) => {
        console.error('Error en carga inicial:', error);
        this.detenerActualizacion();
      }
    });
  }

  // iniciarActualizacionPeriodica() {
  //   if (this.actualizacionIniciada) {
  //     console.log('La actualización ya está en curso');
  //     return;
  //   }

  //   this.actualizacionIniciada = true;
  //   console.log('Iniciando actualización periódica');

  //   this.updateInterval$
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       switchMap(() => this.ObtenerYMostrarGzip())
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         // console.log('Actualización exitosa');
  //       },
  //       error: (error) => {
  //         console.error('Error en actualización:', error);
  //       },
  //     });
  // }

  iniciarActualizacionPeriodica() {
    if (this.actualizacionIniciada ) {
      return;
    }

    this.destroy$ = new Subject<void>();
    this.actualizacionIniciada = true;

    this.subscription = this.updateInterval$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.ObtenerYMostrarGzip();
        })
      )
      .subscribe({
        next: (data) => {
          // Actualización exitosa
        },
        error: (error) => {
          console.error('Error en actualización:', error);
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.detenerActualizacion();
          }
        }
      });
  }

  ObtenerYMostrarGzip(): Observable<CarpetaEstructura> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas?EstructuraDocumental=true`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Accept-Encoding': 'gzip, deflate',
      Accept: 'application/json',
    });

    return this.http
      .get<CarpetaEstructura>(url, {
        headers,
        responseType: 'json',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          if (!response.body) {
            throw new Error('Respuesta vacía del servidor');
          }

          try {
            const jsonData = response.body;

            // Usar el nuevo método selectivo de guardarCarpetas
            this.indexService
              .guardarCarpetas(jsonData.estructura_documental)
              .then(() => console.log('Carpetas actualizadas selectivamente'))
              .catch((err) =>
                console.error('Error actualizando carpetas:', err)
              );

            return jsonData;
          } catch (error) {
            console.error('Error al procesar los datos:', error);
            throw error;
          }
        }),
        catchError((error) => {
          console.error('Error en la petición:', error);
          return throwError(() => error);
        })
      );
  }

  detenerActualizacion() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.actualizacionIniciada) {
      this.destroy$.next();
      this.destroy$.complete();
      this.actualizacionIniciada = false;
      this.primeraVezIniciado = false;
      console.log('Actualización periódica detenida');
    }
  }

  ngOnDestroy(): void {
    this.detenerActualizacion();
  }

  ObtenerTipoCarpetas(): Observable<TipoCarpeta[]> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaTiposCarpetas=true`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<TipoCarpeta[]>(url, { headers }).pipe(
      tap((tiposCarpeta: TipoCarpeta[]) => {
        this.tiposDeCarpeta.set(tiposCarpeta);
      }),
      catchError(() => of([]))
    );
  }

  crearCarpetas(carpetaBody: CrearCarpeta): Observable<CrearCarpetaResponse> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<CrearCarpetaResponse>(url, carpetaBody, { headers });
  }

  ObtenerEstadosCarpeta(): Observable<EstadoCarpeta[]> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaEstadosCarpetas=true`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<EstadoCarpeta[]>(url, { headers }).pipe(
      tap((estadosCarpetas: EstadoCarpeta[]) => {
        this.estadosCarpeta.set(estadosCarpetas);
      }),
      catchError(() => of([]))
    );
  }

  // CargarContenidoCarpeta(
  //   id: number
  // ): Observable<{
  //   Carpetas: CarpetaContenido[];
  //   Documentos: DocumentoContenido[];
  // }> {
  //   this.loaderService.mostrar();
  //   const token = localStorage.getItem('token');
  //   const url = `${this.baseUrl2}/Api/Carpetas?ContenidoCarpetaId=${id}`;

  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   return this.http.get(url, { headers, responseType: 'text' }).pipe(
  //     delay(500),
  //     map((response: string) => {
  //       if (!response?.trim()) {
  //         throw new Error('Respuesta vacía del servidor');
  //       }

  //       const cleanResponse = response.trim();

  //       try {
  //         const mixedArray = JSON.parse(cleanResponse) as MixedItem[];

  //         // Ahora especificamos el tipo del parámetro item
  //         const carpetas = mixedArray.filter(
  //           (item: MixedItem) => 'TipoCarpeta' in item
  //         ) as CarpetaContenido[];
  //         const documentos = mixedArray.filter(
  //           (item: MixedItem) => 'TipoArchivo' in item
  //         ) as DocumentoContenido[];

  //         return {
  //           Carpetas: carpetas,
  //           Documentos: documentos,
  //         };
  //       } catch (error: unknown) {
  //         console.error('Error al procesar la respuesta:', error);
  //         if (error instanceof Error) {
  //           throw new Error(
  //             `Error al procesar el formato de la respuesta: ${error.message}`
  //           );
  //         } else {
  //           throw new Error(
  //             'Error desconocido al procesar el formato de la respuesta'
  //           );
  //         }
  //       }
  //     }),
  //     catchError((error) => {
  //       console.error('Error al cargar contenido de la carpeta:', error);
  //       return of({ Carpetas: [], Documentos: [] });
  //     }),
  //     finalize(() => {
  //       this.loaderService.ocultar();
  //     })
  //   );
  // }

  obtenerNivelVisualizacion(): Observable<NivelVisualizacion[]> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaNivelesVisualizacionCarpetas=True`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<NivelVisualizacion[]>(url, { headers });
  }

  eliminarCarpeta(cod: number): Observable<any> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas/${cod}`;
    console.log(cod, 'codigo a eliminar');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete<any>(url, { headers });
  }

  cortarPegarCarpeta(bodyPegarCortar: CortarPegar): Observable<any> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas/Cortar-Carpeta`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(url, bodyPegarCortar, { headers }).pipe(
      tap((data) => console.log(data, 'data al corta y pegar')),
      catchError((error) => {
        console.error('Error al cortar:', error);
        return of({});
      })
    );
  }

  copiarPegarCarpeta(bodyCopiarPegar: CopiarPegar): Observable<any> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas/Copiar-Carpeta`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(url, bodyCopiarPegar, { headers }).pipe(
      tap((data) => console.log(data, 'data al copiar y pegar')),
      catchError((error) => {
        console.error('Error al cortar:', error);
        return of({});
      })
    );
  }



  obtenerContenidoCarpeta(codigoCarpeta: number): Observable<ContenidoCarpetaProcesado> {
    return from(this.indexService.validarCarpeta(codigoCarpeta)).pipe(
      switchMap(() => {
        const token = localStorage.getItem('token');
        const url = `${this.baseUrl2}/Api/Carpetas?ContenidoCarpetaId=${codigoCarpeta}`;

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Accept-Encoding': 'gzip, deflate',
          Accept: 'application/json',
        });

        return this.http.get<CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] }>(url, {
          headers,
          responseType: 'json',
          observe: 'response',
        }).pipe(
          map((response) => {
            if (!response.body) {
              throw new Error('Respuesta vacía del servidor');
            }

            const { contenido, ...carpetaPrincipal } = response.body;

            const subcarpetas = contenido.filter(
              (item): item is CarpetaBase => item.TipoNodo === 'carpeta'
            );

            const archivos = contenido.filter(
              (item): item is ArchivoGenericoExpediente => item.TipoNodo === 'archivo'
            );

            return {
              carpetaPrincipal,
              subcarpetas,
              archivos
            };
          })
        );
      }),
      catchError((error) => {
        console.error('Error:', error);
        return throwError(() => new Error(`Error al obtener contenido de la carpeta: ${error.message}`));
      })
    );
  }

  stopInterval() {

    this.destroy$.next();
    this.destroy$.complete();
  }


  detallesCarpeta(cod:number):Observable<DetalleCarpeta>{
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas?byId=${cod}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<DetalleCarpeta>(url,{headers})

  }


}


