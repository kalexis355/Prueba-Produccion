import { Component, inject } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar-progreso',
  template: `
  <app-loader-personalizado></app-loader-personalizado>
  <div class="progress-message">
    {{message}}
  </div>
`,
styles: [`
  .progress-message {
    color: white;
  }
`]
})
export class SnackBarProgresoComponent {
  message: string = '';
  snackBarRef = inject(MatSnackBarRef);
}
