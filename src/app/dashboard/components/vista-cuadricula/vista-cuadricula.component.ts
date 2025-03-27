import { GestionProcesosService } from './../../services/gestionProcesos.service';
import {
  Component,
  computed,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  Carpeta,
  CarpetaEstructura,
  CarpetaRaiz,
  CarpetasPadre,
  CopiarPegar,
  CortarPegar,
  DetalleCarpeta,
  IndiceElectronico,
  IndiceUnificado,
} from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';
import { PermisosService } from '../../services/permisos.service';
import { RutaService } from '../../services/ruta.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { ProcesosUsuarioService } from '../../services/procesoUsuarios.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import Swal from 'sweetalert2';
import { RolesUsuario } from '../../../login/interfaces';
import { catchError, of, Subject, Subscription, takeUntil, tap, timeout } from 'rxjs';
import { LoaderService } from '../../services/gestionLoader.service';
import { Router } from '@angular/router';
import { HttpRequest } from '@angular/common/http';
import { IndexDbService } from '../../services/indexdb.service';

@Component({
  selector: 'app-vista-cuadricula',
  templateUrl: './vista-cuadricula.component.html',
  styleUrl: './vista-cuadricula.component.css',
})
export class VistaCuadriculaComponent implements OnInit, OnDestroy {
  public dashService = inject(DashboardService);
  public persmisoService = inject(PermisosService);
  public rutaService = inject(RutaService);
  public checkService = inject(CheckBoxService);
  public procesosService = inject(GestionProcesosService);
  public oficinaService = inject(GestionOficinasService);
  public gestionCarpetaService = inject(GestionCarpetasService);
  public loaderService = inject(LoaderService)
  public router = inject(Router)
  public indexdbService = inject(IndexDbService)

  private authService2 = inject(Auth2Service);
  public procesoUsuarioSerice = inject(ProcesosUsuarioService);

  public user = computed(() => this.authService2.currentUSer2());

  public CarpetasRaiz: CarpetaRaiz[] = [];
  indiceUnificado: IndiceUnificado = { IndiceElectronico: [] };
  rolesUsuario: RolesUsuario[]=[]
  esUsuarioOEncargado:boolean = false;
  hayCarpetaSeleccionada:boolean = false;


