// import { computed, inject, Injectable, signal } from '@angular/core';
// import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
// import { BehaviorSubject, catchError, map, Observable, of, Subject, tap, throwError } from 'rxjs';
// import { AuthStatus, CheckTokenResponse, LoginResponse, LoginResponse2, RolUsuario, User } from '../interfaces';
// import { environments, environments2 } from '../../../environments/environments-dev';
// import { DashboardService } from '../../dashboard/services/dashboard.service';
// import { error, log } from 'console';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private userSubject = new BehaviorSubject<User | null>(null);
//   public user$ = this.userSubject.asObservable();  


//   // Nuevo Subject para emitir eventos de autenticación



//   public permissions: string[] = [];

//   setPermissionsByRoles(roles: string[]): void {
//     //permisos de los roles sobre las carpetas
//     const rolePermissions: { [role: string]: string[] } = {
//       Administrador: ['read', 'write', 'delete', 'share', 'rename', 'manage_permissions', 'upload', 'download', 'view_audit_logs', 'lock'],
//       Encargado_oficina: ['read', 'write', 'rename', 'upload', 'download', 'share'],
//       Funcionario: ['read', 'write', 'upload', 'download'],
//       Contratista: ['read', 'download'],
//     };

//     // Combina permisos de todos los roles y elimina duplicados
//     const allPermissions = roles
//       .map(role => rolePermissions[role] || [])
//       .flat();
//     this.permissions = [...new Set(allPermissions)];
//   }

//   // getUserRoles(): string[] {
//   //   return this.currentUSer2()!.roles
//   // }

//   getUserRoles(): string[] {
//     return this.currentUSer2()!.R
//   }

//   setSelectedRole(role: string) {
//     // Guardar el rol seleccionado
//     localStorage.setItem('role', role);
//   }

//   getSelectedRole() {
//     return localStorage.getItem('role');
//   }

//   //solo se puede leer esta variable
//   private readonly baseUrl: string = environments.baseUrl

//   private readonly baseUrl2: string = environments2.baseUrl

//   //injecciones
//   private http = inject(HttpClient);

//   //Señales
//   //para saber cual es el usuario logueado
//   // private _currentUSer = signal<User | null>(null)
//   private _currentUSer2 = signal<LoginResponse2 | null>(null)

//   //para saber el estado de autenticacion del usuario por defecto es de tipo checking
//   private _authStatus = signal<AuthStatus>(AuthStatus.checking);

//   //hacer algunas cosas puiblicas
//   //Señales de solo lectura
//   //es una señal de solo lectura que su valor lo toma de otra señal cuando esa señal cambie esta tambien lo hara de manera reactiva
//   // public currentUSer = computed(()=> this._currentUSer())
//   public currentUSer2 = computed(()=> this._currentUSer2())

//   public authStatus = computed(()=> this._authStatus())

//   constructor( ) {
//     //se llama al metodo checkAuthStatus para verificar si hay un token guardado apenas se cargue la pagina
//     //si lo hay cambia directamente la señal, a autenticado o no autenticado para no quedarse en checking
//     this.checkAuthStatus().subscribe()

//    }

//    rolAdministrador():boolean{

//     for (const rol of this.currentUSer()!.roles) {
//       if(rol === 'Administrador')
//         return true
//     }
//     return false;
//   }

//   //metodo privado para modificar la autenticacion recibiendo el usuario y el token
//   //retornando un valor booleando
//   private setAuthentication(user:User, token:string):boolean{
//     //se modifican las señales la primera con el usuario
//     // y la segunda pasando de checking a ser autenticado
//     this._currentUSer.set(user);
//     console.log(this.currentUSer());

//     this._authStatus.set(AuthStatus.authenticated);
//     //se guarda el token en el localStorage
//     localStorage.setItem('token',token)
//     console.log('Usuario después de login:', this.currentUSer());

//     //se retorna true al modificar las señales para decir que si esta autenticado
//     return true
//   }

//   private obtenerFechaActualFormateada(): string {
//     const fecha = new Date();
//     const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura 2 dígitos en el día
//     const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses de 0-11, sumamos 1
//     const año = fecha.getFullYear();

//     return `${dia}/${mes}/${año}`; // Formato "dd/MM/yyyy"
//   }

//   //Metodo de login el cual recibe el correo y la contraseña y retorna un observable boolenao
//   login(user:string, password:string):Observable<boolean>{

