import { Component, computed, effect, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Carpeta, CarpetaRaiz, CarpetasPadre } from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';
import { SortService } from '../../services/sort-service.service';
import { AuthService } from '../../../login/services/auth.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IndexDbService } from '../../services/indexdb.service';

@Component({
  selector: 'app-vista-lista',
  templateUrl: './vista-lista.component.html',
  styleUrl: './vista-lista.component.css'
})
export class VistaListaComponent implements OnInit,OnDestroy{

  //injeccion de los servicios
  public dashService = inject(DashboardService)
  public sortService = inject(SortService)
  public authService = inject(AuthService)
  public checkService = inject(CheckBoxService)
  public oficinaService = inject(GestionOficinasService)
  public gestionCarpetaService = inject(GestionCarpetasService);
  public indexdbService = inject(IndexDbService)
  private authService2 = inject(Auth2Service);


  sortCriteria: string = 'asc';

  public carpetasSeleccionadas?:Carpeta[];

  user = this.authService.currentUSer2()
  public CarpetasRaiz:CarpetaRaiz[]=[]
  oficinasFiltradas: CarpetasPadre[] = [];
  private destroy$ = new Subject<void>();
  private subscription!: Subscription;


  constructor(){

    effect(() => {
      this.carpetasSeleccionadas = this.checkService.carpetasSeleccionadas();
      console.log(this.carpetasSeleccionadas);

    });

  }

  ngOnInit(): void {
    // //se llama a la propiedad observable para poder suscribirse
    // this.sortService.sortCriteria$.subscribe(criteria => {
    //   //la data se usa para ordenar las carpetas
    //   this.sortCriteria = criteria;
    //   //se llama al metodo para que se organice despues de cargar la pagina
    //   this.sortCarpetas();
    // });
    // this.cargarListadoDependencias()
    this.obtenerCarpetasPadres()


    this.subscription = this.oficinaService.oficinasFiltradas$.subscribe(
      (oficinas) => {
        this.oficinasFiltradas = oficinas;
        console.log('Oficinas filtradas actualizadas:', oficinas);
        // Aquí puedes realizar cualquier lógica adicional cuando los datos cambien
      }
    );
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getColor(index: number): string {
    const colors = ['#00BCD4', '#2E7895', '#FDB528', '#51CC28', '#6D788D', '#FF4D49'];
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
      // this.carpetasPadre = carpetasPadre;
      this.oficinasFiltradas = carpetasPadre;
    } catch (error) {
      console.error('Error al obtener carpetas padre:', error);
    }
  }


  get carpetas():Carpeta[]{
    return this.dashService.getCarpetas();
  }



  get carpetasActivas() {
    return this.CarpetasRaiz.filter(carpeta => carpeta.Estado);
  }




  sortCarpetas() {
    //se usa un switch dependiendo de las opciones que hayan en el menu
    switch (this.sortCriteria) {

      case 'modic':
        this.carpetas.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        break;
      case 'asc':
        this.carpetas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'desc':
        this.carpetas.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        break;
    }
  }

  toggleCheckbox(carpetaId: string): void {
    const newState = !this.checkService.isChecked(carpetaId);
    this.checkService.updateCheckboxState(this.carpetas,carpetaId, newState);
}

  ischecked(id:string):boolean{
    return this.checkService.isChecked(id);

  }

  clicCarpeta(cod:number,nombreOficina:string){
    this.gestionCarpetaService.agregarACamino(cod,nombreOficina)


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
}
