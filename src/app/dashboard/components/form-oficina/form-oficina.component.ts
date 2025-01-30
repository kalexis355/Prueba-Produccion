import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../login/services/validators.service';
import { AuthService } from '../../../login/services/auth.service';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import Swal from 'sweetalert2'
import imageCompression from 'browser-image-compression';
import { ActualizarOficinas, CrearOficina, Oficinas } from '../../../login/interfaces/oficina.interface';


@Component({
  selector: 'app-form-oficina',
  templateUrl: './form-oficina.component.html',
  styleUrl: './form-oficina.component.css',
})
export class FormOficinaComponent implements OnInit,OnChanges {
  officeForm!: FormGroup;
  // public authService = inject(AuthService);
  public oficinaService = inject(GestionOficinasService)

  public oficinasCreadas:Oficinas[]=[]
  iconoBytes: number[] | null = null; // Cambiamos a tipo number[]

  iconoPrevisualizacion: string | undefined;

  @Input()
  public oficinaAEditar!: Oficinas | null;

  esModoEdicion:boolean = false;
  estaCreando = false;
  estaEditando = false;



  constructor(
    private fb: FormBuilder,
    private validatorService: ValidatorsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['oficinaAEditar'] && changes['oficinaAEditar'].currentValue) {
      this.esModoEdicion= true
      this.officeForm.patchValue({
        nombre: this.oficinaAEditar!.Nombre,
        codigoSerie: this.oficinaAEditar?.CodigoSerie,
        estado: this.oficinaAEditar?.Estado,
      });
    }
  }

  ngOnInit(): void {
    this.initializeForm();
  }


  initializeForm() {
    this.officeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigoSerie:['',[Validators.required]],
      icono:[''],
      estado:[]
    });
  }

  onSubmit() {

    this.officeForm.markAllAsTouched()

    if(this.officeForm.valid){
      console.log('si');



      if (!this.iconoBytes && !this.esModoEdicion) {
        Swal.fire({
          title: '¿No desea elegir un Icono?',
          text: 'No podrás revertir esta acción',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, confirmar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.crearOActualizarOficina()
          }
        });
      } else {
        this.crearOActualizarOficina()
      }

    }else{
      Swal.fire('Error','Llene todos los campos','error')
    }
  }

  private crearOActualizarOficina() {
    const {nombre,codigoSerie,estado} = this.officeForm.value

    const body:CrearOficina={
      Nombre:nombre,
      CodigoSerie:codigoSerie,
      ...(this.iconoBytes ? { Icono: this.iconoBytes } : {}) // Agrega Icono solo si tiene valor
    }

    if(this.oficinaAEditar && this.esModoEdicion){
      this.estaEditando = true; // Desactiva el boton
      console.log('icono',this.oficinaAEditar.Icono);


      const bodyActualizar:ActualizarOficinas ={

        Cod: this.oficinaAEditar.Cod,
        Nombre: nombre,
        Estado: estado,
        Entidad: this.oficinaAEditar.Entidad,
        CodigoSerie: codigoSerie,
        Icono: this.iconoBytes || this.convertirBase64ABits(this.oficinaAEditar.Icono!)  // Usa el nuevo icono si existe, de lo contrario usa el actual
      }
      console.log('bodyActualizar',bodyActualizar);

      this.oficinaService.actualizarDependencia(bodyActualizar).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Dependencia actualizada', 'success');
          this.oficinaService.actualizarOficinas();
          this.officeForm.reset();
          this.esModoEdicion = false;
          this.oficinaAEditar = null;
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo actualizar la dependencia', 'error');
        },
        complete: () => {
          this.estaEditando = false;
        }
      });

    }else{
      this.estaCreando = true; // Desactiva el botón
      console.log(body,'body de crear');

      this.oficinaService.crearOficina(body).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Dependencia creada', 'success');
          this.oficinaService.actualizarOficinas();
          this.officeForm.reset();
        },
        error: (error) => {
          // Manejar el error si es necesario
          Swal.fire('Error', 'No se pudo crear la dependencia', 'error');
        },
        complete: () => {
          this.estaCreando = false; // Reactiva el botón cuando termina
        }
      });
    }



  }

  convertirBase64ABits(base64: string): number[] {

    // Verifica si el Base64 incluye el prefijo 'data:image/png;base64,' y elimínalo si es necesario
    const base64SinPrefijo = base64.includes(",") ? base64.split(",")[1] : base64;

    try {
      // Decodifica el string Base64 a una cadena binaria
      const binaryString = atob(base64SinPrefijo);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      // Llena el Uint8Array con los valores de cada carácter en la cadena binaria
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convierte `Uint8Array` a un arreglo de `number[]`
      return Array.from(bytes);
    } catch (error) {
      console.error("Error al decodificar Base64:", error);
      return []; // Devuelve un arreglo vacío en caso de error
    }
  }

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     const reader = new FileReader();



  //     reader.onload = () => {
  //       // `result` es un ArrayBuffer que contiene los datos binarios del archivo
  //       const arrayBuffer = reader.result as ArrayBuffer;

  //       // Convierte ArrayBuffer a Uint8Array (arreglo de bytes)
  //       const byteArray = new Uint8Array(arrayBuffer);

  //       // Imprime el arreglo de bytes en la consola para verificar
  //       this.iconoBytes = Array.from(byteArray); // Convertimos Uint8Array a number[]
  //       console.log(this.iconoBytes, 'ArregloBits');

  //       // Puedes enviar `byteArray` al backend o procesarlo como necesites
  //     };

  //     reader.readAsArrayBuffer(file);
  //   }
  // }
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Opciones de compresión
      const options = {
        maxSizeMB: 1, // Tamaño máximo después de comprimir (1MB)
        maxWidthOrHeight: 800, // Máxima dimensión permitida
        useWebWorker: true,
      };

      try {
        // Comprimir la imagen
        const compressedFile = await imageCompression(file, options);
        console.log('Tamaño original:', file.size / 1024 / 1024, 'MB');
        console.log('Tamaño comprimido:', compressedFile.size / 1024 / 1024, 'MB');

        // Convertir a ArrayBuffer
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const byteArray = new Uint8Array(arrayBuffer);
          this.iconoBytes = Array.from(byteArray);
          console.log('Imagen comprimida convertida a bytes:', this.iconoBytes.length);
        };

        reader.readAsArrayBuffer(compressedFile);

        // Opcional: Mostrar preview de la imagen
        const previewReader = new FileReader();
        previewReader.onload = () => {
          this.iconoPrevisualizacion = previewReader.result as string;
        };
        previewReader.readAsDataURL(compressedFile);

      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        Swal.fire('Error', 'No se pudo procesar la imagen', 'error');
      }
    }
  }



  cancelar(){
    this.esModoEdicion = false
    this.oficinaAEditar = null
    this.officeForm.reset()
  }








}
