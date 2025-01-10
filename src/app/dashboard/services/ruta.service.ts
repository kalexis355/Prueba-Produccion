import { Injectable, signal } from '@angular/core';
import { Carpeta } from '../interfaces/carpeta.interface';

@Injectable({providedIn: 'root'})
export class RutaService {

  public guardarRuta = signal<Carpeta[]>([])

  constructor() { }

  guardarRutaPArcial(carpeta:Carpeta | undefined){
    this.guardarRuta.update(carpetica => {

      if (!carpetica.includes(carpeta as Carpeta)) {
        carpetica.push(carpeta as Carpeta);
      }
      return carpetica;
    });

  }

  eliminarUltimaCarpeta() {
    this.guardarRuta.update(carpetica => {
      if(carpetica.length<0){
        console.log('no se puede');

      }
      console.log('si se pudo');

      carpetica.pop(); // Elimina la última carpeta de la ruta
      return carpetica;
    });

    console.log(this.guardarRuta());
  }


  recortarRutaHasta(id: string) {
    this.guardarRuta.update(carpetica => {

      const indice = carpetica.findIndex(carpeta => {
        return carpeta.id === id;
      });

      if (indice !== -1) {
        if (indice === 0) {
          console.log('Se ha hecho clic en la primera carpeta, eliminando todas las posteriores.');
          return carpetica.slice(0, 1);
        }

        if (indice < carpetica.length - 1) {
          console.log('Recortando la ruta hasta la carpeta seleccionada.');
          return carpetica.slice(0, indice + 1);
        }

        if (indice === carpetica.length - 1) {
          console.log('No se puede recortar, es la última carpeta.');
          return carpetica;
        }
      }

      return carpetica; // No hacer cambios si el ID no se encuentra
    });

  }
}
