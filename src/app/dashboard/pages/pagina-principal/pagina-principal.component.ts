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
import { Carpeta, CarpetasPadre } from '../../interfaces/carpeta.interface';
import { MenuItem, MessageService } from 'primeng/api';
import { SortService } from '../../services/sort-service.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { Auth2Service } from '../../../login/services/auth2.service';
import { ProcesosUsuarioService } from '../../services/procesoUsuarios.service';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { Oficinas } from '../../../login/interfaces/oficina.interface';
import { IndexDbService } from '../../services/indexdb.service';
import { DialogoGestionOficinaComponent } from '../../components/dialogo-gestion-oficina/dialogo-gestion-oficina.component';
import { MatDialog } from '@angular/material/dialog';

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
  public oficinaService = inject(GestionOficinasService)
  public indexdbService = inject(IndexDbService)


  public user = computed(() => this.authService2.currentUSer2());
  criterio: string = '';
  carpetasSeleccion:Carpeta[]=[]


  public oficinasCreadas:CarpetasPadre[]=[]
  public oficinasFiltradas: CarpetasPadre[] = [];

  constructor(private dialog: MatDialog) {
    // Usar `effect` para actualizar `carpetasSeleccion`
    effect(() => {
      this.carpetasSeleccion = this.checkService.carpetasSeleccionadas();
      // console.log(this.carpetasSeleccion.length);

    });
  }


  ngOnInit() {
    this.cargarOficinas();
    this.oficinaService.oficinas$.subscribe(oficinas=>{
      this.oficinasCreadas = oficinas
      this.oficinasFiltradas = oficinas;
    })
  }


  get carpetas(): Carpeta[] {
    return this.dashService.getCarpetas();
  }

  sortList(criteria: string) {
    this.sortService.setSortCriteria(criteria);
    this.criterio = criteria;
  }

  async cargarOficinas(){
    try {
      const carpetasPadres = await this.indexdbService.obtenerCarpetasPadre();
      this.oficinasCreadas = carpetasPadres
      this.oficinasFiltradas = carpetasPadres
    } catch (error) {
      console.log('error al obtener las carpetas');

    }
  }

  onBuscarOficina(termino: string) {
    if (!termino) {
      console.log('no hay termino', this.oficinasCreadas);

      this.oficinasFiltradas = [...this.oficinasCreadas];
      this.oficinaService.setOficinasFiltradas(this.oficinasFiltradas);
      return;
    }

    this.oficinasFiltradas = this.oficinasCreadas.filter(oficina =>
      oficina.Nombre.toLowerCase().includes(termino.toLowerCase())
    );

    this.oficinaService.setOficinasFiltradas(this.oficinasFiltradas)
}



  openOficinaModal() {
    this.dialog.open(DialogoGestionOficinaComponent, {
      width: '1000px',
      height: '500px',
      maxWidth: '100%', // Desactiva el ancho máximo
    });
  }

}
