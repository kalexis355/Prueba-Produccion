import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { LoginResponse2, AuthStatus } from '../interfaces';
import { environments2 } from '../../../environments/environments-dev';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'

@Injectable({providedIn: 'root'})
export class Auth2Service {

  //injecciones
  private http = inject(HttpClient);

 //Señales
  private _currentUSer2 = signal<LoginResponse2 | null>(null)
  //para saber el estado de autenticacion del usuario por defecto es de tipo checking
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);


  //hacer algunas cosas puiblicas

  //Señales de solo lectura
  //es una señal de solo lectura que su valor lo toma de otra señal cuando esa señal cambie esta tambien lo hara de manera reactiva
  public currentUSer2 = computed(()=> this._currentUSer2())
  public authStatus = computed(()=> this._authStatus())

  private readonly baseUrl2: string = environments2.baseUrl


  constructor() {

    //se llama al metodo checkAuthStatus para verificar si hay un token guardado apenas se cargue la pagina
    //si lo hay cambia directamente la señal, a autenticado o no autenticado para no quedarse en checking
    this.checkAuthStatus().subscribe()
   }

  private obtenerFechaActualFormateada(): string {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura 2 dígitos en el día
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses de 0-11, sumamos 1
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`; // Formato "dd/MM/yyyy"
  }

  private setAuthentication2(user:LoginResponse2, token:string):boolean{
    //se modifican las señales la primera con el usuario
    // y la segunda pasando de checking a ser autenticado
    this._currentUSer2.set(user);
    console.log(this.currentUSer2());

    this._authStatus.set(AuthStatus.authenticated);
    //se guarda el token en el localStorage
    localStorage.setItem('token',token)

    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('Usuario después de login:', this.currentUSer2());

    //se retorna true al modificar las señales para decir que si esta autenticado
    return true
  }

  login2(user: string, password: string): Observable<boolean> {
    const url = `${this.baseUrl2}/Api/Login`;
    const body = {
        Usuario: user,
        Contraseña: password,
        FechaActual: this.obtenerFechaActualFormateada()
    };

    return this.http.post<any>(url, body, { responseType: 'text' as 'json' }).pipe(
        tap(responseString => {
            console.log(responseString, 'respuesta'); // Imprime la respuesta cruda

            let response:LoginResponse2;
            try {
                // Primero, se necesita eliminar las comillas alrededor de RolesUsuario
                responseString = responseString
                    .replace(/"RolesUsuario":"(\[.*?\])"/, '"RolesUsuario":$1') // Elimina comillas dobles de RolesUsuario

                // Ahora intenta parsear la cadena JSON
                response = JSON.parse(responseString);
                console.log(response, 'respuesta parseada');

                return this.setAuthentication2(response, response.Token);
            } catch (error) {
                console.error('Error al parsear la respuesta JSON:', error);
                return of(false); // Manejo de errores
            }
        }),
        catchError(error => {
          console.log('Error completo:', error); // Para debugging
          const errorMessage = JSON.stringify(error.error) || error.message || 'Error del servidor';
          Swal.fire('Error', errorMessage, 'error');
          return of(false);
        })
    );
}

  checkAuthStatus(): Observable<boolean> {
    // console.log('holaaaaaa de aqui');

    const token = localStorage.getItem('token');

    if (!token) {
      this.logout2();
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }

    // Verifica si el token ha expirado
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    if (tokenPayload.exp < now) {
      // Si el token ha expirado, cerramos la sesión
      this.logout2();
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }
    this._currentUSer2.set(JSON.parse(localStorage.getItem('currentUser')!) )
    this._authStatus.set(AuthStatus.authenticated);
    return of(true);
  }

// metodo logout para cerrar sesion del usuario
logout2(){
  localStorage.clear()
  //se borra el token del usuario del localStorage
  localStorage.removeItem('token')
  //se modifican las señales
  console.log(this.currentUSer2(),1);

  this._currentUSer2.set(null);
  console.log(this.currentUSer2(),2);

  this._authStatus.set(AuthStatus.notAuthenticated);

  console.log('Usuario después de logout:', this.currentUSer2());
}

getRolesUsuario() {
  const storedUser = localStorage.getItem("currentUser");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      return Array.isArray(parsedUser.RolesUsuario)
        ? parsedUser.RolesUsuario
        : [];
    } catch (error) {
      console.error("Error al analizar los datos:", error);
    }
  }

  return [];
}

}
