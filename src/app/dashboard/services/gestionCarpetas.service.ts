import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { catchError, delay, finalize, map, Observable, of, Subject, tap } from 'rxjs';
import { CarpetaRaiz, CarpetasResponse, CopiarPegar, CortarPegar, CrearCarpeta, CrearCarpetaResponse, EstadoCarpeta, IndiceUnificado, NivelVisualizacion, TipoCarpeta } from '../interfaces/carpeta.interface';
import { CarpetaContenido, DocumentoContenido } from '../interfaces/contenidoCarpeta';
import { LoaderService } from './gestionLoader.service';

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
@Injectable({providedIn: 'root'})
export class GestionCarpetasService {
  pipe(arg0: any, arg1: any) {
    throw new Error('Method not implemented.');
  }

  private http = inject(HttpClient);
  private loaderService = inject(LoaderService)
  private readonly baseUrl2: string = environments2.baseUrl


  public tiposDeCarpeta = signal<TipoCarpeta[]>([])
  public estadosCarpeta = signal<EstadoCarpeta[]>([])

  private actualizarContenidoSource = new Subject<void>();

  // Observable que otros componentes pueden suscribirse
  actualizarContenido$ = this.actualizarContenidoSource.asObservable();

  constructor() { }

  notificarActualizacion() {
    this.actualizarContenidoSource.next();
  }

  unificarIndicesElectronicos(carpetas: CarpetaRaiz[]): IndiceUnificado {
    const indiceUnificado: IndiceUnificado = {
      IndiceElectronico: []
    };

    carpetas.forEach(carpeta => {
      try {
        const indiceActual = JSON.parse(carpeta.IndiceElectronico) as IndiceUnificado;
        indiceUnificado.IndiceElectronico.push(...indiceActual.IndiceElectronico);
      } catch (error) {
        console.log(`Error al procesar carpeta ${carpeta.Cod}: No tiene indice electronico`, error);
      }
    });

    return indiceUnificado;
  }

  // obtenerCarpetaRaiz(codUsuario:number):Observable<CarpetaRaiz[]>{
  //   // this.loaderService.mostrar();
  //   const token = localStorage.getItem('token')
  //   const url = `${this.baseUrl2}/Api/Carpetas?CarpetasRaizIdUser=${codUsuario}`;

  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`,
  //     'X-Show-Loading-Swal': 'true'
  //   });

  //   return this.http.get<CarpetaRaiz[]>(url,{headers})
  //   .pipe(
  //     tap((datos)=>console.log('datos servicio',datos.length)
  //     ),
  //     catchError(()=>of([])),
  //     // finalize(() => this.loaderService.ocultar())
  //   )

  // }
  obtenerCarpetaRaiz(codUsuario: number): Observable<CarpetasResponse> {
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Carpetas?CarpetasRaizIdUser=${codUsuario}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Show-Loading-Swal': 'true'
    });

    return this.http.get<CarpetaRaiz[]>(url, { headers }).pipe(
      map(carpetas => ({
        carpetasOriginales: carpetas,
        indiceUnificado: this.unificarIndicesElectronicos(carpetas)
      })),
      tap(datos => console.log('datos servicio', datos)),
      catchError(() => of({ carpetasOriginales: [], indiceUnificado: { IndiceElectronico: [] } }))
    );
  }



  ObtenerTipoCarpetas():Observable<TipoCarpeta[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaTiposCarpetas=true`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<TipoCarpeta[]>(url,{headers})
    .pipe(
      tap((tiposCarpeta:TipoCarpeta[])=>{
        this.tiposDeCarpeta.set(tiposCarpeta)
      }),
      catchError(()=> of([]))
    )
  }

  crearCarpetas(carpetaBody:CrearCarpeta):Observable<CrearCarpetaResponse>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Carpetas`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<CrearCarpetaResponse>(url,carpetaBody,{headers})

  }

  ObtenerEstadosCarpeta():Observable<EstadoCarpeta[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaEstadosCarpetas=true`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<EstadoCarpeta[]>(url,{headers})
    .pipe(
      tap((estadosCarpetas:EstadoCarpeta[])=>{
        this.estadosCarpeta.set(estadosCarpetas)
      }),
      catchError(()=>of([]))
    )
  }

  CargarContenidoCarpeta(id: number): Observable<{ Carpetas: CarpetaContenido[], Documentos: DocumentoContenido[] }> {
    this.loaderService.mostrar();
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas?ContenidoCarpetaId=${id}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(url, { headers, responseType: 'text' }).pipe(
      delay(500),
      map((response: string) => {
        if (!response?.trim()) {
          throw new Error('Respuesta vacía del servidor');
        }

        const cleanResponse = response.trim();

        try {
          const mixedArray = JSON.parse(cleanResponse) as MixedItem[];

          // Ahora especificamos el tipo del parámetro item
          const carpetas = mixedArray.filter((item: MixedItem) => 'TipoCarpeta' in item) as CarpetaContenido[];
          const documentos = mixedArray.filter((item: MixedItem) => 'TipoArchivo' in item) as DocumentoContenido[];

          return {
            Carpetas: carpetas,
            Documentos: documentos
          };
        } catch (error: unknown) {
          console.error('Error al procesar la respuesta:', error);
          if (error instanceof Error) {
            throw new Error(`Error al procesar el formato de la respuesta: ${error.message}`);
          } else {
            throw new Error('Error desconocido al procesar el formato de la respuesta');
          }
        }
      }),
      catchError((error) => {
        console.error('Error al cargar contenido de la carpeta:', error);
        return of({ Carpetas: [], Documentos: [] });
      }),
      finalize(() => {
        this.loaderService.ocultar();
      })
    );
  }

  obtenerNivelVisualizacion():Observable<NivelVisualizacion[]>{
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaNivelesVisualizacionCarpetas=True`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<NivelVisualizacion[]>(url,{headers})
  }

  eliminarCarpeta(cod:number):Observable<any>{
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas/${cod}`;
    console.log(cod,'codigo a eliminar');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(url,{headers})

  }

  cortarPegarCarpeta(bodyPegarCortar:CortarPegar):Observable<any>{
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas/Cortar-Carpeta`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(url,bodyPegarCortar,{headers})
    .pipe(
      tap((data)=>console.log(data,'data al corta y pegar')
      ),
      catchError((error) => {
        console.error('Error al cortar:', error);
        return of({ });
      })
    )

  }

  copiarPegarCarpeta(bodyCopiarPegar:CopiarPegar):Observable<any>{
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl2}/Api/Carpetas/Copiar-Carpeta`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(url,bodyCopiarPegar,{headers})
    .pipe(
      tap((data)=>console.log(data,'data al copiar y pegar')
      ),
      catchError((error) => {
        console.error('Error al cortar:', error);
        return of({ });
      })
    )
  }




}
