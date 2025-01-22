import { Injectable,NgZone  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class LoaderService {
  private isLoading = new BehaviorSubject<boolean>(false);

  constructor(private ngZone: NgZone) { }

  mostrar() {
    this.ngZone.run(() => {
      this.isLoading.next(true);
    });
  }

  ocultar() {
    this.ngZone.run(() => {
      this.isLoading.next(false);
    });
  }

  get cargando$() {
    return this.isLoading.asObservable();
  }
}
