import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { BorrarResponse, OficinaParticipante, ProcesoNuevo, Procesos } from '../../login/interfaces/proceso.interface';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { log } from 'console';

@Injectable({providedIn: 'root'})
export class GestionProcesosService {

  private http = inject(HttpClient);
  private readonly baseUrl2: string = environments2.baseUrl

  public procesosObtenidos = signal<Procesos[]>([])

  private procesosSubject = new BehaviorSubject<Procesos[]>([]);
  public procesos$ = this.procesosSubject.asObservable();


  constructor() { }

  crearNuevoProceso(nuevoProceso:ProcesoNuevo):Observable<Procesos>{
    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/ProcesosAdministrativos?ByEntidad=true`;
    const body:ProcesoNuevo = nuevoProceso
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log(JSON.stringify(body),'Holaa');
    // console.log(body);


    return this.http.post<Procesos>(url,body,{headers})
    .pipe(
      tap(procesoRespuesta => console.log(procesoRespuesta)
      )
    )
    // return of()
  }

  obtenerProcesos():Observable<Procesos[]>{
    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/ProcesosAdministrativos?ByEntidad=true`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Procesos[]>(url,{headers})
    .pipe(
      tap((procesos:Procesos[])=>{
        this.procesosObtenidos.set(procesos)
      }),
      catchError(()=>of())
    )
  }

  borrarProceso(id:number):Observable<BorrarResponse[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/ProcesosAdministrativos?Id=${id}`;
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

    actualizarProcesos(): void {
    this.obtenerProcesos().subscribe(procesos => {
      this.procesosSubject.next(procesos);
    });
  }

}
