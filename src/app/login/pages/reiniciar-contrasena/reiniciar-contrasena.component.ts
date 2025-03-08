import { Component, signal } from '@angular/core';
import { ValidatorsService } from '../../services/validators.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reiniciar-contrasena',
  templateUrl: './reiniciar-contrasena.component.html',
  styleUrl: './reiniciar-contrasena.component.scss'
})
export class ReiniciarContrasenaComponent {
  reiniciarForm: FormGroup;

constructor(
  private fb: FormBuilder,
  private validatorService: ValidatorsService,


){
  this.reiniciarForm = this.fb.group({
    //controles con su valor por defecto y sus validaciones sincronas y asincronas
    password: ['', Validators.required],
    password2:['',Validators.required]
  });
}




hide = signal(true);
clickEvent(event: MouseEvent) {
  //cambia el valor de la señal
  this.hide.set(!this.hide());
  //evita la propagacion del clik a otros componentes
  event.stopPropagation();
}

hide2 = signal(true);
  clickEvent2(event: MouseEvent) {
    //cambia el valor de la señal
    this.hide2.set(!this.hide2());
    //evita la propagacion del clik a otros componentes
    event.stopPropagation();
  }


  isValidField(field:string){
    //se usa la funcion que esta en el servicio de validaciones
    return this.validatorService.isValidField(this.reiniciarForm,field)

  }

}
