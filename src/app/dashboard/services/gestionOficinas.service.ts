import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { ActualizarOficinas, CrearOficina, CrearOficinaResponse, Oficinas, RespuestaBackend, RespuestaOficinaCreada } from '../../login/interfaces/oficina.interface';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { error } from 'console';
import { BorrarResponse } from '../../login/interfaces/proceso.interface';
import { CarpetasPadre } from '../interfaces/carpeta.interface';
import { IndexDbService } from './indexdb.service';

@Injectable({providedIn: 'root'})
export class GestionOficinasService {

  private http = inject(HttpClient);
  private indexdbService = inject(IndexDbService)
  private readonly baseUrl2: string = environments2.baseUrl

  public oficinaCreada = signal<Oficinas>({
    // Aquí debes colocar los campos requeridos en el objeto
      Cod: 0, // Si 'id' es un campo requerido en Oficinas
      Nombre: '', // Ejemplo de un campo 'nombre'
      Estado: false, // Otro campo con valor por defecto
      Entidad:0,
      CodigoSerie:0
  // Añade todos los campos obligatorios de Oficinas
  })

  public Oficinas = signal<Oficinas[]>([])

  private oficinasSubject = new BehaviorSubject<CarpetasPadre[]>([]);
  public oficinas$ = this.oficinasSubject.asObservable();
  // BehaviorSubject que mantiene el estado actual de las oficinas filtradas
  private oficinasFiltradas = new BehaviorSubject<any[]>([]);

  // Observable al que los componentes pueden suscribirse
  oficinasFiltradas$ = this.oficinasFiltradas.asObservable();

  setOficinasFiltradas(oficinas: any[]) {
    this.oficinasFiltradas.next(oficinas);
  }

  // Método para obtener el valor actual
  getOficinasFiltradas() {
    return this.oficinasFiltradas.value;
  }

  constructor() { }


  crearOficina(bodyCrear:CrearOficina):Observable<RespuestaBackend>{
    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/Oficinas?ByEntidad=true`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const body = bodyCrear
    console.log(body,'body a crear');

    return this.http.post<RespuestaBackend>(url,body,{headers})
  }

  obtenerOficinas():Observable<Oficinas[]>{
    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/Oficinas?ByEntidad=true`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Oficinas[]>(url,{headers})
    .pipe(
      tap((oficinas:Oficinas[])=>{
        this.Oficinas.set(oficinas)
      }),
      catchError(()=>of([]))
    )
  }

  borrarOficina(id:number):Observable<BorrarResponse[]>{

    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Oficinas/${id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<BorrarResponse[]>(url,{headers})
    .pipe(
      tap(mensaje=>console.log(mensaje)
      ),
      catchError(()=>of())
    )
  }

  // this.obtenerOficinas().subscribe(oficinas => {
  //   this.oficinasSubject.next(oficinas);
  // });
  async actualizarOficinas() {
    console.log('esta actualizando oficinas');

    const carpetasPadres = await this.indexdbService.obtenerCarpetasPadre()
    this.oficinasFiltradas.next(carpetasPadres)
    console.log(carpetasPadres,'notificacion de nueva carpeta creada');

    // this.oficinasSubject.next(carpetasPadres)
  }

  actualizarDependencia(bodyActualizar:ActualizarOficinas):Observable<CrearOficinaResponse>{
    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/Oficinas`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const body = bodyActualizar

    return this.http.put<CrearOficinaResponse>(url,body,{headers})
  }

  ActualizarEstadoDependencia(dependencia:ActualizarOficinas){
    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/Oficinas`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<CrearOficinaResponse>(url,dependencia,{headers})
  }

}