  //Propiedades menu
  menuVisible: boolean = false; // Bandera para mostrar/ocultar el menú
  menuPosX: number = 0; // Posición X del menú
  menuPosY: number = 0; // Posición Y del menú
  private primeraVezIniciado = false;
  carpetasPadre: CarpetasPadre[]=[]
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
  };
  oficinasFiltradas: CarpetasPadre[] = [];
  private subscription!: Subscription;

  // indiceElectronico:IndiceElectronico={
  //   Cod: 0,
  //   Nombre: '',
  //   Path: '',
  //   Nivel: 0,
  //   TipoCarpeta: 0,
  //   NivelVisualizacion: 0
  // }
  indiceElectronico: any = null;
  habilitarOpcionPegar: boolean = false;
  private destroy$ = new Subject<void>();
  // checkboxStates: { [id: string]: boolean } = {};



  async ngOnInit() {

    this.gestionCarpetaService.reiniciarRuta()
    if (!this.router.url.includes('principal/cuadricula')) {
      return;
    }
    await this.esperarPorRole();

    if (this.authService2.currentUSer2()) {
      this.rolesUsuario = this.authService2.currentUSer2()!.RolesUsuario;
    }
    // this.cargarListadoDependencias();

    // Inicializar los estados de los checkboxes
    // this.carpetaEstado()

    // this.procesoUsuarioSerice.rol$.subscribe((rol:string|null)=>{
    //   if(rol ==='Administrador' || rol === 'Sa'){
    //     this.ObtenerProcesosAdmin();
    //   }else if (rol === 'Encargado') {
    //     this.obtenerOficinaEncargada();
    //   }else{

    //     this.ObtenerProcesosAdmin();

    //   }
    // })

      // Solo llamamos a obtenerCarpetas la primera vez
      this.gestionCarpetaService.inicializarServicio();
      this.obtenerCarpetasPadres()
      // this.cargarOficinas()

      this.subscription = this.oficinaService.oficinasFiltradas$.subscribe(
        (oficinas) => {
          this.oficinasFiltradas = oficinas;
          // console.log('Oficinas filtradas actualizadas:', oficinas);
          // Aquí puedes realizar cualquier lógica adicional cuando los datos cambien
        }
      );
  }
  respuesta: any;
  error: string = '';

  agregarAlaRuta(cod:number){
    console.log('entro a la ruta');

    this.gestionCarpetaService.agregarACamino(cod)

    console.log(this.gestionCarpetaService.obtenerCaminoActual());

    this.indexdbService.obtenerOficinas()
    .then((oficinas)=>{
      // console.log('oficinas obtenidas desde el index',oficinas);

      this.indexdbService.obtenerCarpetaPorId(cod)
      .then((carpetaObtenida)=>{
        console.log('carpeta obtenida', carpetaObtenida);
        const oficinaEncontrada = oficinas.find(oficina =>
          oficina.CodigoSerie === carpetaObtenida.CodSerie
        );
        // console.log('oficina encontrada ',oficinaEncontrada);
        if(oficinaEncontrada)
        localStorage.setItem('idOficina',oficinaEncontrada?.Cod.toString())
      })
    })


  }

  // cargarOficinas():void{
  //   this.oficinaService.obtenerOficinas()
  //   .subscribe(oficinas => {
  //     this.oficinasFiltradas = oficinas;

  //   })
  // }

  getColor(index: number): string {
    const colors = ['#00BCD4', '#2E7895', '#FDB528', '#51CC28', '#6D788D', '#FF4D49'];
    return colors[index % colors.length];
  }

  getColor2(index:number):string{
    const colors = ['#80DEE9', '#97BBCA', '#FEDA93', '#A8E693', '#B6BBC6', '#FFA6A4'];
    return colors[index % colors.length];
  }
  getColor3(index:number):string{
    const colors = ['#E0F7FA', '#E6EFF2', '#FFF6E5', '#EAF9E5', '#EDEFF1', '#FFEAE9'];
    return colors[index % colors.length];
  }


  async obtenerCarpetasPadres() {
    try {
      const carpetasPadre = await this.indexdbService.obtenerCarpetasPadre();
      // console.log('Carpetas padre:', carpetasPadre);
      // Aquí puedes asignar las carpetas a una variable del componente
      this.carpetasPadre = carpetasPadre;
      this.oficinasFiltradas = carpetasPadre;

    } catch (error) {
      console.error('Error al obtener carpetas padre:', error);
    }
  }


  ngOnDestroy(): void {
    this.checkService.carpetasSeleccionadas.set([]);
    this.checkService.checkboxStates.set({});
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private esperarPorRole(): Promise<void> {
    return new Promise((resolve) => {
      const checkRole = () => {
        if (localStorage.getItem('role')) {
          resolve();
        } else {
          setTimeout(checkRole, 100);
        }
      };
      checkRole();
    });
  }

  // carpetaEstado(){
  //   this.carpetas.forEach(carpeta => {
  //     this.checkboxStates[carpeta.id] = false;

  //   });
  // }

  get carpetas(): Carpeta[] {
    return this.dashService.getCarpetas();
  }

  // actualizarSeleccion(){
  //   this.carpetasSeleccionadas = this.carpetas.filter(carpeta => this.checkboxStates[carpeta.id]);
  //   this.dashService.carpetasSeleccionadas.update(()=> this.carpetasSeleccionadas )

  // }

  // isChecked(carpetaId: string) {
  //   console.log(this.checkboxStates[carpetaId]);
  // }

  // Método opcional para cambiar el estado del checkbox
  // toggleCheckbox(carpetaId: string): void {
  //   this.checkboxStates[carpetaId] = !this.checkboxStates[carpetaId];
  // }

  toggleCheckbox(carpetaId: string): void {
    const newState = !this.checkService.isChecked(carpetaId);
    this.checkService.updateCheckboxState(this.carpetas, carpetaId, newState);
  }

  isChecked(carpetaId: string): boolean {
    return this.checkService.isChecked(carpetaId);
  }

  // imprimir(){
  //   console.log(this.dashService.checkboxStates());
  //   console.log(this.dashService.carpetasSeleccionadas().length);

  // }
  guardarRuta(carpeta: Carpeta) {
    this.rutaService.guardarRutaPArcial(carpeta);
  }

  // obtenerOficinaEncargada() {
  //   const oficina = this.user()?.RolesUsuario.find((rol: { Oficina: number }) => rol.Oficina !== 0)?.Oficina;

  //   console.log(oficina, 'oficina con valor distinto de 0');
  //   this.procesoUsuarioSerice.obtenerCarpetaRaiz(oficina!)
  //   .subscribe(carpetasProceso =>{
  //     this.CarpetasRaiz = carpetasProceso
  //   })
  // }

  // ObtenerProcesosAdmin(){

  //     this.procesosService.obtenerProcesos()
  //     .subscribe(proceso =>{
  //       console.log(proceso);

  //       for (const procesito of proceso) {
  //         this.CarpetasRaiz.push({
  //           Nombre:procesito.Nombre
  //         })
  //       }

  //       console.log(this.CarpetasRaiz);

  //     })

  // }


  get carpetasActivas() {
    return this.CarpetasRaiz.filter((carpeta) => carpeta.Estado);
  }

  obtenerRolLocal(): string {
    const rol = localStorage.getItem('role');
    console.log(rol, 'funcion');

    return rol ? rol : 'holi';
  }

  guardarCodigo(carpeta: CarpetaRaiz) {
    // console.log(carpeta,'hola spy carpeta padre');
    localStorage.setItem('serie', String(carpeta.CodSerie));
    localStorage.setItem('idOficina', String(carpeta.CodOficina));
  }

  async pegarCarpetaCortadaOCopiada(carpeta: CarpetaRaiz) {


    const codCarpetaDestino = carpeta.Cod;
    console.log(carpeta.Cod, 'codigo de la carpeta destino');

    const serieRaizDestino = carpeta.CodSerie;
    console.log(carpeta.CodSerie, 'codigo serie destino');

    const codCarpetaCortada = localStorage.getItem('CodCarpetACortar');
    const codCarpetaCopiada = localStorage.getItem('CodCarpetACopiar');

    const serieOrigen = localStorage.getItem('serieOrigen');

    if (codCarpetaCortada !== null) {
      const bodyCarpetaCortada: CortarPegar = {
        CodCarpetaCortar: +codCarpetaCortada,
        CodCarpetaDestino: codCarpetaDestino,
        SerieRaizOrigen: +serieOrigen!,
        SerieRaizDestino: serieRaizDestino,
      };

      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas cortar y pegar esta carpeta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        this.gestionCarpetaService
          .cortarPegarCarpeta(bodyCarpetaCortada)
          .subscribe({
            next: (data) => {
              // Si la respuesta indica éxito, mostrar un mensaje
              Swal.fire(
                'Éxito',
                'La operación se completó correctamente.',
                'success'
              );
              this.gestionCarpetaService.notificarActualizacion();
              localStorage.removeItem('serieOrigen');
              localStorage.removeItem('CodCarpetACortar');
              localStorage.removeItem('serieDestino');
              localStorage.removeItem('CodCarpetaAPegar');
              localStorage.removeItem('CodCarpetACopiar');
            },
            error: (err) => {
              // Manejo de errores
              console.error('Error al cortar/pegar carpeta:', err);
              Swal.fire(
                'Error',
                err.error?.message || 'Ocurrió un error inesperado.',
                'error'
              );
            },
          });
      }
    }

    if (codCarpetaCopiada !== null) {
      const bodyCopiarPegar: CopiarPegar = {
        CodCarpetaCopiar: +codCarpetaCopiada,
        CodCarpetaDestino: codCarpetaDestino,
        SerieRaizDestino: serieRaizDestino,
      };
      console.log('body a copiar',bodyCopiarPegar);

      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas copiar y pegar esta carpeta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        try {
          this.gestionCarpetaService
            .copiarPegarCarpeta(bodyCopiarPegar)
            .subscribe({
              next: (data) => {
                Swal.fire(
                  'Éxito',
                  'La copia se completó correctamente.',
                  'success'
                );
                this.gestionCarpetaService.notificarActualizacion();
                localStorage.removeItem('serieOrigen');
                localStorage.removeItem('CodCarpetACortar');
                localStorage.removeItem('serieDestino');
                localStorage.removeItem('CodCarpetaAPegar');
                localStorage.removeItem('CodCarpetACopiar');
                this.habilitarOpcionPegar = false;
              },
              error: (err) => {
                // Manejo de errores
                console.error('Error al copiar/pegar carpeta:', err);
                Swal.fire(
                  'Error',
                  err.error?.message || 'Ocurrió un error inesperado.',
                  'error'
                );
              },
            });
        } catch (error) {
          await Swal.fire(
            'Error',
            'No se pudo completar la operación.',
            'error'
          );
        }
      }
    }
  }

  mostrarMenuContextual(event: MouseEvent, cod:number): void {
    console.log('hola');

    event.preventDefault(); // Evita el menú contextual predeterminado
    this.menuVisible = true; // Muestra el menú
    this.menuPosX = event.clientX; // Posición del clic (X)
    this.menuPosY = event.clientY; // Posición del clic (Y)

    this.gestionCarpetaService.detallesCarpeta(cod)
    .subscribe((detalles)=> this.carpetaSeleccionada = detalles)


    // this.carpetaSeleccionada = carpeta; // Guarda la carpeta seleccionada

    // this.habilitarOpcion(carpeta);
    // const codACortar = localStorage.getItem('CodCarpetACortar');
    // const codAPegar = localStorage.getItem('CodCarpetACopiar');

    // const codOficina= carpeta.CodOficina;
    // const role = localStorage.getItem('role')

    // if(role){
    //   this.esUsuarioOEncargado = +role === 3 && this.rolesUsuario.some(
    //     (rol)=> rol.Rol === 3 && rol.Oficina === codOficina
    //   );
    // }


    // this.habilitarOpcionPegar = (codACortar !== null || codAPegar !== null) && this.esUsuarioOEncargado;

    // console.log(this.habilitarOpcionPegar, 'esta disponible');

    // const hayCarpetaAOperar = localStorage.getItem('elementoAOperar')

    // this.hayCarpetaSeleccionada = hayCarpetaAOperar !== null;
  }

  habilitarOpcion(carpeta:any){
    const codACortar = localStorage.getItem('CodCarpetACortar');
    const codACopiar = localStorage.getItem('CodCarpetACopiar');

    const codOficina= carpeta.CodOficina;
    const role = localStorage.getItem('role')
    if(role) {
      this.esUsuarioOEncargado = +role === 3 && this.rolesUsuario.some(
        (rol) => rol.Rol === 3 && rol.Oficina === codOficina
      );

      this.habilitarOpcionPegar = (role === '2' || this.esUsuarioOEncargado) &&
        (codACortar !== null || codACopiar !== null);
    }
    console.log(this.habilitarOpcionPegar, 'esta disponible');

  }





  ocultarMenuContextual(): void {
    this.menuVisible = false; // Oculta el menú
  }

  verDetalles(carpeta: any): void {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Detalles de la carpeta:', this.carpetaSeleccionada);
    // Aquí puedes abrir un modal o redirigir a una página de detalles
    if (this.carpetaSeleccionada) {
      const indice = this.carpetaSeleccionada.IndiceElectronico;
      this.indiceElectronico = JSON.parse(indice).IndiceElectronico;
      console.log(this.indiceElectronico, 'holita');
    }
  }
  eliminarAccion(){
    this.ocultarMenuContextual();
    localStorage.removeItem('serieOrigen')
    localStorage.removeItem('CodCarpetACortar')
    localStorage.removeItem('CodCarpetACopiar')
    localStorage.removeItem('elementoAOperar')
  }

  eliminarCarpeta(carpeta: any): void {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Carpeta a eliminar:', carpeta);
    // Aquí implementas la lógica para eliminar la carpeta
  }

  otraOpcion(): void {
    this.ocultarMenuContextual(); // Oculta el menú
    console.log('Otra opción seleccionada');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    this.ocultarMenuContextual(); // Oculta el menú si haces clic fuera
  }
}
