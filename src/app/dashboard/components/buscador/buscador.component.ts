import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject, debounceTime, map, startWith } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { Archivo, Carpeta, IndiceElectronico, IndiceUnificado } from '../../interfaces/carpeta.interface';
import { RutaService } from '../../services/ruta.service';
import { CheckBoxService } from '../../services/checkBox.service';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { Auth2Service } from '../../../login/services/auth2.service';

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
  public gestionCarpetaService = inject(GestionCarpetasService);
  public authService2 = inject(Auth2Service); // Añadir esta inyección

  indiceUnificado: IndiceUnificado = { IndiceElectronico: [] };

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
  filteredOptions?: Observable<IndiceElectronico[]>;

  private mapaIndices: Map<string, IndiceElectronico> = new Map();

  private inicializarMapaIndices(indices: IndiceElectronico[]): void {
    indices.forEach(indice => {
      this.mapaIndices.set(indice.Path, indice);
      if (indice.Subcarpetas) {
        this.inicializarMapaIndices(indice.Subcarpetas);
      }
    });
  }

  ngOnInit() {
    const CodUsuario = this.authService2.currentUSer2()?.Cod;
    if (CodUsuario) {
      this.gestionCarpetaService.obtenerCarpetaRaiz(CodUsuario)
        .subscribe({
          next: ({ indiceUnificado }) => {
            this.indiceUnificado = indiceUnificado;
            this.inicializarMapaIndices(this.indiceUnificado.IndiceElectronico);

            // Inicializar filteredOptions después de tener los datos
            this.filteredOptions = this.myControl.valueChanges.pipe(
              startWith(''),
              map(value => this._filter(value || '')),
            );
          },
          error: (error) => {
            console.error('Error al obtener el índice unificado:', error);
          }
        });
    }
  }

  private _filter(value: string): IndiceElectronico[] {
    const filterValue = value.toLowerCase();
    return this.filterIndices(this.indiceUnificado.IndiceElectronico, filterValue);
  }

  private filterIndices(indices: IndiceElectronico[], filterValue: string): IndiceElectronico[] {
    let filtrado: IndiceElectronico[] = [];

    for (const indice of indices) {
      let includeItem = indice.Nombre.toLowerCase().includes(filterValue);

      // Filtrar subcarpetas si existen
      if (indice.Subcarpetas) {
        const filteredChildren = this.filterIndices(indice.Subcarpetas, filterValue);
        if (filteredChildren.length > 0) {
          includeItem = true; // Incluir carpeta padre si tiene subcarpetas coincidentes
          filtrado.push(...filteredChildren);
        }
      }

      if (includeItem) {
        filtrado.push(indice);
      }
    }

    return filtrado;
  }

  // public imprimirRuta(indice: IndiceElectronico): void {
  //   // Reiniciar estados
  //   this.rutaService.guardarRuta.set([]);
  //   this.checkService.carpetasSeleccionadas.set([]);
  //   this.checkService.checkboxStates.set({});
  //   this.checkService.archivosSeleccionados.set([]);
  //   this.checkService.archivosTotal.set([]);

  //   // Construir la ruta usando el Path
  //   const paths = indice.Path.split('.');
  //   let currentPath = '';

  //   paths.forEach(cod => {
  //     currentPath = currentPath ? `${currentPath}.${cod}` : cod;
  //     const carpetaActual = this.mapaIndices.get(currentPath);
  //     if (carpetaActual) {
  //       this.rutaService.guardarRutaPArcial(this.convertirAFormatoCarpeta(carpetaActual));
  //     }
  //   });

  //   console.log(this.rutaService.guardarRuta().reverse());
  //   this.myControl.reset();
  // }

  // // Función auxiliar para convertir IndiceElectronico a Carpeta
  // private convertirAFormatoCarpeta(indice: IndiceElectronico): Carpeta {
  //   return {
  //     id: indice.Cod.toString(),
  //     nombre: indice.Nombre,
  //     tipo: 'carpeta',
  //     padreId: indice.Path.split('.').slice(0, -1).join('.') || undefined,
  //     // Agrega aquí otros campos necesarios de tu interfaz Carpeta
  //   };
  // }
}
