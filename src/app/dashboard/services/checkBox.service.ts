import { Injectable, signal } from '@angular/core';
import { Archivo, Carpeta } from '../interfaces/carpeta.interface';

@Injectable({providedIn: 'root'})
export class CheckBoxService {

  public checkboxStates = signal<{ [id: string]: boolean }>({});
  public carpetasSeleccionadas = signal<Carpeta[]>([])
  public archivosSeleccionados = signal<Archivo[]>([])
  public archivosTotal = signal<(Archivo|Carpeta)[]>([])



  constructor() { }

  updateCheckboxState(elementos: (Carpeta)[], id: string, isChecked: boolean): void {
    // Actualizar el estado del checkbox
    this.checkboxStates.update(states => ({
      ...states,
      [id]: isChecked
    }));

    if (isChecked) {
      // Filtrar carpetas seleccionadas
      const carpetasSeleccionadas = elementos.filter((elementoSeleccionado): elementoSeleccionado is Carpeta =>
        this.checkboxStates()[elementoSeleccionado.id!] && elementoSeleccionado.tipo === 'carpeta'
      );

      // Actualizar las carpetas seleccionadas
      this.carpetasSeleccionadas.update(() => carpetasSeleccionadas);
    } else {
      // Remover carpeta deseleccionada
      this.carpetasSeleccionadas.update(current =>
        current.filter(c => c.id !== id)
      );
    }
  }


  updateCheckboxArchivo(archivos:Archivo[], id:string, isChecked:boolean){
    this.checkboxStates.update(states => ({
      ...states,
      [id]: isChecked
    }));

    console.log(this.checkboxStates() , 'check');
    if (isChecked) {
      // Filtrar archivos seleccionados
      const archivosSeleccionados = archivos.filter((elementoSeleccionado): elementoSeleccionado is Archivo =>
        this.checkboxStates()[elementoSeleccionado.id!] && elementoSeleccionado.tipo === 'archivo'
      );

      // Actualizar los archivos seleccionados
      this.archivosSeleccionados.update(() => archivosSeleccionados);
    } else {
      // Remover archivo deseleccionado
      this.archivosSeleccionados.update(current =>
        current.filter(a => a.id !== id)
      );
    }

    console.log(this.archivosSeleccionados(), 'archivosSeleccionados');


  }

  isChecked(id: string): boolean {

    return this.checkboxStates()[id] || false;
  }

}
