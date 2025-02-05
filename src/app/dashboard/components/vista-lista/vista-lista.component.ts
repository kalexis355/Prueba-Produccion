import { Component, computed, effect, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Carpeta, CarpetaRaiz } from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';
import { SortService } from '../../services/sort-service.service';
import { AuthService } from '../../../login/services/auth.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { Subject, takeUntil } from 'rxjs';
import { SwalService } from '../../services/swal.service';

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
  private authService2 = inject(Auth2Service);
  public swalService = inject(SwalService)


  sortCriteria: string = 'asc';

  public carpetasSeleccionadas?:Carpeta[];

  user = this.authService.currentUSer2()
  public CarpetasRaiz:CarpetaRaiz[]=[]
  private destroy$ = new Subject<void>();

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
    this.cargarListadoDependencias()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get carpetas():Carpeta[]{
    return this.dashService.getCarpetas();
  }

  cargarListadoDependencias(){
     const CodUsuario = this.authService2.currentUSer2()?.Cod;
       if (CodUsuario) {
         this.gestionCarpetaService
           .obtenerCarpetaRaiz(CodUsuario)
           .pipe(
             takeUntil(this.destroy$)
           )
           .subscribe({
             next: (oficinas) => {
              //  this.CarpetasRaiz = oficinas;
             },
             error: (error) => {
               this.swalService.mostrarError('Ocurrió un error al cargar las carpetas');
             }
           });
       }
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
}
