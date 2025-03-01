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

  crearCarpetas(carpetaBody: CrearCarpeta): Observable<CrearCarpetaResponse> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<CrearCarpetaResponse>(url, carpetaBody, { headers }).pipe(
      switchMap((response) => {
        // Después de crear la carpeta, forzamos una actualización
        return this.ObtenerYMostrarGzip().pipe(
          map(() => response)  // Devolvemos la respuesta original
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

  private cacheCarpetas = new Map<number, CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] }>();

// Método modificado para buscar subcarpetas dentro de la caché existente
obtenerContenidoCarpeta(codigoCarpeta: number,forzarRecarga?:boolean): Observable<ContenidoCarpetaProcesado> {

  if (forzarRecarga) {
    console.log(`[CACHÉ] Forzando recarga, eliminando carpeta ${codigoCarpeta} de caché`);
    this.cacheCarpetas.delete(codigoCarpeta);
  }

  console.log(`[INICIO] Intentando obtener carpeta: ${codigoCarpeta}`);

  // Verificamos si tenemos la carpeta directamente en caché
  if (this.cacheCarpetas.has(codigoCarpeta)) {
    console.log(`[CACHÉ] Usando datos de caché para carpeta ${codigoCarpeta}`);
    const datosCached = this.cacheCarpetas.get(codigoCarpeta)!;
    return of(this.procesarDatos(datosCached, codigoCarpeta));
  }

  // Verificamos si la carpeta es una subcarpeta dentro de alguna carpeta en caché
  for (const [codPadre, datosPadre] of this.cacheCarpetas.entries()) {
    console.log(`[BÚSQUEDA] Buscando carpeta ${codigoCarpeta} dentro de ${codPadre}`);

    // Verificamos si la carpeta solicitada es una subcarpeta en el contenido
    const carpetaEncontra = datosPadre.contenido.find(
      item => item.TipoNodo === 'carpeta' && item.Cod === codigoCarpeta
    ) as CarpetaBase | undefined;

    if (carpetaEncontra) {
      console.log(`[ENCONTRADA] Carpeta ${codigoCarpeta} encontrada dentro de ${codPadre}`);

      // Buscamos su contenido (subcarpetas y archivos)
      const subcarpetas = datosPadre.contenido.filter(
        item => item.TipoNodo === 'carpeta' && (item as CarpetaBase).CarpetaPadre === codigoCarpeta
      ) as CarpetaBase[];

      const archivos = datosPadre.contenido.filter(
        item => item.TipoNodo === 'archivo' && (item as ArchivoGenericoExpediente).Carpeta === codigoCarpeta
      ) as ArchivoGenericoExpediente[];

      console.log(`[RESUMEN] Carpeta ${codigoCarpeta}: ${subcarpetas.length} subcarpetas, ${archivos.length} archivos`);

      // Construimos un objeto con la estructura esperada para esta carpeta
      const datosCarpeta = {
        ...carpetaEncontra,
        contenido: [...subcarpetas, ...archivos]
      };

      // Guardamos en caché para futuras consultas
      this.cacheCarpetas.set(codigoCarpeta, datosCarpeta);

      return of({
        carpetaPrincipal: carpetaEncontra,
        subcarpetas,
        archivos
      });
    }
  }

  // Si no está en caché o no es una subcarpeta de alguna en caché, hacemos la llamada al API
  console.log(`[API] Intentando obtener carpeta ${codigoCarpeta} desde API`);

  return from(this.indexService.validarCarpeta(codigoCarpeta).catch(error => {
    console.log(`[ERROR VALIDACIÓN] Error al validar carpeta ${codigoCarpeta}:`, error);
    throw error;
  })).pipe(
    switchMap(() => {
      console.log(`[API VALIDADA] Carpeta ${codigoCarpeta} validada, haciendo petición HTTP`);
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
            console.log(`[ERROR API] Respuesta vacía del servidor para carpeta ${codigoCarpeta}`);
            throw new Error('Respuesta vacía del servidor');
          }

          console.log(`[API ÉXITO] Datos recibidos del API para carpeta ${codigoCarpeta}`);

          // Guardamos en caché
          this.cacheCarpetas.set(codigoCarpeta, response.body);

          return this.procesarDatos(response.body, codigoCarpeta);
        })
      );
    }),
    catchError((error) => {
      console.log(`[ERROR MANEJO] Error capturado para carpeta ${codigoCarpeta}:`, error);
      return throwError(() => new Error(`Error al obtener la carpeta ${codigoCarpeta}: ${error.message}`));
    })
  );
}

  private procesarDatos(datos: CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] }, codigoCarpetaActual: number): ContenidoCarpetaProcesado {
    console.log(`[PROCESANDO] Procesando datos para carpeta ${codigoCarpetaActual}`);

    const { contenido, ...carpetaPrincipal } = datos;

    // Filtramos subcarpetas que pertenecen directamente a esta carpeta
    const subcarpetas = contenido.filter(
      (item): item is CarpetaBase =>
        item.TipoNodo === 'carpeta' &&
        (item as CarpetaBase).CarpetaPadre === codigoCarpetaActual
    );

    console.log(`[SUBCARPETAS] Encontradas ${subcarpetas.length} subcarpetas para carpeta ${codigoCarpetaActual}`);
    subcarpetas.forEach(subcarpeta => {
      console.log(`- Subcarpeta: ${subcarpeta.Nombre} (ID: ${subcarpeta.Cod})`);
    });

    // Filtramos archivos que pertenecen EXCLUSIVAMENTE a esta carpeta
    const archivos = contenido.filter(
      (item): item is ArchivoGenericoExpediente => {
        if (item.TipoNodo !== 'archivo') return false;

        const archivo = item as ArchivoGenericoExpediente;

        // Comprobamos que el archivo pertenece a esta carpeta
        if (archivo.Carpeta === codigoCarpetaActual) {
          console.log(`[ARCHIVO] Archivo ${archivo.Nombre} (ID: ${archivo.Cod}) pertenece a carpeta ${codigoCarpetaActual}`);
          return true;
        }

        return false;
      }
    );

    console.log(`[RESULTADO] Carpeta ${codigoCarpetaActual} - Resultado final: ${subcarpetas.length} subcarpetas, ${archivos.length} archivos`);

    return {
      carpetaPrincipal,
      subcarpetas,
      archivos
    };
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


