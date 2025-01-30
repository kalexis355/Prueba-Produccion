import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User2, UserResponse, UsuarioConsultado,  } from '../../login/interfaces';
import { environments2 } from '../../../environments/environments-dev';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2'
import { BodyCodRol, BorrarRolResponse } from '../../login/interfaces/roles.interface';
import { error } from 'console';

@Injectable({providedIn: 'root'})
export class GestionUsuariosService {

  private http = inject(HttpClient);
  private readonly baseUrl2: string = environments2.baseUrl

  private usuariosSubject = new BehaviorSubject<UsuarioConsultado[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();

  public usuarios = signal<UsuarioConsultado[]>([])
  constructor() { }

  crearUsuario(nuevoUsuario:User2):Observable<UserResponse[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios`;
    const body:User2 = nuevoUsuario
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log(JSON.stringify(body,null,2));

    return this.http.post<UserResponse[]>(url,body,{headers})
    .pipe(
      tap(data =>{console.log(data);
      }),
      catchError(error=>{
        if(error.error.message){

        Swal.fire('Error', 'El NickName o usuario ya registrado o Numero de documento ya registrado', 'error');
        }
        return of()
      }
      )
    )
  }


  obtenerUsuarios():Observable<UsuarioConsultado[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios?ByEntidad=true`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UsuarioConsultado[]>(url, { headers }).pipe(
      tap((usuarios: UsuarioConsultado[]) => {
        // console.log(usuarios);

        this.usuarios.set(usuarios);  // Actualizar el signal
      }),
      catchError(error =>{
        return of([])
      })
    );

  }

  eliminarUsuario(id:number):Observable<any>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios/eliminar-usuario/${id}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(url, { headers, responseType: 'text' as 'json' })
    .pipe(
      // tap(mensaje => console.log(mensaje))
    );
  }


  actualizarListaUsuarios(): void {
    this.obtenerUsuarios().subscribe(usuarios => {
      this.usuariosSubject.next(usuarios);
    });
  }

  eliminarRolAsignado(CodRolUsuario:number):Observable<BorrarRolResponse[]>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios/eliminar-rol/${CodRolUsuario} `;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    return this.http.delete<BorrarRolResponse[]>(url,{headers})
    .pipe(
      tap(data=>{
        console.log(data,'mensaje');

      })
    )
  }

  desactivarRolAsignado(codRolBody:BodyCodRol):Observable<string>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios/actualiza-estado-rol`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const body = codRolBody

    return this.http.put<string>(url,body,{headers,responseType: 'text' as 'json'})
    .pipe(
      tap(mensaje=>console.log(mensaje,'desactivar rol')),
      catchError((error: HttpErrorResponse) => {
        // Extraer el mensaje de error que envía el servidor
        const mensajeError = error.error || 'Ocurrió un error al desactivar el rol.';

        // Mostrar el mensaje de error en un modal de Swal.fire
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: mensajeError,
          confirmButtonText: 'Aceptar'
        });

        // Lanzar el error para continuar la propagación si es necesario
        return throwError(() => new Error(mensajeError));
      })
    )

  }


  actualizarUsuario(usuarioModificado:User2):Observable<string>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios/actualiza-usuario`;
    const body:User2 = usuarioModificado
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log(body,'cuerpo a actualizar usuario');

    return this.http.put<string>(url,body,{headers,responseType: 'text' as 'json'})
    .pipe(
      tap(mensaje=> console.log(mensaje,'mensajeActualizacion')
      )
    )
  }

  actualizarEstadoUsuario(usuario:User2):Observable<string>{
    const token = localStorage.getItem('token')
    const url = `${this.baseUrl2}/Api/Usuarios/actualiza-usuario`;
    const body:User2 = usuario
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<string>(url, usuario, { headers,responseType:'text' as 'json' })

  }

}
