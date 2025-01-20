import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class LoaderService {
  private isLoading = new BehaviorSubject<boolean>(false);

  constructor() { }

  mostrar() {
    this.isLoading.next(true);
  }

  ocultar() {
    this.isLoading.next(false);
  }

  get cargando$() {
    return this.isLoading.asObservable();
  }
}
