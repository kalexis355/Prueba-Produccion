import {Component,computed,effect,HostListener,inject,OnDestroy,OnInit,signal} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Carpeta,Archivo,EstadoCarpeta,CarpetaRaiz,CortarPegar,CopiarPegar} from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';
import { v4 as uuidv4 } from 'uuid';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../../login/services/auth.service';
import { PermisosService } from '../../services/permisos.service';
import { RutaService } from '../../services/ruta.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { RolesUsuario, UserResponse } from '../../../login/interfaces';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import {CarpetaContenido,DocumentoContenido,} from '../../interfaces/contenidoCarpeta';
import { Subscription } from 'rxjs';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoSubirArchivoComponent } from '../../components/dialogo-subir-archivo/dialogo-subir-archivo.component';
import { Documento } from '../../interfaces/archivos.interface';
import { arch } from 'os';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { VisualizadorArchivosComponent } from '../../components/visualizador-archivos/visualizador-archivos.component';
import Swal from 'sweetalert2';
import { MenuContextualService } from '../../services/gestionMenuContextual.service';

@Component({
  selector: 'app-archivos-page',
  template: ``,
  styles: ``,
})
export class ArchivosPageComponent implements OnInit, OnDestroy {
  //propiedad que contendra la informacion de la carpeta a mostrar
  carpeta!: Carpeta | undefined;
  carpetas: { id: string; nombre: string }[] = []; // Arreglo para carpetas
  archivos: { id: string; nombre: string; previsualizacion: string }[] = []; // Arreglo para archivos
  carpetaPadre: CarpetaRaiz | undefined;
  carpetaHija: CarpetaContenido | undefined;

  // public rolesUsuario: RolesUsuario[] = [];

  carpetaActual?: any;
  //injeccion de servicios
  public route = inject(ActivatedRoute);
  public dashService = inject(DashboardService);
  public toast = inject(ToastService);
  public authService = inject(AuthService);
  public permisoService = inject(PermisosService);
  public rutaService = inject(RutaService);
  public checkService = inject(CheckBoxService);
  public auth2Service = inject(Auth2Service);
  public gestionCarpetaService = inject(GestionCarpetasService);
  public gestionUsuariosService = inject(GestionUsuariosService);
  public gestionArchivosService = inject(GestionArchivosService);
  public gestionMenuService = inject(MenuContextualService)

  private carpetaActualId: number | null = null;
  private subscriptions: Subscription = new Subscription();
  id!: number;
  esSerieOSubserie: boolean = false;

  menuVisible: boolean = false; // Bandera para mostrar/ocultar el menú
  menuPosX: number = 0; // Posición X del menú
  menuPosY: number = 0; // Posición Y del menú
  carpetaSeleccionada: CarpetaContenido = {
    Cod: 0,
    CodSerie: 0,
    CodSubSerie: 0,
    Estado: false,
    EstadoCarpeta: 0,
    Nombre: '',
    Descripcion: '',
    Copia: false,
    CarpetaPadre: 0,
    FechaCreacion: '',
    IndiceElectronico: '',
    Delegado: 0,
    TipoCarpeta: 0,
    NombreTipoCarpeta: '',
    NivelVisualizacion: 0,
  }; // Carpeta seleccionada al hacer clic derecho

  puedeCrearCarpetas = false; // Bandera para habilitar/deshabilitar creación de carpetas
  puedeSubirArchivos = false;
  // ruta = signal(this.dashService.guardarRuta())
  rolActivo?: string | null;

  carpetaContenido: CarpetaContenido[] = [];
  DocumentoContenido: DocumentoContenido[] = [];

  usuarios: UserResponse[] = [];
  estadosCarpeta: EstadoCarpeta[] = [];

  rolesUsuario: RolesUsuario[]=[]

  constructor(public dialog: MatDialog, private router: Router) {}

  habilitarOpcionCortar:boolean = false;
  habilitarOpcionCopiar:boolean = false;
  habilitarOpcionEliminar:boolean= false;
  habilitarParaPegar:boolean = false;
  esEncargado:boolean = false;
  esDelegado:boolean = false;
  hayCarpetaSeleccionada:boolean = false
  carpetaParaCortar:number | null = null;
  carpetaParaCopiar:number | null = null;
  submenuPosition: 'left' | 'right' = 'right';

