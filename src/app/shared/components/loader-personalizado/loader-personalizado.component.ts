import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { LoaderService } from '../../../dashboard/services/gestionLoader.service';
import { delay, tap } from 'rxjs';

@Component({
  selector: 'app-loader-personalizado',
  templateUrl: './loader-personalizado.component.html',
  styleUrl: './loader-personalizado.component.css'
})
export class LoaderPersonalizadoComponent {

  public loaderService = inject(LoaderService)
  public cdr = inject(ChangeDetectorRef)

  loading$ = this.loaderService.cargando$.pipe(
    delay(0),
    tap(() => this.cdr.detectChanges())
  );

}
