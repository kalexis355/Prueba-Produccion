import { Component, computed, inject, OnInit } from '@angular/core';
import { Auth2Service } from '../../../login/services/auth2.service';
import { IndexDbService } from '../../services/indexdb.service';
import { CarpetaBase, CarpetasPadre } from '../../interfaces/carpeta.interface';

@Component({
  selector: 'app-tablero-principal-page',
  templateUrl: './tablero-principal-page.component.html',
  styleUrl: './tablero-principal-page.component.scss'
})
export class TableroPrincipalPageComponent implements OnInit {

  private indexdbService = inject(IndexDbService)
  public authService2 = inject(Auth2Service);
  public user = computed(() => this.authService2.currentUSer2());

  carpetasFrecuentes: CarpetasPadre[] | CarpetaBase[] = [];

    ngOnInit(): void {

      this.cargarCarpetasFrecuentes();

    }

    async cargarCarpetasFrecuentes(): Promise<void> {
      try {
        this.carpetasFrecuentes = await this.indexdbService.obtenerCarpetasFrecuentes();
        console.log('Carpetas frecuentes cargadas:', this.carpetasFrecuentes);
      } catch (error) {
        console.error('Error al cargar carpetas frecuentes:', error);
      }

    }

}