//     //se crea la constante de la url
//     const url = `${this.baseUrl2}/Api/Login`
//     //se crea la constante que contiene el body debido a que es una peticion post
//     const body = {Usuario:user,Contraseña:password,FechaActual:this.obtenerFechaActualFormateada()};

//     //se retorna usando la propiedad http mediante el metodo post que es un observable
//     return this.http.post<LoginResponse>(url,body)
//     // Todo: en el caso que todo salga bien
//     .pipe(
//       map(({user,token})=>{
//         this.setAuthentication(user,token)
//         window.location.reload();
//         return true
//   }),

//       //Todo: en el caso de errores
//       catchError( err => {
//         //el throwError hace que cuando algo no sal se envia esto
//         //el error es el del backend se muestra al usuario final
//         return throwError(()=>err.error.message)
//       } )
//     );

//   }

//   //metodo para checkear el estus del usuario logueado
//   checkAuthStatus():Observable<boolean>{
//     //se crea la url con el endpoint correspondiente al chequeo del token
//      const url = `${this.baseUrl}/auth/check-token`
//      // se trae el token que se guardo cuando el usuario inicio sesión
//      const token = localStorage.getItem('token');

//      //si no hay un token guardado
//      if(!token){
//       //se cierra sesion de una vez
//       this.logout()
//       // y se retorna falso lo cual significa que no se puede hacer persistente la sesion
//        return of(false);
//     }
//       //si si hay un token guardado se crea la constante headers para enviar el token
//      const headers = new HttpHeaders()
//      //meidante el encabezado authorization y el tipo de token se envia para verificarlo en el backend
//      .set('Authorization',`Bearer ${token}`);

//      // se usa la propiedad http mediante el metodo get, el cual la respuesta es segun la interfaz checkTokenResponse
//      // se envia la url y el encabezado para la verificacion del usuario
//      return this.http.get<CheckTokenResponse>(url,{headers})
//      .pipe(
//       //se usa la funcion map debido a que este endopoint retorna un nuevo token
//       // por tal razon se llama de nuevo al metodo setAuthentication y se envia el usuario y el nuevo token
//       map(({user,token})=> this.setAuthentication(user,token)),
//       catchError(() => {
//         //si hayb algun error se cambia el estado de la señal status a no autenticado
//         this._authStatus.set(AuthStatus.notAuthenticated);
//         //y se retorna false
//         return of(false)})
//      )
//   }

//   // metodo logout para cerrar sesion del usuario
//   logout(){
//     localStorage.clear()
//     //se borra el token del usuario del localStorage
//     localStorage.removeItem('token')
//     //se modifican las señales
//     console.log(this.currentUSer(),1);

//     this._currentUSer.set(null);
//     console.log(this.currentUSer(),2);

//     this._authStatus.set(AuthStatus.notAuthenticated);

//     console.log('Usuario después de logout:', this.currentUSer());
//   }

//   loginResponse: LoginResponse | null = null;
//   rolesUsuario: RolUsuario[] = [];


//     //metodo privado para modificar la autenticacion recibiendo el usuario y el token
//   //retornando un valor booleando
//   private setAuthentication2(user:LoginResponse2, token:string):boolean{
//     //se modifican las señales la primera con el usuario
//     // y la segunda pasando de checking a ser autenticado
//     this._currentUSer2.set(user);
//     console.log(this.currentUSer());

//     this._authStatus.set(AuthStatus.authenticated);
//     //se guarda el token en el localStorage
//     localStorage.setItem('token',token)
//     console.log('Usuario después de login:', this.currentUSer());

//     //se retorna true al modificar las señales para decir que si esta autenticado
//     return true
//   }

//   login2(user:string,password:string):Observable<boolean>{
//     const url = `${this.baseUrl2}/Api/Login`
//     //se crea la constante que contiene el body debido a que es una peticion post
//     const body = {Usuario:user,Contraseña:password,FechaActual:this.obtenerFechaActualFormateada()};
//     return this.http.post<LoginResponse2>(url,body)
//     .pipe(
//       map((response:LoginResponse2)=>{
//         try{
//           this.rolesUsuario = JSON.parse(response.RolesUsuario);
//         }catch(error){
//           console.log('error al deserializar',error);
//         }

//         return this.setAuthentication2(response,response.Token)
//       }),
//       catchError((error)=>{
//         console.log('error en el login',error);
//         return of(false)
//       })
//     )
//   }

// }
