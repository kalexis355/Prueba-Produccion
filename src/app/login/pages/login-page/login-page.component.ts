import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ValidatorsService } from '../../services/validators.service';
//librerias de terceros
import Swal from 'sweetalert2'
import { Auth2Service } from '../../services/auth2.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  // propiedad de tipo FormGroup formulario reactivo
  loginForm: FormGroup;

  //injecciones
  private authService = inject(AuthService);
  private authService2 = inject(Auth2Service)
  private router = inject(Router)

  // injecciones en el constructor
  constructor(private fb: FormBuilder,
              private validatorService: ValidatorsService,
   ) {

  // defincion del formulario con sus controles
    this.loginForm = this.fb.group({
      //controles con su valor por defecto y sus validaciones sincronas y asincronas
      email: ['Admin', [Validators.required]],
      password: ['123', Validators.required]
    });
  }

  //funcion para ver y no ver la constraseña mediante señales
  //definicion de la señal con valor por defecto true
  hide = signal(true);
  //funcion cambiar estado de contraseña recibe informacion del click
  clickEvent(event: MouseEvent) {
    //cambia el valor de la señal
    this.hide.set(!this.hide());
    //evita la propagacion del clik a otros componentes
    event.stopPropagation();
  }


  //funcion para validar los controles
  isValidField(field:string){
    //se usa la funcion que esta en el servicio de validaciones
    return this.validatorService.isValidField(this.loginForm,field)

  }

  //metodo de login
  // onLogin() {
  //   //se tocan todos los controles del formulario
  //   this.loginForm.markAllAsTouched()
  //   //se verifica si el formulario es valido
  //   if (this.loginForm.valid) {
  //     //si es valido, se crea constantes con los valores del formulario
  //     const {email,password} = this.loginForm.value;
  //     //se usa el metodo del login del servicio enviando los valores del formulario
  //     this.authService.login(email,password)
  //     .subscribe({
  //       //si todo sale bien se llama la propiedad next
  //        next: () => this.router.navigateByUrl('/dashboard') ,
  //       //si algo sale mal se incluye la propiedad error
  //       error:(message) =>{
  //         //se llama a la libreria Swal para mostrar la alerta del error
  //         Swal.fire('Error',message,'error')
  //       }
  //     })
  //   }else{
  //     //si el formulario es invalido se usa la libreria para la alerta de error
  //     Swal.fire('Error','credenciales no validas','error')
  //   }
  // }

  onLogin2() {
    //se tocan todos los controles del formulario
    this.loginForm.markAllAsTouched()
    //se verifica si el formulario es valido
    if (this.loginForm.valid) {
      //si es valido, se crea constantes con los valores del formulario
      const {email,password} = this.loginForm.value;
      //se usa el metodo del login del servicio enviando los valores del formulario
      this.authService2.login2(email,password)
      .subscribe({
        //si todo sale bien se llama la propiedad next
         next: (data) =>{
          console.log(data, 'onLogin2');

          this.router.navigateByUrl('/dashboard')
         } ,
        //si algo sale mal se incluye la propiedad error
        error:(message) =>{
          //se llama a la libreria Swal para mostrar la alerta del error
          Swal.fire('Error',message,'error')
        }
      })
    }else{
      //si el formulario es invalido se usa la libreria para la alerta de error
      Swal.fire('Error','credenciales no validas','error')
    }
  }
}
