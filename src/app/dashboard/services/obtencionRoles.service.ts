import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments2 } from '../../../environments/environments-dev';
import { Roles } from '../../login/interfaces/roles.interface';
import { Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class RolesService {

  private http = inject(HttpClient);
  private readonly baseUrl2: string = environments2.baseUrl

  public roles = signal<Roles[]>([])

  constructor() { }

  obtenerRoles():Observable<Roles[]>{

    const token = localStorage.getItem('token')

    const url = `${this.baseUrl2}/Api/DatosEstaticos?ListaRoles=true`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Roles[]>(url,{headers})
    .pipe(
      tap( rolesObtenidos =>{
        // console.log(rolesObtenidos);

        this.roles.set(rolesObtenidos)
      })
    )
  }

}
