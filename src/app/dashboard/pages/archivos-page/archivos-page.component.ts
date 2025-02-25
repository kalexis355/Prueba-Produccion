import {Component,computed,effect,HostListener,inject,OnDestroy,OnInit,signal} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Carpeta,Archivo,EstadoCarpeta,CarpetaRaiz,CortarPegar,CopiarPegar, CarpetasPadre, ArchivoGenericoExpediente, CarpetaBase, DetalleCarpeta} from '../../interfaces/carpeta.interface';
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
import { Subscription, take } from 'rxjs';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoSubirArchivoComponent } from '../../components/dialogo-subir-archivo/dialogo-subir-archivo.component';
import { Documento } from '../../interfaces/archivos.interface';
import { arch } from 'os';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { VisualizadorArchivosComponent } from '../../components/visualizador-archivos/visualizador-archivos.component';
import Swal from 'sweetalert2';
import { MenuContextualService } from '../../services/gestionMenuContextual.service';
import { IndexDbService } from '../../services/indexdb.service';
// import { NavegacionCarpetasService } from '../../../../../copias/navegacionEntreCarpetas.service';

@Component({
  selector: 'app-archivos-page',
  templateUrl: './archivos-page.component.html',
  styleUrl: './archivos-page.component.css',
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
  public indexdbService = inject(IndexDbService)
  // public navegacionService = inject(NavegacionCarpetasService)

  private carpetaActualId: number | null = null;
  private subscriptions: Subscription = new Subscription();
  id!: number;

  NoEsSerieOSubserie: boolean = false;
  esSubserie: boolean = false;

  menuVisible: boolean = false; // Bandera para mostrar/ocultar el menú
  menuPosX: number = 0; // Posición X del menú
  menuPosY: number = 0; // Posición Y del menú
  carpetaSeleccionada: DetalleCarpeta = {
    Cod: 0,
    CodSerie: 0,
    CodSubSerie: 0,
    Estado: false,
    EstadoCarpeta: 0,
    NombreEstadoCarpeta: '',
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
    NombreNivelVisualizacion: '',
    SerieRaiz: 0,
    NombreCarpetaPadre: ''
  }; // Carpeta seleccionada al hacer clic derecho

  puedeCrearCarpetas = false; // Bandera para habilitar/deshabilitar creación de carpetas
  puedeSubirArchivos = false;
  // ruta = signal(this.dashService.guardarRuta())
  rolActivo?: string | null;

  // carpetaContenido: CarpetaContenido[] = [];
  // DocumentoContenido: DocumentoContenido[] = [];

  carpetaContenido: CarpetasPadre[] | CarpetaBase[]=[];
  DocumentoContenido: ArchivoGenericoExpediente[] = []

  usuarios: UserResponse[] = [];
  estadosCarpeta: EstadoCarpeta[] = [];

  rolesUsuario: RolesUsuario[]=[]

  constructor(public dialog: MatDialog, private router: Router) {}

  habilitarOpcionCortar:boolean = false;
  habilitarOpcionCopiar:boolean = false;
  habilitarOpcionEliminar:boolean= false;
  habilitarOpcionPegar:boolean = false;
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


  mostrarMenuContextual(event: MouseEvent, cod:number): void {
    event.preventDefault();

    // Calcular posición usando el servicio
    const { posX, posY, submenuPosition } = this.gestionMenuService.calcularPosicionMenu(event);

    // Actualizar valores locales para el componente hijo
    this.menuPosX = posX;
    this.menuPosY = posY;
    this.submenuPosition = submenuPosition;
    this.menuVisible = true;

    this.gestionCarpetaService.detallesCarpeta(cod)
    .subscribe((detalles)=>this.carpetaSeleccionada = detalles)

    // this.carpetaSeleccionada = carpeta;

    // Lógica de permisos
    // this.puedeElimarCarpetas(carpeta);
    // this.permisoCortarPegar();
    // this.permisoAdminOpciones(carpeta);
    // this.usuarioEsDelegado(carpeta);
    this.usuarioEsAdminsitrador();
    this.usuarioEsEncargado();
    // this.usuarioEsDelegadoOpciones(carpeta);
    // const hayCarpetaAOperar = localStorage.getItem('elementoAOperar');
    // this.hayCarpetaSeleccionada = hayCarpetaAOperar !== null;
    this.hayCarpetaSeleccionada = true
    // Actualizar estado en el servicio
    this.gestionMenuService.actualizarEstado({
      visible: true,
      posX,
      posY,
      carpetaSeleccionada: this.carpetaSeleccionada,
      submenuPosition,
      // permisos: {
      //   // cortar: !this.habilitarOpcionCortar,
      //   // copiar: !this.habilitarOpcionCopiar,
      //   // pegar: !this.habilitarParaPegar,
      //   // eliminar: !this.habilitarOpcionEliminar
      // },
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

  verDetalles(carpeta: CarpetaContenido) {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Detalles de la carpetaaaaaaaa:', carpeta);
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

    // this.carpetaParaCortar = carpeta.Cod
    // this.habilitarOpcionCortar= true;
    // // this.hayCarpetaSeleccionada = true;
      const serieOrigen = localStorage.getItem('serie')
      if(serieOrigen)
        localStorage.setItem('serieOrigen', serieOrigen)
      localStorage.setItem('CodCarpetACortar', String(carpeta.Cod) )
    //   localStorage.setItem('elementoAOperar',String(1))

  }

  copiarCarpeta(carpeta:CarpetaContenido){
    this.ocultarMenuContextual();
    localStorage.removeItem('serieOrigen')
    localStorage.removeItem('CodCarpetACortar')
    // // this.hayCarpetaSeleccionada = true
    // // this.carpetaParaCopiar = carpeta.Cod
    // // this.habilitarOpcionCortar= false
    // // this.habilitarOpcionCopiar = true;

    localStorage.setItem('CodCarpetACopiar',String(carpeta.Cod))
    // localStorage.setItem('elementoAOperar',String(1))
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
              // this.habilitarOpcionCopiar = false;
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

   ngOnInit() {
    this.obtenerUSuarios();

    this.obtenerEstadoCarpeta();

    if(this.auth2Service.currentUSer2()){
      this.rolesUsuario = this.auth2Service.currentUSer2()!.RolesUsuario
    }

    // Suscribirse al evento global de actualización de contenido
    this.subscriptions.add(
      this.gestionCarpetaService.actualizarContenido$.subscribe(() => {
        if (this.carpetaActualId !== null) {
          // this.cargarContenido(this.carpetaActualId);
        }
      })
    );

    // Suscribirse al evento de creación de archivos
    this.subscriptions.add(
      this.gestionArchivosService.actualizarContenido$.subscribe(() => {
        if (this.carpetaActualId !== null) {
          // this.cargarContenido(this.carpetaActualId); // Actualizar contenido
          Swal.fire('Éxito', 'Archivo Creado', 'success');
        }
      })
    );

    // Suscribirse a los cambios en la ruta
    this.subscriptions.add(
      this.route.paramMap.subscribe(async (params) => {
        const id = params.get('id') ? +params.get('id')! : null;

        const navigation = this.router.getCurrentNavigation();
        this.carpetaPadre = navigation?.extras.state?.['carpeta'];

        this.carpetaHija = navigation?.extras.state?.['carpetaHija'];
        // this.esSerieSubserie();
        // this.carpetaTieneDelegado();
        this.usuarioPuedeSubirArchivos();
        this.usuarioPuedeCrearCarpetas();
        this.usuarioEsDelegado();
        // console.log('Carpeta Padre:', this.carpetaPadre);
        // console.log('Carpeta Hija:', this.carpetaHija);

        if (id !== null && id !== this.carpetaActualId) {
          this.id = id;
          this.carpetaActualId = id;
          // this.cargarContenido(id);
          // this.cargarContenido(id);
          // this.cargarContenidoCarpeta(id);
          // this.cargarContenidoUnificado(id)
          await this.cargarContenidoUnificado(id);
        } else if (id === null) {
          console.warn('El ID de la carpeta no está presente en la URL');
        }
      })
    );


  }



  puedeElimarCarpetas(carpeta:CarpetaContenido){
    // const rolAdmin = localStorage.getItem('role');
    // console.log(rolAdmin,'rolAdmin');
    // if(rolAdmin === '2'){
    //   this.habilitarOpcionEliminar = !(rolAdmin ==='2')
    //   console.log(this.habilitarOpcionEliminar,'propiedadeliminar');
    // }else{
    // const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod
    // this.habilitarOpcionEliminar = !(carpeta.Delegado === usuarioLogueado)
    // console.log(this.habilitarOpcionEliminar,'delegado puede borrar');

    // }

    // if(this.esEncargado){
    //   this.habilitarOpcionEliminar = false;
    // }

  }

  permisoCortarPegar(){
    // const rolAdmin = localStorage.getItem('role');
    // if(rolAdmin ==='2'){
    //   this.habilitarOpcionCortar = !true;
    //   console.log('holaaaa');

    // }

    // if(this.esEncargado){
    //   console.log('es encargado de estaaaaa');
    //   this.habilitarOpcionCortar = !true;
    //   this.habilitarOpcionCopiar = !true;
    //   this.habilitarParaPegar = !true;

    // }else{
    //   this.habilitarOpcionCortar = true;
    //   this.habilitarOpcionCopiar = true;
    //   this.habilitarParaPegar = true;
    // }
  }

  // permisoAdminOpciones(carpeta:CarpetaContenido){
  //   const rolAdmin = localStorage.getItem('role');
  //   if(rolAdmin ==='2'){
  //     this.habilitarParaPegar = !true;
  //     this.habilitarOpcionCortar = !true;
  //     this.habilitarOpcionCopiar = !true;
  //     this.habilitarOpcionEliminar = !true;
  //     console.log('holaaaa');

  //   }if(rolAdmin ==='3'){
  //     console.log(carpeta,'carpeta padre delegada');

  //     const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod
  //     const rolAdmin = localStorage.getItem('role');
  //     if(carpeta.Delegado === usuarioLogueado){
  //       localStorage.setItem('CodCarpetaPadreDelegada',String(carpeta.Cod))
  //       this.habilitarOpcionEliminar = !true;
  //       this.habilitarOpcionCopiar = !true;
  //       this.habilitarOpcionCortar = !true;
  //       this.habilitarParaPegar = !true;
  //     }
  //   }
  // }

  // carpetaTieneDelegado(){
  //   const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod
  //   const rolAdmin = localStorage.getItem('role');

  //   if(rolAdmin ==='2'){
  //     this.puedeCrearCarpetas = true;
  //   }

  //   if(this.carpetaHija?.Delegado){

  //     this.puedeCrearCarpetas = this.carpetaHija?.Delegado === usuarioLogueado

  //     console.log(usuarioLogueado,'codUSuario');
  //     console.log((this.carpetaHija?.Delegado),'coDelegado');


  //     console.log(this.puedeCrearCarpetas,'crear carpetas');
  //   }

  // }


  // esSerieSubserie() {
  //   const carpeta = this.carpetaPadre || this.carpetaHija;
  //   if (carpeta) {
  //     console.log(carpeta.TipoCarpeta,'tipo carpeta a evaluar');

  //     this.esSerieOSubserie =carpeta.TipoCarpeta !== 1 && carpeta.TipoCarpeta !== 2;
  //   } else {
  //   }

  // }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.unsubscribe();

    localStorage.removeItem('serie');
    localStorage.removeItem('idOficina')
  }


  private async cargarContenidoUnificado(codigoCarpeta: number) {
    try {
      // Primero intentamos cargar desde IndexDB
      const carpetasIndexDB = await this.indexdbService.obtenerCarpetasHijas(codigoCarpeta);

      // Usamos tu método validarCarpeta existente
      try {
        await this.indexdbService.validarCarpeta(codigoCarpeta);
        // Si llegamos aquí, significa que es una carpeta tipo 3 o 4 válida
        this.gestionCarpetaService.obtenerContenidoCarpeta(codigoCarpeta)
          .pipe(take(1))
          .subscribe({
            next: (resultado) => {
              this.carpetaContenido = resultado.subcarpetas;
              this.DocumentoContenido = resultado.archivos;
            },
            error: (error) => {
              console.error('Error al cargar contenido detallado:', error);
              this.carpetaContenido = carpetasIndexDB;
              this.DocumentoContenido = [];
            }
          });
      } catch (error) {
        // Si no es tipo 3 o 4, o no cumple las validaciones, solo mostramos el contenido de IndexDB
        this.carpetaContenido = carpetasIndexDB;
        this.DocumentoContenido = [];
      }
    } catch (error) {
      console.error('Error en la carga unificada:', error);
      this.carpetaContenido = [];
      this.DocumentoContenido = [];
    }
  }

  // private async cargarContenidoUnificado(codigoCarpeta: number) {
  //   try {
  //     await this.navegacionService.navigateToFolder(codigoCarpeta);
  //     const { currentFolder, hierarchy } = this.navegacionService.getCurrentFolderContent();

  //     if (currentFolder) {
  //       const contenidoActual = hierarchy[codigoCarpeta] || { carpetas: [], archivos: [] };
  //       this.carpetaContenido = contenidoActual.carpetas;
  //       this.DocumentoContenido = contenidoActual.archivos;
  //     }
  //   } catch (error) {
  //     console.error('Error en la carga unificada:', error);
  //     this.carpetaContenido = [];
  //     this.DocumentoContenido = [];
  //   }
  // }
  // // Método para navegar a una carpeta
  // async navegarACarpeta(codigoCarpeta: number) {
  //   await this.cargarContenidoUnificado(codigoCarpeta);
  // }

  // // Método para volver a la carpeta anterior
  // async volverACarpetaAnterior() {
  //   if (this.navegacionService.canNavigateBack()) {
  //     await this.navegacionService.navigateBack();
  //     const parentId = this.navegacionService.getParentFolder();
  //     if (parentId) {
  //       await this.cargarContenidoUnificado(parentId);
  //     }
  //   }
  // }

  // // Método para obtener la ruta actual (útil para breadcrumbs)
  // getRutaActual(): number[] {
  //   return this.navegacionService.getCurrentPath();
  // }







  usuarioPuedeSubirArchivos(){
//Si es un una serie o una subserie no se puede subir archivos.
//solo se puede subir archivos en expedientes y genericas
    const carpeta = this.carpetaPadre || this.carpetaHija;
    if (carpeta) {
      // console.log(carpeta.TipoCarpeta,'tipo carpeta a evaluar');

      this.NoEsSerieOSubserie =carpeta.TipoCarpeta !== 1 && carpeta.TipoCarpeta !== 2;
      this.esSubserie = carpeta.TipoCarpeta ===2
    } else {
      this.NoEsSerieOSubserie = false; // Valor por defecto si no hay carpeta
    }

  }

  usuarioPuedeCrearCarpetas(){
    // console.log('No es serie o subserie 2',this.NoEsSerieOSubserie);
    // console.log('es subserie', this.esSubserie);
    //se puede crear carpetas en cualquier tipo en una serie o subserie o expediente o generica
    //lo unico es que no se puede crear una subserie dentro de una generica o expediente
    //solo se puede crear dentro de una serie o una subserie
    this.rolesUsuario = this.auth2Service.getRolesUsuario();
    const rolAdmin = localStorage.getItem('role');
    const idOficina = localStorage.getItem('idOficina')

      if (rolAdmin === '2') {
      this.puedeCrearCarpetas = true;
      this.puedeSubirArchivos = true;
      // console.log('Acceso completo como Administrador');
      return;
    }


      if (rolAdmin === '3' && idOficina) {
      this.esEncargado = this.rolesUsuario.some(
        (rol) => rol.Rol === 3 && rol.Oficina === +idOficina
      );
      console.log(this.rolesUsuario,'roleeeeees');

      this.puedeCrearCarpetas = this.esEncargado;
      this.puedeSubirArchivos = this.esEncargado;
      console.log(this.puedeCrearCarpetas,'encargado');

  }

  }

  usuarioEsAdminsitrador(){

    const rolAdmin = localStorage.getItem('role');
    if (rolAdmin === '2') {
      console.log('soy admin');

      this.habilitarOpcionEliminar = true;
      this.habilitarOpcionCortar = true;
      this.habilitarOpcionPegar = true
      this.habilitarOpcionCopiar = true
    }
  }

  usuarioEsEncargado(){
    const rol = localStorage.getItem('role');
    const idOficina = localStorage.getItem('idOficina')
    this.rolesUsuario = this.auth2Service.getRolesUsuario();

    if(rol ==='3'&& idOficina){
      console.log('entro como usuario');
      const encargado =this.rolesUsuario.some(
        (rol) => rol.Rol === 3 && rol.Oficina === +idOficina
      );
      console.log('soy encargado?',encargado);

      this.habilitarOpcionEliminar = encargado
      this.habilitarOpcionCortar = encargado
      this.habilitarOpcionPegar = encargado
      this.habilitarOpcionCopiar = encargado
    }
  }

  usuarioEsDelegado(){
    const carpeta = this.carpetaPadre || this.carpetaHija;
    const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod;
    if(carpeta){
      const carpetaDelegado =  carpeta.Delegado;

      if(usuarioLogueado === carpetaDelegado){
        console.log('soy delegado');
        this.puedeCrearCarpetas = true;
        this.puedeSubirArchivos = true;
      }
    }
  }

  usuarioEsDelegadoOpciones(carpeta:CarpetaContenido){
    const usuarioLogueado = this.auth2Service.currentUSer2()?.Cod;
    const carpetaDelegado =  carpeta.Delegado;

    if(usuarioLogueado === carpetaDelegado){
      this.habilitarOpcionEliminar = true
      this.habilitarOpcionCortar = true
      this.habilitarOpcionPegar = true
      this.habilitarOpcionCopiar = true
    }

  }

}



