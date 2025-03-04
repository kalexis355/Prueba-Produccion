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
  ContenidoCarpetaResponse,
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
  private historicoNavegacion: number[] = [];



  constructor() {}


  agregarACamino(codigoCarpeta: number) {
    // Verificar si el código ya existe en el historial
    const indiceExistente = this.historicoNavegacion.indexOf(codigoCarpeta);

    if (indiceExistente !== -1) {
      // Si existe, cortar el historial hasta ese punto
      this.historicoNavegacion = this.historicoNavegacion.slice(0, indiceExistente + 1);
    } else {
      // Si no existe, agregarlo al final
      this.historicoNavegacion.push(codigoCarpeta);
    }
  }


  obtenerCaminoActual(): number[] {
    return [...this.historicoNavegacion];
  }

  volverANivel(nivel: number) {
    if (nivel >= 0 && nivel < this.historicoNavegacion.length) {
      this.historicoNavegacion = this.historicoNavegacion.slice(0, nivel + 1);
      return this.historicoNavegacion[nivel];
    }
    return null;
  }

  volverAtras() {
    if (this.historicoNavegacion.length > 1) {
      this.historicoNavegacion.pop();
      return this.historicoNavegacion[this.historicoNavegacion.length - 1];
    }
    return null;
  }

  reiniciarRuta(){
    this.historicoNavegacion =[]
  }

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
    // console.log('consumiendo el primer endpoint');

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

  crearCarpetas(carpetaBody: CrearCarpeta): Observable<CarpetaBase[]> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<CarpetaBase[]>(url, carpetaBody, { headers }).pipe(
    // Después de todo, forzamos una actualización general
    switchMap((carpetaCreada) => {
      return this.ObtenerYMostrarGzip().pipe(
        map(() => carpetaCreada)  // Devolvemos la carpeta creada
      );
    })
    );
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

  // private cacheCarpetas = new Map<number, CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] }>();

// Método modificado para buscar subcarpetas dentro de la caché existente
obtenerContenidoCarpeta(codigoCarpeta: number): Observable<ContenidoCarpetaResponse> {
  const token = localStorage.getItem('token');
  const url = `${this.baseUrl2}/Api/Carpetas?ContenidoCarpetaId=${codigoCarpeta}`;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Accept-Encoding': 'gzip, deflate',
    Accept: 'application/json',
  });

  return this.http.get<ContenidoCarpetaResponse>(url, { headers }).pipe(
    tap((carpetaContenido) => console.log("[API] Datos obtenidos:", carpetaContenido)), // Log para depuración
    catchError((error) => {
      console.error("[ERROR] No se pudo obtener la carpeta:", error);
      return throwError(() => new Error(`Error al obtener la carpeta ${codigoCarpeta}: ${error.message}`));
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


