import { Component, inject, Input } from '@angular/core';
import { Archivo, Carpeta } from '../../interfaces/carpeta.interface';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'dash-tree-folder',
  templateUrl: './tree-folder.component.html',
  styleUrl: './tree-folder.component.css'
})
export class TreeFolderComponent {
  //propiedad que recibe la carpeta del padre donde puede ser una carpeta o archivo
  @Input() carpeta?: Carpeta | Archivo;

  //propiedad para controla el colapso del menu en cadena
  isCollapsed = true;


  //funcion para poder controlar el colapso
  toggleCollapse() {
    //se verifica si hay una carpeta
    if(this.carpeta){
    //si hay una carpeta se llama al tipo guard para saber si si es una carpeta
      if (this.isCarpeta(this.carpeta)) {
        //si lo es se cambia el el estado de la propiedad de colapso
        this.isCollapsed = !this.isCollapsed;
      }
    }
  }

  //funcion de tipo guard para saber si es una carpeta o un archivo
  //donde devuelve un item convertido en carpeta
  isCarpeta(item: Carpeta | Archivo): item is Carpeta {
    //si los hijos de esa carpeta es otra carpeta se devuelve ese hijo como una carpeta
    //si no se devuelve undefined
    return (item as Carpeta).hijos !== undefined;
  }
}
