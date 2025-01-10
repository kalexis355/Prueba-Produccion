import {
  Component,
  computed,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { User } from '../../../login/interfaces';
import { AuthService } from '../../../login/services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Carpeta } from '../../interfaces/carpeta.interface';
import { MenuItem, MessageService } from 'primeng/api';
import { SortService } from '../../services/sort-service.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { ProcesosUsuarioService } from '../../services/procesoUsuarios.service';

@Component({
  selector: 'dashboard-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css',
})
export class PaginaPrincipalComponent implements OnInit {
  public authService2 = inject(Auth2Service);
  public dashService = inject(DashboardService);
  public sortService = inject(SortService);
  public checkService = inject(CheckBoxService)



  public user = computed(() => this.authService2.currentUSer2());
  criterio: string = '';
  carpetasSeleccion:Carpeta[]=[]

  constructor() {
    // Usar `effect` para actualizar `carpetasSeleccion`
    effect(() => {
      this.carpetasSeleccion = this.checkService.carpetasSeleccionadas();
      // console.log(this.carpetasSeleccion.length);

    });
  }


  ngOnInit() {

  }


  get carpetas(): Carpeta[] {
    return this.dashService.getCarpetas();
  }

  sortList(criteria: string) {
    this.sortService.setSortCriteria(criteria);
    this.criterio = criteria;
  }
}
