import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2'

@Injectable({providedIn: 'root'})
export class ValidatorsService {


  //propiedad para validar el correo donde este una arraba y despues del punto por lo menos dos caracteres
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public ccPattern: string = '^[0-9]{6,10}$';

  //metodo para validar los controles del formulario recibiendo el formulario y el control a evaluar
  //retornando un booleano o null debido a que si se retorna null significa que no hay errores
  public isValidField(form: FormGroup, field: string):boolean|  null{
    // se usa el control del formulario para evaluar si tiene errores
    return form.controls[field].errors
    // igualmente se usa la funcion touched para tocar el control y verificar aun asi el usuario no haya escrito nada en el
    && form.controls[field].touched
  }

  public passwordsMatchValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get('contrasena')?.value;
      const confirmPassword = form.get('repetircontraseña')?.value;

      if (password !== confirmPassword) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  }
}
