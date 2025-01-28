import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { catchError, delay, finalize, map, Observable, of, Subject, tap } from 'rxjs';
import { CarpetaRaiz, CopiarPegar, CortarPegar, CrearCarpeta, CrearCarpetaResponse, EstadoCarpeta, NivelVisualizacion, TipoCarpeta } from '../interfaces/carpeta.interface';
import { CarpetaContenido, DocumentoContenido } from '../interfaces/contenidoCarpeta';
import { LoaderService } from './gestionLoader.service';


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

  obtenerCarpetaRaiz(codUsuario:number):Observable<CarpetaRaiz[]>{
    // this.loaderService.mostrar();
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Carpetas?CarpetasRaizIdUser=${codUsuario}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Show-Loading-Swal': 'true'
    });

    return this.http.get<CarpetaRaiz[]>(url,{headers})
    .pipe(
      tap((datos)=>console.log('datos servicio',datos.length)
      ),
      catchError(()=>of([])),
      // finalize(() => this.loaderService.ocultar())
    )

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

        try {
          // Limpiamos y validamos la respuesta
          const cleanResponse = response.trim();
          if (!cleanResponse.includes('][')) {
            throw new Error('Formato de respuesta inválido');
          }

          // Separar los arrays de texto
          const [carpetas, documentos] = cleanResponse
            .split('][')
            .map((part, index) => {
              const jsonString = index === 0 ? part + "]" : "[" + part;
              try {
                return JSON.parse(jsonString.trim());
              } catch {
                throw new Error(`Error al parsear ${index === 0 ? 'carpetas' : 'documentos'}`);
              }
            });

          return {
            Carpetas: carpetas as CarpetaContenido[],
            Documentos: documentos as DocumentoContenido[]
          };
        } catch (e) {
          console.error('Error al procesar la respuesta:', e);
          throw e; // Relanzamos el error para que lo maneje catchError
        }
      }),
      catchError((error) => {
        console.error('Error al cargar contenido de la carpeta:', error);
        // Podríamos mostrar un mensaje al usuario aquí si lo deseas
        // this.messageService.showError('No se pudo cargar el contenido de la carpeta');
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