  obtenerEstadoCarpeta() {
    this.gestionCarpetaService
      .ObtenerEstadosCarpeta()
      .subscribe((estadosObtenidos) => {
        this.estadosCarpeta = estadosObtenidos;
      });
  }

  obtenerNombreEstadoCarpeta(): string {
    const estado = this.estadosCarpeta.find(
      (estado) => estado.Cod === this.carpetaSeleccionada.EstadoCarpeta
    );
    return estado ? estado.Nombre : 'estado no asignado';
  }

  obtenerUSuarios() {
    this.gestionUsuariosService
      .obtenerUsuarios()
      .subscribe((usuarioObtenidos) => {
        this.usuarios = usuarioObtenidos;
      });
  }

  obtenerNombreDelegado(): string {
    const delegado = this.usuarios.find(
      (usuario) => usuario.Cod === this.carpetaSeleccionada.Delegado
    );
    return delegado ? delegado.Nombres : 'Delegado no asignado';
  }


  mostrarMenuContextual(event: MouseEvent, carpeta: CarpetaContenido): void {
    event.preventDefault();

    // Calcular posición usando el servicio
    const { posX, posY, submenuPosition } = this.gestionMenuService.calcularPosicionMenu(event);

    // Actualizar valores locales para el componente hijo
    this.menuPosX = posX;
    this.menuPosY = posY;
    this.submenuPosition = submenuPosition;
    this.menuVisible = true;
    this.carpetaSeleccionada = carpeta;

    // Lógica de permisos
    this.puedeElimarCarpetas(carpeta);
    this.permisoCortarPegar();
    this.permisoAdminOpciones(carpeta);

    const hayCarpetaAOperar = localStorage.getItem('elementoAOperar');
    this.hayCarpetaSeleccionada = hayCarpetaAOperar !== null;

    // Actualizar estado en el servicio
    this.gestionMenuService.actualizarEstado({
      visible: true,
      posX,
      posY,
      carpetaSeleccionada: carpeta,
      submenuPosition,
      permisos: {
        cortar: !this.habilitarOpcionCortar,
        copiar: !this.habilitarOpcionCopiar,
        pegar: !this.habilitarParaPegar,
        eliminar: !this.habilitarOpcionEliminar
      },
      hayCarpetaSeleccionada: this.hayCarpetaSeleccionada
    });
  }


  ocultarMenuContextual(): void {
    this.menuVisible = false;
    this.gestionMenuService.actualizarVisibilidad(false);
  }

  eliminarAccion(){
    this.ocultarMenuContextual();
    localStorage.removeItem('serieOrigen')
    localStorage.removeItem('CodCarpetACortar')
    localStorage.removeItem('CodCarpetACopiar')
    this.habilitarOpcionCortar = false
    this.habilitarOpcionCopiar = false
    localStorage.removeItem('elementoAOperar')
    this.hayCarpetaSeleccionada= false
  }

  verDetalles(carpeta: any): void {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Detalles de la carpeta:', this.carpetaSeleccionada);
    // Aquí puedes abrir un modal o redirigir a una página de detalles
  }

  async eliminarCarpeta(carpeta: CarpetaContenido) {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Carpeta a eliminar:', carpeta);
    // Aquí implementas la lógica para eliminar la carpeta
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta carpeta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if(result.isConfirmed){
      this.gestionCarpetaService.eliminarCarpeta(carpeta.Cod)
      .subscribe({
        next: (data) => {
            // Si la respuesta indica éxito, mostrar un mensaje
            Swal.fire('Éxito', 'La Carpeta se ha Eliminado', 'success');
            this.gestionCarpetaService.notificarActualizacion();

        },
        error: (err) => {
          // Manejo de errores
          console.error('Error al Eliminar la carpeta:', err);
          Swal.fire('Error', err.error?.message || 'Ocurrió un error inesperado.', 'error');
        },

      })
    }

  }

  cortarCarpeta(carpeta: CarpetaContenido){
    this.ocultarMenuContextual(); // Oculta el menú

    localStorage.removeItem('CodCarpetACopiar')

    this.carpetaParaCortar = carpeta.Cod
    this.habilitarOpcionCortar= true;
    // this.hayCarpetaSeleccionada = true;
      const serieOrigen = localStorage.getItem('serie')
      if(serieOrigen)
        localStorage.setItem('serieOrigen', serieOrigen)
        const codCarpetACortar = carpeta.Cod
      localStorage.setItem('CodCarpetACortar', String(codCarpetACortar) )
      localStorage.setItem('elementoAOperar',String(1))

  }

