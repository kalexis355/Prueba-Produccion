import { Component, inject } from '@angular/core';
import { LoaderService } from '../../services/gestionLoader.service';

@Component({
  selector: 'app-loader-personalizado',
  templateUrl: './loader-personalizado.component.html',
  styleUrl: './loader-personalizado.component.css'
})
export class LoaderPersonalizadoComponent {

  public loaderService = inject(LoaderService)

  loading$ = this.loaderService.cargando$;

}
