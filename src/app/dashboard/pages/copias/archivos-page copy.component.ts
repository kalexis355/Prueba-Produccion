// import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { Carpeta, Archivo } from '../../interfaces/carpeta.interface';
// import { DashboardService } from '../../services/dashboard.service';
// import { v4 as uuidv4 } from 'uuid';
// import { ToastService } from '../../services/toast.service';
// import { AuthService } from '../../../login/services/auth.service';
// import { PermisosService } from '../../services/permisos.service';
// import { RutaService } from '../../services/ruta.service';
// import { CheckBoxService } from '../../services/checkBox.service';
// import { Auth2Service } from '../../../login/services/auth2.service';


// @Component({
//   selector: 'app-archivos-page',
//   templateUrl: './archivos-page.component.html',
//   styleUrl: './archivos-page.component.css'
// })
// export class ArchivosPageComponent implements OnInit, OnDestroy {
//   //propiedad que contendra la informacion de la carpeta a mostrar
//   carpeta!: Carpeta | undefined;

//   //injeccion de servicios
//   public route = inject(ActivatedRoute)
//   public dashService = inject(DashboardService)
//   public toast = inject(ToastService)
//   public authService = inject(AuthService)
//   public permisoService = inject(PermisosService)
//   public rutaService = inject(RutaService)
//   public checkService = inject(CheckBoxService)
//   public auth2Service = inject(Auth2Service)

//   carpetasSeleccion:Carpeta[]=[]
//   archivosSeleccion: Archivo[]=[]

//   administrador: boolean = this.authService.rolAdministrador()
//   puedeCrearCarpetas = false; // Bandera para habilitar/deshabilitar creación de carpetas
//   puedeSubirArchivos = false;
//   // ruta = signal(this.dashService.guardarRuta())
//   rolActivo?: string | null;

//   constructor(){


//   // Usar `effect` para actualizar `carpetasSeleccion`
//   effect(() => {
//     this.carpetasSeleccion = this.checkService.carpetasSeleccionadas();
//     // console.log(this.carpetasSeleccion.length);

//     this.archivosSeleccion = this.checkService.archivosSeleccionados();

//   });
//   }



//   guardarRuta(carpeta:Carpeta){
//     this.checkService.archivosSeleccionados.set([])
//     this.rutaService.guardarRutaPArcial(carpeta)
//   }

//   recortarRuta(id:string){
//     this.checkService.archivosSeleccionados.set([])
//     this.rutaService.recortarRutaHasta(id)
//     console.log('hola2');
//     // console.log(this.ruta());


//   }


//   //utilizacion del ciclo de vida angular para que se active todo despues de la inicializacion de los datos
//   ngOnInit(): void {
//     console.log(this.auth2Service.currentUSer2());
//     this.permisoCrearSubir()
//     // Suscribirse a los parámetros de la ruta
//     //debido a que la ruta estara activa solo cambia los id de las carpetas
//     this.route.paramMap.subscribe(params => {
//       this.checkService.carpetasSeleccionadas.set([])
//       this.checkService.checkboxStates.set({})
//       //para saber los parametros se hace por medio del id ya que es el unico que cambia en la ruta
//       const id = params.get('id');
//       //se verifica que si exista un id
//       if (id) {
//         //se llama al metodo que obtiene la carpeta
//         // this.cargarCarpeta(id);
//       }
//     });

//     window.addEventListener('popstate', this.onPopState);
//     const idRuta = Number(this.route.snapshot.paramMap.get('id'));
//   }

//   permisoCrearSubir():boolean{
//     // Intentar obtener el rol desde el localStorage
//     this.rolActivo = localStorage.getItem('role');

//     // Si no hay rol en localStorage, obtener el rol del usuario directamente (si tiene un solo rol)
//     const currentUser = this.auth2Service.currentUSer2();
//     if (!this.rolActivo && currentUser && currentUser.RolesUsuario.length === 1) {
//       // Asigna el rol único del usuario
//       this.rolActivo = this.obtenerNombreRol(currentUser.RolesUsuario[0].Rol);
//     }

//     // Obtener el id de la oficina desde la ruta
//     const idRuta = Number(this.route.snapshot.paramMap.get('id'));


//     // Comprobar si el usuario tiene permisos en la oficina especificada
//     if (currentUser && currentUser.RolesUsuario) {
//       // Determinar permisos basados en el rol activo y la oficina
//       this.puedeCrearCarpetas = currentUser.RolesUsuario.some(rol =>
//         (this.rolActivo === 'SA' || this.rolActivo === 'Administrador') || // Permite crear carpetas y subir archivos para SA y Administrador
//         (this.rolActivo === 'Encargado' && rol.Rol === 3 && rol.Oficina === idRuta) // Permite para Encargado solo en oficina específica
//       );

//       this.puedeSubirArchivos = currentUser.RolesUsuario.some(rol =>
//         (this.rolActivo === 'SA' || this.rolActivo === 'Administrador') || // SA y Administrador pueden siempre
//         (this.rolActivo === 'Encargado' && rol.Rol === 3 && rol.Oficina === idRuta) || // Encargado puede solo en oficina específica
//         (this.rolActivo === 'Usuario' && rol.Rol === 5 && rol.Oficina === idRuta) // Usuario solo puede subir en oficina específica
//       );

