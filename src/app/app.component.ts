import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './login/services/auth.service';
import { Router } from '@angular/router';
import { AuthStatus } from './login/interfaces';
import { Auth2Service } from './login/services/auth2.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  public title = 'archivador'

//se realiza la autenticacion en el appComponent debido a que por este componente
//pasa toda la aplicación

  // injecciones de servicios y router
  private authService2 = inject(Auth2Service);
  private router = inject(Router);

  //señal para finalizar el checkeo de autencicacion de solo lectura gracias a computed
  public finishedAuthCheck = computed<boolean>( () =>{
    // se verifica si la señal que esta en el servicio es checking
    if(this.authService2.authStatus() === AuthStatus.checking){
      //si lo es se retorna false y no se muestra nada de la aplicación
      return true;
    }
    //si no esta checking puede ser que este autenticado o no autenticado pero se mostrara la aplicación
    return true;
  })

  // propiedad de tipo efecto que cambia cada vez que cambie una señal
  public authStatusChangedEffect = effect(()=>{
    console.log('first');
    // cada que cambie authStatus del servicio cambia el efecto y de ahi la opcion que se defina
    console.log(this.authService2.authStatus());

    //se realiza un switch debido a que hay varios estatus
    switch(this.authService2.authStatus()){
    //en el caso de que sea checking no hace nada
      case AuthStatus.checking:
        return;
    //en el caso de que sea autenticado se envia directamente al dashboard
      case AuthStatus.authenticated:
        this.router.navigateByUrl('/dashboard');
        break;
    // en el caso de dque no este autenticado se envia al login
      case AuthStatus.notAuthenticated:
        this.router.navigateByUrl('/auth/login')
        break;
    }


  })

}
