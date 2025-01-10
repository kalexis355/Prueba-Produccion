import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-buscador-generico',
  templateUrl: './buscador-generico.component.html',
  styleUrl: './buscador-generico.component.css'
})
export class BuscadorGenericoComponent {
// funciona para manejar mejor los eventos de teclado
//   cuando se presiona una tecla se le puede dar un tiempo de espera y se hace con un ondebunce
//   En este caso manejara datos de tipo string
  private ondebunce:Subject<string> = new Subject<string>()

    @Input()
  public termino:string=''

  @Input()
  public placeHolder:string=''

  //Funciona para poder emitir un valor y que el padre lo pueda escuchar
  @Output()
  public emitirModeloPresionando:EventEmitter<string> = new EventEmitter();

  //funciona para poder traer el dato del input
  @ViewChild('valorInput')
  public valorInput!:ElementRef<HTMLInputElement>

  ngOnInit(): void {
    this.ondebunce
    //con ayuda del pipe estamos dandole una espera de  1 segundo entre presionada y presionada
    .pipe(
      debounceTime(1000)
      //despues se suscribe al ondebunce para saber el dato que se esta presionando
    ).subscribe( value => {
      console.log(value);

      //se hace para poder emitir el valor al elemento padre desde el elemento hijo
      this.emitirModeloPresionando.emit(value)

    })
  }

  //se realiza el metodo de emitirmodelPresionando creando la conexion con el elemneto html
  //despues se utiliza el ondebunce para ir emitiendo los valores
  emitirModelPresionando(){
    const valorNombre = this.valorInput.nativeElement.value;
    console.log(valorNombre);

    this.ondebunce.next(valorNombre)
   }
}