//       // Mensajes en consola para verificar permisos
//       if (this.puedeCrearCarpetas) {
//         console.log('El usuario tiene permisos para crear carpetas y subir archivos en esta oficina.');
//       } else if (this.puedeSubirArchivos) {
//         console.log('El usuario solo tiene permisos para subir archivos en esta oficina.');
//       } else {
//         console.log('El usuario no tiene permisos para crear carpetas ni subir archivos en esta oficina.');
//       }
//     } else {
//       console.log('No se encontró información de roles para el usuario.');
//     }

//     return this.puedeCrearCarpetas
//   }

//   obtenerNombreRol(rolId: number): string {
//     switch (rolId) {
//       case 1: return 'Sa';
//       case 2: return 'Administrador';
//       case 3: return 'Encargado';
//       case 5: return 'Usuario';
//       default: return 'Desconocido';
//     }
//   }


//   ngOnDestroy(): void {
//     this.checkService.carpetasSeleccionadas.set([])
//     this.checkService.checkboxStates.set({})
//     this.checkService.archivosSeleccionados.set([])
//     this.checkService.archivosTotal.set([])
//     window.removeEventListener('popstate', this.onPopState);

//   }

//   onPopState = (event: PopStateEvent) => {
//     this.rutaService.eliminarUltimaCarpeta();
//   };


//   //metodo que llama al metodo del servicio que llama solo a la carpeta mediante su id
//   // cargarCarpeta(id: string): void {
//   //   this.carpeta = this.dashService.getCarpetaId(id);
//   // }


//   tieneCarpetas(): boolean | undefined {
//     if(this.carpeta){
//       return this.carpeta.hijos?.some((hijo: any) => hijo.tipo === 'carpeta') || false;
//     }
//     return
//   }

//   tieneArchivos():boolean | undefined{
//     if(this.carpeta){
//       return this.carpeta.hijos?.some((hijo: any) => hijo.tipo === 'archivo') || false;
//     }
//     return
//   }

//   obtenerImagenPrevisualizacion(archivo: any): string {
//     switch (archivo.extension.toLowerCase()) {
//       case 'jpg':
//         return archivo.url;
//       case 'png':
//         return archivo.url;
//       case 'gif':
//         return archivo.url;  // Asumiendo que 'url' contiene la ruta al archivo
//       case 'pdf':
//         return '/assets/imgs/pdf.png';
//       case 'docx':
//         return '/assets/imgs/word.png';
//       case 'xlsx':
//         return '/assets/imgs/excel.png';
//       case 'mp4':
//         return '/assets/imgs/video.png'
//       case 'zip':
//         return '/assets/imgs/winrar.png'
//       case 'pptx':
//         return '/assets/imgs/power.png'
//       case 'rar':
//         return '/assets/imgs/winrar.png'
//       default:
//         return '/assets/imgs/archivoDe.png';
//     }
//   }

//   onFileSelected(event: any,idPadre:string,carpeta:Carpeta): void {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Archivo seleccionado:', file.name);
//       // Aquí puedes manejar la carga del archivo

//       const archivo: Archivo = {

//         id: uuidv4(),
//         nombre: file.name,
//         fechaCreacion: new Date(),
//         creador: 'yo',
//         tipo: 'archivo',
//         extension: file.name.split('.').pop(),
//         url: URL.createObjectURL(file),
//         padreId: idPadre,
//         archivoBlob:file,
//         permisos: ['read', 'write', 'delete', 'share', 'rename', 'manage_permissions',
//           'upload', 'download', 'view_audit_logs', 'lock']
//       };

//       this.guardarEnCarpetaPadre(archivo,idPadre,carpeta)

//     }
//   }

//   guardarEnCarpetaPadre(archivo: Archivo, idPadre: string, carpeta: Carpeta): void {
//     // Encontrar la carpeta padre y agregar el archivo a sus hijos
//     if(carpeta.hijos){
//       if (carpeta.id === idPadre) {
//         carpeta.hijos.push(archivo);
//         this.toast.showToast(`Archivo ${archivo.nombre} subido a ${carpeta.nombre}`, 'Éxito', 'success');
//       } else {
//         this.toast.showToast(`No se pudo subir el archivo`, 'Error', 'error');

//       }
//     }

//   }

//   borrarTodaRuta(){
//     this.rutaService.guardarRuta.set([])
//   }

// toggleCheckbox(carpetaId: string): void {
//   console.log(carpetaId);

//     const newState = !this.checkService.isChecked(carpetaId);
//     this.checkService.updateCheckboxState(this.carpeta?.hijos as Carpeta[],carpetaId, newState);
//   }

// toggleCheckboxArchivo(archivoId: string):void{

//   const newState = !this.checkService.isChecked(archivoId);
//   this.checkService.updateCheckboxArchivo(this.carpeta?.hijos as Archivo[],archivoId, newState);

// }

// // isChecked(carpetaId: string): boolean {

// //   return this.dashService.isChecked(carpetaId);
// //   }


//   tienePermisoCrear():boolean{

//     for (const permiso of this.carpeta!.permisos!) {
//       if(permiso === 'write' || permiso === 'upload'){
//         return true
//       }
//     }

//     return false
//   }

//   contratista():boolean{

//     return this.authService.getSelectedRole()!=='Contratista'
//   }



// }
