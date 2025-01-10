import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject, debounceTime, map, startWith } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { Archivo, Carpeta } from '../../interfaces/carpeta.interface';
import { RutaService } from '../../services/ruta.service';
import { CheckBoxService } from '../../services/checkBox.service';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent implements OnInit {
 //funciona para manejar mejor los eventos de teclado
  //cuando se presiona una tecla se le puede dar un tiempo de espera y se hace con un ondebunce
  //En este caso manejara datos de tipo string
  // private ondebunce:Subject<string> = new Subject<string>()

  //   @Input()
  // public termino:string=''

  // //Funciona para poder emitir un valor y que el padre lo pueda escuchar
  // @Output()
  // public emitirModeloPresionando:EventEmitter<string> = new EventEmitter();

  // //funciona para poder traer el dato del input
  // @ViewChild('valorInput')
  // public valorInput!:ElementRef<HTMLInputElement>

  // ngOnInit(): void {
  //   this.ondebunce
  //   //con ayuda del pipe estamos dandole una espera de  1 segundo entre presionada y presionada
  //   .pipe(
  //     debounceTime(1000)
  //     //despues se suscribe al ondebunce para saber el dato que se esta presionando
  //   ).subscribe( value => {
  //     console.log(value);

  //     //se hace para poder emitir el valor al elemento padre desde el elemento hijo
  //     this.emitirModeloPresionando.emit(value)

  //   })
  // }

  // //se realiza el metodo de emitirmodelPresionando creando la conexion con el elemneto html
  // //despues se utiliza el ondebunce para ir emitiendo los valores
  // emitirModelPresionando(){
  //   const valorNombre = this.valorInput.nativeElement.value;
  //   console.log(valorNombre);

  //   this.ondebunce.next(valorNombre)
  //  }

  public dashService = inject(DashboardService);
  public rutaService = inject(RutaService)
  public checkService = inject(CheckBoxService)

  // myControl = new FormControl('');
  // filteredOptions?: Observable<Carpeta[]>;

  // ngOnInit() {
  //   this.filteredOptions = this.myControl.valueChanges.pipe(
  //     startWith(''),
  //     map(value => this._filter(value || '')),
  //   );


  // }

  // private _filter(value: string): Carpeta[] {
  //   const filterValue = value.toLowerCase();
  //   return this.filterCarpetas(this.dashService.dataCarpetas() || [], filterValue);
  // }

  // // Función recursiva para filtrar solo carpetas
  // private filterCarpetas(items: (Carpeta)[], filterValue: string): Carpeta[] {
  //   let filtered: Carpeta[] = [];

  //   for (const item of items) {
  //     if (item.tipo === 'carpeta') {  // Solo procesar si es una Carpeta
  //       const carpeta = item as Carpeta;

  //       // Verificar si el nombre de la carpeta coincide con el filtro
  //       if (carpeta.nombre.toLowerCase().includes(filterValue)) {
  //         filtered.push(carpeta);

  //         // Filtrar hijos si existen
  //         if (carpeta.hijos) {
  //           const filteredChildren = this.filterCarpetas(carpeta.hijos as Carpeta[], filterValue);
  //           if (filteredChildren.length > 0) {
  //             // Solo agregar carpeta a la lista filtrada si tiene hijos que coinciden
  //             filtered.push(...filteredChildren);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   return filtered;
  // }

  myControl = new FormControl('');
  options: Carpeta[] = this.dashService.dataCarpetas();
  filteredOptions?: Observable<Carpeta[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): Carpeta[] {
    const filterValue = value.toLowerCase();

    // return this.options.filter(option => option.nombre.toLowerCase().includes(filterValue));
    return this.filterCarpetas(this.dashService.dataCarpetas() || [], filterValue);
  }

  private filterCarpetas(items: Carpeta[], filterValue: string): Carpeta[] {
    let filtrado: Carpeta[] = [];

    for (const item of items) {
      if (item.tipo === 'carpeta') {
        let includeItem = item.nombre.toLowerCase().includes(filterValue);

        // Filtrar hijos si existen
        if (item.hijos) {
          const filteredChildren = this.filterCarpetas(item.hijos as Carpeta[], filterValue);
          if (filteredChildren.length > 0) {
            includeItem = true; // Incluir carpeta padre si tiene hijos coincidentes
            filtrado.push(...filteredChildren);
          }
        }

        if (includeItem) {
          filtrado.push(item);
        }
      }
    }

    return filtrado;
  }


  private mapaCarpetas: Map<string, Carpeta> = new Map();

  constructor() {
    const carpetas = this.dashService.dataCarpetas();
    carpetas.forEach(carpeta => this.agregarCarpetaAlMapa(carpeta));
  }

  // Función recursiva para agregar todas las carpetas al mapa
  private agregarCarpetaAlMapa(carpeta: Carpeta): void {
    this.mapaCarpetas.set(carpeta.id!, carpeta);

    if (carpeta.hijos) {
      carpeta.hijos.forEach(hijo => {
        if (hijo.tipo === 'carpeta') {
          this.agregarCarpetaAlMapa(hijo as Carpeta);
        }
      });
    }
  }

  public imprimirRuta(option: Carpeta): void {

    this.rutaService.guardarRuta.set([])
    this.checkService.carpetasSeleccionadas.set([])
    this.checkService.checkboxStates.set({})
    this.checkService.archivosSeleccionados.set([])
    this.checkService.archivosTotal.set([])

    this.rutaService.guardarRutaPArcial(option)

    while (option.padreId) {
      const padre = this.mapaCarpetas.get(option.padreId);

      if (!padre) {
        console.error('Carpeta padre no encontrada');
        return;
      }
      this.rutaService.guardarRutaPArcial(padre)


      option = padre;
    }

    console.log(this.rutaService.guardarRuta().reverse());
    this.myControl.reset();
  }
}
