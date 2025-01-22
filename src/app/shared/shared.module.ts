import { NgModule } from '@angular/core';
import { LoaderPersonalizadoComponent } from './components/loader-personalizado/loader-personalizado.component';
import { CommonModule } from '@angular/common';
import { SnackBarProgresoComponent } from './components/snack-bar-progreso/snack-bar-progreso.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LoaderPersonalizadoComponent, SnackBarProgresoComponent],
  exports: [LoaderPersonalizadoComponent],
  providers: [],
})
export class SharedModule { }
