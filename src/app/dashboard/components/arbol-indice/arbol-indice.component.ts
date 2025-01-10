import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TreeControl } from '@angular/cdk/tree';  // Usamos TreeControl, no FlatTreeControl ni MatTreeControl
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { IndiceElectronico } from '../../interfaces/carpeta.interface';

@Component({
  selector: 'app-arbol-indice',
  templateUrl: './arbol-indice.component.html',
  styleUrls: ['./arbol-indice.component.css']
})
export class ArbolIndiceComponent implements OnChanges,OnInit {

  @Input() indiceElectronico?: IndiceElectronico[]=[]

  ngOnInit(): void {
    console.log(this.indiceElectronico,'hola');

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['indiceElectronico']) {
      console.log('Índice recibido en componente hijo:', this.indiceElectronico);
    }
  }

  getTipoCarpetaIcon(tipo: number): string {
    switch (tipo) {
      case 1:
        return '📁'; // Oficina
      case 2:
        return '📂'; // Subserie
      case 3:
        return '📑'; // Expediente
      default:
        return '📄';
    }
  }

  getTipoCarpetaClass(item: IndiceElectronico): string {
    return `tipo-${item.TipoCarpeta}`;
  }
}