  copiarCarpeta(carpeta:CarpetaContenido){
    localStorage.removeItem('serieOrigen')
    localStorage.removeItem('CodCarpetACortar')
    this.ocultarMenuContextual();
    // this.hayCarpetaSeleccionada = true
    this.carpetaParaCopiar = carpeta.Cod
    this.habilitarOpcionCortar= false
    this.habilitarOpcionCopiar = true;

    localStorage.setItem('CodCarpetACopiar',String(this.carpetaParaCopiar))
    localStorage.setItem('elementoAOperar',String(1))
  }

  async  pegarCarpeta(carpeta:CarpetaContenido){
    const codACortar = localStorage.getItem('CodCarpetACortar')
    const serieOrigen = localStorage.getItem('serieOrigen')
    const codACopiar = localStorage.getItem('CodCarpetACopiar')

    const serieDestino = localStorage.getItem('serie')
    if(codACortar && serieOrigen){
      if(serieDestino)
        localStorage.setItem('serieDestino', serieDestino)


        const codCarpetaAPegar = carpeta.Cod
        localStorage.setItem('CodCarpetaAPegar', String(codCarpetaAPegar))

          const bodyPegarCortar:CortarPegar ={
            CodCarpetaCortar: +codACortar!,
            CodCarpetaDestino: codCarpetaAPegar,
            SerieRaizOrigen: +serieOrigen!,
            SerieRaizDestino: +serieDestino!
          }

          console.log(bodyPegarCortar,'cuerpo pegar cortar');

          const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas cortar y pegar esta carpeta?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
          });

