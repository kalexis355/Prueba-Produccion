import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class SortService {
  // se crea la propiedad para poder emitir el ultimo valor o valor mas reciente
  // Valor por defecto segun la ultima fecha de creacion
  private sortCriteriaSubject = new BehaviorSubject<string>('modic');

  //se cre la variable observable debido a que se convierte en un observable gracias al metodo asObservable
  //se agrega el signo pesos al final para saber que es un observable
  sortCriteria$ = this.sortCriteriaSubject.asObservable();

  setSortCriteria(criteria: string) {
    this.sortCriteriaSubject.next(criteria);
  }


}
