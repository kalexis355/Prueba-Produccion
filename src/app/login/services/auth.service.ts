import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, Subject, tap, throwError } from 'rxjs';
import { AuthStatus, CheckTokenResponse, LoginResponse, LoginResponse2, RolesUsuario, User } from '../interfaces';
import { environments, environments2 } from '../../../environments/environments-dev';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { error, log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();  


  // Nuevo Subject para emitir eventos de autenticación



  public permissions: string[] = [];

  setPermissionsByRoles(roles: string[]): void {
    //permisos de los roles sobre las carpetas
    const rolePermissions: { [role: string]: string[] } = {
      Administrador: ['read', 'write', 'delete', 'share', 'rename', 'manage_permissions', 'upload', 'download', 'view_audit_logs', 'lock'],
      Encargado_oficina: ['read', 'write', 'rename', 'upload', 'download', 'share'],
      Funcionario: ['read', 'write', 'upload', 'download'],
      Contratista: ['read', 'download'],
    };

    // Combina permisos de todos los roles y elimina duplicados
    const allPermissions = roles
      .map(role => rolePermissions[role] || [])
      .flat();
    this.permissions = [...new Set(allPermissions)];
  }

  // getUserRoles(): string[] {
  //   return this.currentUSer()!.roles
  // }

  // getUserRoles(): string[] {
  //   return this.currentUSer2()!.
  // }

  setSelectedRole(role: string) {
    // Guardar el rol seleccionado
    localStorage.setItem('role', role);
  }

  getSelectedRole() {
    return localStorage.getItem('role');
  }

  //solo se puede leer esta variable
  private readonly baseUrl: string = environments.baseUrl

  private readonly baseUrl2: string = environments2.baseUrl

  //injecciones
  private http = inject(HttpClient);

  //Señales
  //para saber cual es el usuario logueado
  // private _currentUSer = signal<User | null>(null)
  private _currentUSer2 = signal<LoginResponse2 | null>(null)

  //para saber el estado de autenticacion del usuario por defecto es de tipo checking
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  //hacer algunas cosas puiblicas
  //Señales de solo lectura
  //es una señal de solo lectura que su valor lo toma de otra señal cuando esa señal cambie esta tambien lo hara de manera reactiva
  // public currentUSer = computed(()=> this._currentUSer())
  public currentUSer2 = computed(()=> this._currentUSer2())

  public authStatus = computed(()=> this._authStatus())

  constructor( ) {
    //se llama al metodo checkAuthStatus para verificar si hay un token guardado apenas se cargue la pagina
    //si lo hay cambia directamente la señal, a autenticado o no autenticado para no quedarse en checking
    // this.checkAuthStatus().subscribe()

   }

   rolAdministrador():boolean{

    // for (const rol of this.currentUSer()!.roles) {
    //   if(rol === 'Administrador')
    //     return true
    // }
    return false;
  }

  //metodo privado para modificar la autenticacion recibiendo el usuario y el token
  //retornando un valor booleando
  private setAuthentication(user:User, token:string):boolean{
    // //se modifican las señales la primera con el usuario
    // // y la segunda pasando de checking a ser autenticado
    // this._currentUSer.set(user);
    // console.log(this.currentUSer2());

    // this._authStatus.set(AuthStatus.authenticated);
    // //se guarda el token en el localStorage
    // localStorage.setItem('token',token)
    // console.log('Usuario después de login:', this.currentUSer2());

    // //se retorna true al modificar las señales para decir que si esta autenticado
    return true
  }

  private obtenerFechaActualFormateada(): string {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura 2 dígitos en el día
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses de 0-11, sumamos 1
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`; // Formato "dd/MM/yyyy"
  }

  //Metodo de login el cual recibe el correo y la contraseña y retorna un observable boolenao
  login(user:string, password:string):Observable<boolean>{

    //se crea la constante de la url
    const url = `${this.baseUrl2}/Api/Login`
    //se crea la constante que contiene el body debido a que es una peticion post
    const body = {Usuario:user,Contraseña:password,FechaActual:this.obtenerFechaActualFormateada()};

    //se retorna usando la propiedad http mediante el metodo post que es un observable
    return this.http.post<LoginResponse>(url,body)
    // Todo: en el caso que todo salga bien
    .pipe(
      map(({user,token})=>{
        this.setAuthentication(user,token)
        window.location.reload();
        return true
  }),

      //Todo: en el caso de errores
      catchError( err => {
        //el throwError hace que cuando algo no sal se envia esto
        //el error es el del backend se muestra al usuario final
        return throwError(()=>err.error.message)
      } )
    );

  }

  // checkAuthStatus(): Observable<boolean> {
  //   const token = localStorage.getItem('token');

  //   if (!token) {
  //     this.logout();
  //     this._authStatus.set(AuthStatus.notAuthenticated);
  //     return of(false);
  //   }

  //   // Verifica si el token ha expirado
  //   const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  //   const now = Math.floor(Date.now() / 1000);

  //   if (tokenPayload.exp < now) {
  //     // Si el token ha expirado, cerramos la sesión
  //     this.logout();
  //     this._authStatus.set(AuthStatus.notAuthenticated);
  //     return of(false);
  //   }

  //   this._authStatus.set(AuthStatus.authenticated);
  //   return of(true);
  // }

  // metodo logout para cerrar sesion del usuario
  logout(){
    // localStorage.clear()
    // //se borra el token del usuario del localStorage
    // localStorage.removeItem('token')
    // //se modifican las señales
    // console.log(this.currentUSer(),1);

    // this._currentUSer.set(null);
    // console.log(this.currentUSer(),2);

    // this._authStatus.set(AuthStatus.notAuthenticated);

    // console.log('Usuario después de logout:', this.currentUSer());
  }








}