          if (result.isConfirmed) {
            try {
              this.gestionCarpetaService.cortarPegarCarpeta(bodyPegarCortar)
              .subscribe({
                next: (data) => {
                    // Si la respuesta indica éxito, mostrar un mensaje
                    Swal.fire('Éxito', 'La operación se completó correctamente.', 'success');
                    this.gestionCarpetaService.notificarActualizacion();
                    localStorage.removeItem('serieOrigen')
                    localStorage.removeItem('CodCarpetACortar')
                    localStorage.removeItem('serieDestino')
                    localStorage.removeItem('CodCarpetaAPegar')
                    localStorage.removeItem('CodCarpetACopiar')
                    this.hayCarpetaSeleccionada= false
                    // this.habilitarOpcionCortar = false;

                },
                error: (err) => {
                  // Manejo de errores
                  console.error('Error al cortar/pegar carpeta:', err);
                  Swal.fire('Error', err.error?.message || 'Ocurrió un error inesperado.', 'error');
                },

              }
              )
            } catch (error) {
              // Opcional: Manejar errores
              await Swal.fire(
                'Error',
                'No se pudo completar la operación.',
                'error'
              );
            }
          }


    }else if(codACopiar){

      const bodyPegarCopiar:CopiarPegar={
        CodCarpetaCopiar: +codACopiar,
        CodCarpetaDestino: carpeta.Cod,
        SerieRaizDestino: +serieDestino!
      }

      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas copiar y pegar esta carpeta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          this.gestionCarpetaService.copiarPegarCarpeta(bodyPegarCopiar)
          .subscribe({
            next: (data)=>{
              Swal.fire('Éxito', 'La copia se completó correctamente.', 'success');
              this.gestionCarpetaService.notificarActualizacion();
              localStorage.removeItem('serieOrigen')
              localStorage.removeItem('CodCarpetACortar')
              localStorage.removeItem('serieDestino')
              localStorage.removeItem('CodCarpetaAPegar')
              localStorage.removeItem('CodCarpetACopiar')
              this.habilitarOpcionCopiar = false;
            },
            error: (err) => {
              // Manejo de errores
              console.error('Error al copiar/pegar carpeta:', err);
              Swal.fire('Error', err.error?.message || 'Ocurrió un error inesperado.', 'error');
            },
          })


        } catch (error) {
          await Swal.fire(
            'Error',
            'No se pudo completar la operación.',
            'error'
          );
        }
      }

      console.log(bodyPegarCopiar,'body copiar pegar ');

    }








  }

  otraOpcion(): void {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Otra opción seleccionada');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    this.ocultarMenuContextual(); // Oculta el menú si haces clic fuera
  }

  ngOnInit(): void {
    this.obtenerUSuarios();
    this.permisoCrearCarpetasyarchivos();
    this.obtenerEstadoCarpeta();

    if(this.auth2Service.currentUSer2()){
      this.rolesUsuario = this.auth2Service.currentUSer2()!.RolesUsuario
    }

    // Suscribirse al evento global de actualización de contenido
    this.subscriptions.add(
      this.gestionCarpetaService.actualizarContenido$.subscribe(() => {
        if (this.carpetaActualId !== null) {
          this.cargarContenido(this.carpetaActualId);
        }
      })
    );

    // Suscribirse al evento de creación de archivos
    this.subscriptions.add(
      this.gestionArchivosService.actualizarContenido$.subscribe(() => {
        if (this.carpetaActualId !== null) {
          this.cargarContenido(this.carpetaActualId); // Actualizar contenido
          Swal.fire('Éxito', 'Archivo Creado', 'success');
        }
      })
    );

    // Suscribirse a los cambios en la ruta
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id') ? +params.get('id')! : null;

        const navigation = this.router.getCurrentNavigation();
        this.carpetaPadre = navigation?.extras.state?.['carpeta'];

        this.carpetaHija = navigation?.extras.state?.['carpetaHija'];
        this.esSerieSubserie();
        this.carpetaTieneDelegado();


        // console.log('Carpeta Padre:', this.carpetaPadre);
        // console.log('Carpeta Hija:', this.carpetaHija);

        if (id !== null && id !== this.carpetaActualId) {
          this.id = id;
          this.carpetaActualId = id;
          this.cargarContenido(id);
        } else if (id === null) {
          console.warn('El ID de la carpeta no está presente en la URL');
        }
      })
    );


  }


  esVisible(carpeta:CarpetaContenido):boolean{
    const idOficina = localStorage.getItem('idOficina')
    const role = localStorage.getItem('role')
     // Si la carpeta tiene nivel de visualización 2

  if(role && idOficina)

    if (carpeta.NivelVisualizacion === 2) {
    // Verificar si el usuario es Administrador
    const esUsuarioAdministrador = +role ===2
    //  ||
    // Verificar si el usuario es inicio como encargado y si pertenece a la oficina
    const esUsuarioOEncargado = +role === 3 && this.rolesUsuario.some(
      (rol)=> rol.Rol === 3 && rol.Oficina === +idOficina
    );



    // La carpeta será visible si ambas condiciones se cumplen
    return esUsuarioAdministrador || esUsuarioOEncargado;
  }

  return false;

  }

  puedeElimarCarpetas(carpeta:CarpetaContenido){
    const rolAdmin = localStorage.getItem('role');
    console.log(rolAdmin,'rolAdmin');
    if(rolAdmin === '2'){
      this.habilitarOpcionEliminar = !(rolAdmin ==='2')
      console.log(this.habilitarOpcionEliminar,'propiedadeliminar');
    }else{
    const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod
    this.habilitarOpcionEliminar = !(carpeta.Delegado === usuarioLogueado)
    console.log(this.habilitarOpcionEliminar,'delegado puede borrar');

    }

    if(this.esEncargado){
      this.habilitarOpcionEliminar = false;
    }


  }

  permisoCortarPegar(){
    const rolAdmin = localStorage.getItem('role');
    if(rolAdmin ==='2'){
      this.habilitarOpcionCortar = !true;
      console.log('holaaaa');

    }

    if(this.esEncargado){
      console.log('es encargado de estaaaaa');
      this.habilitarOpcionCortar = !true;
      this.habilitarOpcionCopiar = !true;
      this.habilitarParaPegar = !true;

    }else{
      this.habilitarOpcionCortar = true;
      this.habilitarOpcionCopiar = true;
      this.habilitarParaPegar = true;
    }
  }

  permisoAdminOpciones(carpeta:CarpetaContenido){
    const rolAdmin = localStorage.getItem('role');
    if(rolAdmin ==='2'){
      this.habilitarParaPegar = !true;
      this.habilitarOpcionCortar = !true;
      this.habilitarOpcionCopiar = !true;
      this.habilitarOpcionEliminar = !true;
      console.log('holaaaa');

    }if(rolAdmin ==='3'){
      console.log(carpeta,'carpeta padre delegada');

      const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod
      const rolAdmin = localStorage.getItem('role');
      if(carpeta.Delegado === usuarioLogueado){
        localStorage.setItem('CodCarpetaPadreDelegada',String(carpeta.Cod))
        this.habilitarOpcionEliminar = !true;
        this.habilitarOpcionCopiar = !true;
        this.habilitarOpcionCortar = !true;
        this.habilitarParaPegar = !true;
      }
    }
  }

  carpetaTieneDelegado(){
    const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod
    const rolAdmin = localStorage.getItem('role');

    if(rolAdmin ==='2'){
      this.puedeCrearCarpetas = true;
    }

    if(this.carpetaHija?.Delegado){

      this.puedeCrearCarpetas = this.carpetaHija?.Delegado === usuarioLogueado

      // console.log(usuarioLogueado,'codUSuario');
      // console.log((this.carpetaHija?.Delegado),'coDelegado');


      // console.log(this.puedeCrearCarpetas,'crear carpetas');
    }

  }




  esVisibleUltimoNivel(carpeta:CarpetaContenido):boolean{

    const role = localStorage.getItem('role')
    const idOficina = localStorage.getItem('idOficina')
    const idUsuario = this.auth2Service.currentUSer2()?.Cod

    if(role && idOficina)
    if(carpeta.NivelVisualizacion === 3){
      const esAdmin = +role ===2
      // Verificar si el usuario tiene un rol válido en la oficina correspondiente
    const perteneceOficina = this.rolesUsuario.some(
      (rol) => rol.Rol === 3 && rol.Oficina === +idOficina

    );

    const esDelegado = idUsuario === carpeta.Delegado
    // console.log(this.rolesUsuario,'roles del usuario');

    // console.log(esDelegado,'usuario es delegado de esta carpeta');

    // console.log(perteneceOficina,'holaaaaaa');


      return esAdmin || perteneceOficina || esDelegado;
    }




    return false;
  }



  get carpetasFiltradas() {
    return this.carpetaContenido.filter((carpeta) => {
      switch (carpeta.NivelVisualizacion) {
        case 0:
          return true;
        case 1:
          return true;

        case 2:
          // console.log(this.rolesUSuario);
          return this.esVisible(carpeta);
          // return true;
        case 3:
          return this.esVisibleUltimoNivel(carpeta);

        default:
          return false;
          // return true;

      }
    });
  }

  esSerieSubserie() {
    const carpeta = this.carpetaPadre || this.carpetaHija;
    if (carpeta) {
      this.esSerieOSubserie =
        carpeta.TipoCarpeta !== 1 && carpeta.TipoCarpeta !== 2;
    } else {
      // console.warn('No se encontró ni carpetaPadre ni carpetaHija.');
    }

    // console.log(this.carpetaPadre, 'Esta es la carpetaaaaaaaaaaa');
    // console.log(this.carpetaHija, 'estaaaaaaaaaaaaa es la hijaaaaaaaa');
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.unsubscribe();

    localStorage.removeItem('serie');
    localStorage.removeItem('idOficina')
  }

  cargarContenido(id: number) {
    this.gestionCarpetaService.CargarContenidoCarpeta(id).subscribe({
      next: (respuesta) => {
        // Asigna los valores de la respuesta a las propiedades
        this.carpetaContenido = respuesta.Carpetas || [];
        this.DocumentoContenido = respuesta.Documentos || [];

        // console.log('Carpetas cargadas:', this.carpetaContenido);
        // console.log('Documentos cargados:', this.DocumentoContenido);
      },
      error: (error) => {
        console.error('Error al cargar contenido:', error);
      },
    });
  }

  obtenerNombreRol(rolId: number): string {
    switch (rolId) {
      case 1:
        return 'Sa';
      case 2:
        return 'Administrador';
      case 3:
        return 'Encargado';
      case 5:
        return 'Usuario';
      default:
        return 'Desconocido';
    }
  }

  subirArchivo(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const archivo = input.files[i];

        const reader = new FileReader();

        console.log(archivo.name, 'este es el archivo');

        reader.onload = () => {
          const arregloBits = new Uint8Array(reader.result as ArrayBuffer);

          console.log(arregloBits, 'Archivo en bits');

          const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, {
            width: '450px',
            height: '550px',
            data: {
              archivo, // Archivo original
              archivoBits: arregloBits, // Arreglo de bits
            },
            disableClose: true, // Desactiva cerrar fuera del diálogo
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result !== undefined && result !== '') {
              console.log(result, 'valores archivo');
              const archivo: Documento = {
                Nombre: result.nombre,
                Carpeta: this.id,
                FimarPor: result.firmarPor,
                TipoArchivo: +result.tipoArchivo,
                Formato: result.formato,
                NumeroHojas: result.numeroHojas,
                Duracion: result.duracion,
                Tamaño: result.tamaño,
                Indice: 0,
                Archivo: Array.from(arregloBits),
              };

              console.log(archivo, 'body archivo');

              this.gestionArchivosService.crearArchivo(archivo).subscribe({
                next: async (respuesta) => {
                  try {
                    console.log(respuesta, 'respuesta al crear un archivito');
                  } catch (error) {
                    console.error('Error en el callback:', error);
                  }
                },
              });
            }
          });
        };

        reader.readAsArrayBuffer(archivo);
      }
      input.value = ''; // Limpiar el input después de subir los archivos
    }
  }

  obtenerCarpetas() {
    console.log();
  }

  // Función para obtener la previsualización según la extensión del archivo
  obtenerImagenPrevisualizacion(formato: string): string {
    switch (formato) {
      case 'jpg':
        return 'assets/imgs/imagenDefault.png'; // Crea una URL para mostrar imagen
      case 'png':
        return 'assets/imgs/imagenDefault.png'; // Crea una URL para mostrar imagen
      case 'gif':
        return 'assets/imgs/imagenDefault.png'; // Crea una URL para mostrar imagen
      case 'pdf':
        return 'assets/imgs/pdf.png';
      case 'docx':
        return 'assets/imgs/word.png';
      case 'xlsx':
        return 'assets/imgs/excel.png';
      case 'mp4':
        return 'assets/imgs/video.png';
      case 'zip':
      case 'rar':
        return 'assets/imgs/winrar.png';
      case 'pptx':
        return 'assets/imgs/power.png';
      default:
        return 'assets/imgs/archivoDe.png';
    }
  }

  permisoCrearCarpetasyarchivos() {
    this.rolesUsuario = this.auth2Service.getRolesUsuario();
    const rolAdmin = localStorage.getItem('role');
    // const idRuta = Number(this.route.snapshot.paramMap.get('id'));
    const idOficina = localStorage.getItem('idOficina')


    // Resetear permisos
    this.puedeCrearCarpetas = false;
    this.puedeSubirArchivos = false;

    // console.log(rolAdmin, 'rol');

    // Si el rol es Administrador (rol 2)
    if (rolAdmin === '2') {
      this.puedeCrearCarpetas = true;
      this.puedeSubirArchivos = true;
      // console.log('Acceso completo como Administrador');
      return;
    }

    // Si el rol es Encargado (rol 3)
    if (rolAdmin === '3' && idOficina) {
      this.esEncargado = this.rolesUsuario.some(
        (rol) => rol.Rol === 3 && rol.Oficina === +idOficina
      );

      // console.log(this.rolesUsuario,'roleeeeees');


      this.puedeCrearCarpetas = this.esEncargado;
      this.puedeSubirArchivos = this.esEncargado;



      // console.log(
      //   this.esEncargado
      //     ? `Acceso a la oficina ${idOficina} como Encargado`
      //     : `Sin acceso a la oficina ${idOficina} como Encargado`
      // );
    }

    // Si el rol es Subidor de Archivos (rol 5)
    const esSubidor = this.rolesUsuario.some(
      (rol: any) => rol.Rol === 5 && rol.Oficina === idOficina
    );

    if (esSubidor) {
      this.puedeSubirArchivos = true;
      console.log(
        `Acceso concedido solo para subir archivos en la oficina ${idOficina}`
      );
    }
  }

  openVisualizador(documento: DocumentoContenido) {
    const dialogRef = this.dialog.open(VisualizadorArchivosComponent, {
      width: '900px',
      height: '550px',
      maxWidth: '100%',
      // disableClose: true,
      data: documento,
    });
  }









}



