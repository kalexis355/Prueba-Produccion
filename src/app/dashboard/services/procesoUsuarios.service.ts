import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { CarpetaRaiz } from '../../login/interfaces/proceso.interface';

@Injectable({providedIn: 'root'})
export class ProcesosUsuarioService {

  private http = inject(HttpClient);
  private readonly baseUrl2: string = environments2.baseUrl

  public carpetasRaiz = signal<CarpetaRaiz[]>([])
  private rolSubject = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  rol$ = this.rolSubject.asObservable();
  constructor() { }

  obtenerCarpetaRaiz(idOficina:number):Observable<CarpetaRaiz[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios?CarpetasRaiz=${idOficina}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<CarpetaRaiz[]>(url,{headers})
    .pipe(
      tap(carpetasRaizObtenidas=>{
        this.carpetasRaiz.set(carpetasRaizObtenidas)
      }),
      catchError(()=>{
        console.log('No se pudieron consultar las carpetas');
        return of()
      })
    )
  }

  setRol(rol: string) {
    localStorage.setItem('role', rol);
    this.rolSubject.next(rol); // Emitir el nuevo rol
  }

  setRol2(rol:number){
    localStorage.setItem('role',rol.toString())
  }

  getRol(): string | null {
    return this.rolSubject.value;
  }


}
