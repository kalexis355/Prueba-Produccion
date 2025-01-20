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
  CarpetaRaiz,
  CopiarPegar,
  CortarPegar,
  IndiceElectronico,
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


  private authService2 = inject(Auth2Service);
  public procesoUsuarioSerice = inject(ProcesosUsuarioService);

  public user = computed(() => this.authService2.currentUSer2());

  public CarpetasRaiz: CarpetaRaiz[] = [];
  rolesUsuario: RolesUsuario[]=[]
  esUsuarioOEncargado:boolean = false;
  hayCarpetaSeleccionada:boolean = false;


  //Propiedades menu
  menuVisible: boolean = false; // Bandera para mostrar/ocultar el menú
  menuPosX: number = 0; // Posición X del menú
  menuPosY: number = 0; // Posición Y del menú
  carpetaSeleccionada: CarpetaRaiz = {
    Cod: 0,
    CodSerie: 0,
    CodSubSerie: 0,
    Estado: false,
    EstadoCarpeta: 0,
    Nombre: '',
    Descripcion: '',
    Copia: false,
    CarpetaPadre: 0,
    FechaCreacion: new Date(),
    IndiceElectronico: '',
    Delegado: 0,
    TipoCarpeta: 0,
    NombreTipoCarpeta: '',
    Icono: '',
    CodOficina: 0,
  };

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

  // checkboxStates: { [id: string]: boolean } = {};

  ngOnDestroy(): void {
    this.checkService.carpetasSeleccionadas.set([]);
    this.checkService.checkboxStates.set({});
  }

  async ngOnInit() {

    await this.esperarPorRole();

    if (this.authService2.currentUSer2()) {
      this.rolesUsuario = this.authService2.currentUSer2()!.RolesUsuario;
    }
    this.cargarListadoDependencias();
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

  cargarListadoDependencias() {
    const CodUsuario = this.authService2.currentUSer2()?.Cod;
    if (CodUsuario) {
      this.gestionCarpetaService
        .obtenerCarpetaRaiz(CodUsuario)
        .subscribe((oficinas) => {
          this.CarpetasRaiz = oficinas;
          console.log(this.CarpetasRaiz);
        });
    }
  }

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

      // if (result.isConfirmed) {
      //   this.gestionCarpetaService
      //     .cortarPegarCarpeta(bodyCarpetaCortada)
      //     .subscribe({
      //       next: (data) => {
      //         // Si la respuesta indica éxito, mostrar un mensaje
      //         Swal.fire(
      //           'Éxito',
      //           'La operación se completó correctamente.',
      //           'success'
      //         );
      //         this.gestionCarpetaService.notificarActualizacion();
      //         localStorage.removeItem('serieOrigen');
      //         localStorage.removeItem('CodCarpetACortar');
      //         localStorage.removeItem('serieDestino');
      //         localStorage.removeItem('CodCarpetaAPegar');
      //         localStorage.removeItem('CodCarpetACopiar');
      //         this.habilitarOpcionPegar = false;
      //       },
      //       error: (err) => {
      //         // Manejo de errores
      //         console.error('Error al cortar/pegar carpeta:', err);
      //         Swal.fire(
      //           'Error',
      //           err.error?.message || 'Ocurrió un error inesperado.',
      //           'error'
      //         );
      //       },
      //     });
      // }
    }

    if (codCarpetaCopiada !== null) {
      const bodyCopiarPegar: CopiarPegar = {
        CodCarpetaCopiar: +codCarpetaCopiada,
        CodCarpetaDestino: codCarpetaDestino,
        SerieRaizDestino: serieRaizDestino,
      };
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
      // if (result.isConfirmed) {
      //   try {
      //     this.gestionCarpetaService
      //       .copiarPegarCarpeta(bodyCopiarPegar)
      //       .subscribe({
      //         next: (data) => {
      //           Swal.fire(
      //             'Éxito',
      //             'La copia se completó correctamente.',
      //             'success'
      //           );
      //           this.gestionCarpetaService.notificarActualizacion();
      //           localStorage.removeItem('serieOrigen');
      //           localStorage.removeItem('CodCarpetACortar');
      //           localStorage.removeItem('serieDestino');
      //           localStorage.removeItem('CodCarpetaAPegar');
      //           localStorage.removeItem('CodCarpetACopiar');
      //           this.habilitarOpcionPegar = false;
      //         },
      //         error: (err) => {
      //           // Manejo de errores
      //           console.error('Error al copiar/pegar carpeta:', err);
      //           Swal.fire(
      //             'Error',
      //             err.error?.message || 'Ocurrió un error inesperado.',
      //             'error'
      //           );
      //         },
      //       });
      //   } catch (error) {
      //     await Swal.fire(
      //       'Error',
      //       'No se pudo completar la operación.',
      //       'error'
      //     );
      //   }
      // }
    }
  }

  mostrarMenuContextual(event: MouseEvent, carpeta: any): void {
    console.log('hola');

    event.preventDefault(); // Evita el menú contextual predeterminado
    this.menuVisible = true; // Muestra el menú
    this.menuPosX = event.clientX; // Posición del clic (X)
    this.menuPosY = event.clientY; // Posición del clic (Y)
    this.carpetaSeleccionada = carpeta; // Guarda la carpeta seleccionada

    const codACortar = localStorage.getItem('CodCarpetACortar');
    const codAPegar = localStorage.getItem('CodCarpetACopiar');

    const codOficina= carpeta.CodOficina;
    const role = localStorage.getItem('role')

    if(role){
      this.esUsuarioOEncargado = +role === 3 && this.rolesUsuario.some(
        (rol)=> rol.Rol === 3 && rol.Oficina === codOficina
      );
    }


    this.habilitarOpcionPegar = (codACortar !== null || codAPegar !== null) && this.esUsuarioOEncargado;

    console.log(this.habilitarOpcionPegar, 'esta disponible');

    const hayCarpetaAOperar = localStorage.getItem('elementoAOperar')

    this.hayCarpetaSeleccionada = hayCarpetaAOperar !== null;
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
