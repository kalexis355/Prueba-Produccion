import { Component, computed, effect, inject, Input, OnInit } from '@angular/core';
import { Carpeta } from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';
import { SortService } from '../../services/sort-service.service';
import { AuthService } from '../../../login/services/auth.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';

@Component({
  selector: 'app-vista-lista',
  templateUrl: './vista-lista.component.html',
  styleUrl: './vista-lista.component.css'
})
export class VistaListaComponent implements OnInit{

  //injeccion de los servicios
  public dashService = inject(DashboardService)
  public sortService = inject(SortService)
  public authService = inject(AuthService)
  public checkService = inject(CheckBoxService)
  public oficinaService = inject(GestionOficinasService)


  sortCriteria: string = 'asc';

  public carpetasSeleccionadas?:Carpeta[];

  user = this.authService.currentUSer2()
  public CarpetasRaiz:Oficinas[]=[]

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

  get carpetas():Carpeta[]{
    return this.dashService.getCarpetas();
  }

  cargarListadoDependencias(){
    this.oficinaService.obtenerOficinas()
    .subscribe(oficinas=>{
      this.CarpetasRaiz = oficinas
    })
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
