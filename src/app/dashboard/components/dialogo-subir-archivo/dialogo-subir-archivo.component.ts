import { Component, Inject, inject, OnInit } from '@angular/core';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import { UsuarioConsultado } from '../../../login/interfaces';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { ArchivoDatos, Documento, TipoArchivos } from '../../interfaces/archivos.interface';
import { error } from 'console';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';


import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogoDetallesArchivosComponent } from '../dialogo-detalles-archivos/dialogo-detalles-archivos.component';
import JSZip from 'jszip';

@Component({
  selector: 'app-dialogo-subir-archivo',
  templateUrl: './dialogo-subir-archivo.component.html',
  styleUrl: './dialogo-subir-archivo.component.css'
})
export class DialogoSubirArchivoComponent implements OnInit {


  public gestionUsuarios = inject(GestionUsuariosService);
  public gestionArchivosService = inject(GestionArchivosService)

  usuarios: UsuarioConsultado[] = [];
  tipoArchivos: TipoArchivos[]=[];
  private colaArchivos: { archivo: File, arregloBits: Uint8Array }[] = [];
  documento!: Documento;
  nombre:string = '';
  formato:string = '';
  esDocumento: boolean = false;
  tamanio:string='';
  numeroHojas:number=0;
  duracion:string=''
  esImagen:boolean=false
  esComprimido:boolean=false;
  firmar:string = '0';
  archivosProcessados: ArchivoDatos[] = [];

   formatosComprimidos: string[] = [
    "zip", "rar", "7z", "tar", "tar.gz", "tar.bz2", "tar.xz", "gz", "bz2", "xz",
    "iso", "cab", "lzh", "arj", "z", "lzma", "tar.z", "wim", "udf", "ace"
  ];

   formatosAudio = [
    'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'aiff',
    'alac', 'opus', 'amr', 'ac3', 'weba'
  ];
   formatosVideo = [  'mp4', 'mkv', 'webm', 'mov', 'avi', 'flv', 'wmv', 'mpg',
    'mpeg', 'm4v', '3gp', '3g2', 'ogg', 'ogv'];

   formatosImagenAnimada = ['gif', 'apng'];

    formatosImagen = [
    // Formatos Comunes
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',

    // Formatos de Alta Calidad y Sin Pérdida
    'tiff', 'tif', 'raw', 'heif', 'heic',

    // Formatos de Iconos y Gráficos Vectoriales
    'ico', 'svgz', 'eps', 'ai',

    // Formatos Menos Comunes
    'jfif', 'avif', 'pgm', 'ppm', 'pnm', 'pbm'
  ];

   formatosMultimedia = [
    ...this.formatosAudio,
    ...this.formatosVideo,
    ...this.formatosImagenAnimada,
    ...this.formatosImagen
  ];

    archivoForm!: FormGroup;


  constructor(
     private fb: FormBuilder,
     private dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogoSubirArchivoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}



  ngOnInit(): void {
    this.inicializarFormularioArchivo();
    this.ObtenerUsuarios();
    this.obtenerTipoArchivos();

    this.procesarDatos();


  }

  inicializarFormularioArchivo(){
    this.archivoForm = this.fb.group({
      archivos: this.fb.array([])
    });

  }

  private crearGrupoFormularioArchivo() {
    return this.fb.group({
      nombre: [this.nombre,Validators.required],
      tipoArchivo: ['', Validators.required],

    });
  }

    // Getter para acceder al FormArray
    get archivosFormArray() {
      return this.archivoForm.get('archivos') as FormArray;
    }

  // async procesarDatos(){
  //   try {
  //     const archivo: File = this.data.archivo;
  //     this.colaArchivos = this.data.colaArchivos
  //     console.log(this.colaArchivos.length,'numero de archivos');



  //     // Obtener nombre y formato
  //     this.nombre = archivo.name.split('.').slice(0, -1).join('.');
  //     this.formato = archivo.name.split('.').pop() || 'Desconocido';

  //     // Validar si es un documento
  //     const formatosDocumentos = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];

  //     this.esDocumento = formatosDocumentos.includes(this.formato);



  //     this.esImagen = this.formatosImagen.includes(this.formato);

  //     this.esComprimido = this.formatosComprimidos.includes(this.formato);

  //      this.tamanio = (archivo.size / (1024 * 1024)).toFixed(2)+'MB';


  //      if(this.formatosVideo.includes(this.formato)){
  //       this.duracion = await this.obtenerDuracionVideo(archivo);
  //      }

  //      if (this.formatosAudio.includes(this.formato)) {
  //       this.duracion = await this.obtenerDuracionAudio(archivo);
  //      }


  //     // Esperar el número de hojas
  //     this.numeroHojas = await this.contarHojasArchivo(archivo);

  //     this.archivoForm.patchValue({
  //       nombre: this.nombre,
  //       formato: this.formato,
  //       numeroHojas: this.numeroHojas,
  //       duracion: this.duracion,
  //       tamaño: this.tamanio
  //     });
  //     console.log(`Archivo procesado: ${this.nombre}, Hojas: ${this.numeroHojas}`);
  //   } catch (error) {
  //     console.error('Error al procesar datos:', error);
  //   }

  // }

  eliminarArchivo(index: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar ${this.archivosProcessados[index].nombre} de la lista?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Eliminar el archivo
        this.archivosFormArray.removeAt(index);
        this.archivosProcessados.splice(index, 1);
        this.colaArchivos.splice(index, 1);

        // Verificar si quedan archivos
        if (this.archivosProcessados.length === 0) {
          // Cerrar el diálogo actual
          this.dialogRef.close();

          // Mostrar mensaje de que no hay archivos
          Swal.fire({
            title: 'No hay archivos',
            text: 'Ya no hay archivos en la lista. Por favor, seleccione nuevos archivos.',
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          });
        } else {
          // Mostrar mensaje de éxito normal si aún quedan archivos
          Swal.fire(
            '¡Eliminado!',
            'El archivo ha sido eliminado de la lista.',
            'success'
          );
        }
      }
    });
  }

  tieneDocumentosSinSeleccionar(): boolean {
    return this.archivosProcessados.some(archivo =>
      archivo.esDocumento && (!archivo.firmar || archivo.firmar === '0')
    );
  }

  onFirmarChange(value: string,archivo:ArchivoDatos) {
    archivo.firmar = value

    // console.log(this.archivosProcessados[0]);
  // Buscar y actualizar el archivo en archivosProcesados
  const index = this.archivosProcessados.findIndex(a => a.nombre === archivo.nombre);
  if (index !== -1) {
    this.archivosProcessados[index].firmar = value;
  }
  if (this.tieneDocumentosSinSeleccionar()) {
    this.archivoForm.setErrors({ documentosSinFirmar: true });
  } else {
    const currentErrors = this.archivoForm.errors;
    if (currentErrors) {
      delete currentErrors['documentosSinFirmar'];
      this.archivoForm.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
    }
  }
  }

  onTipoArchivoChange(event: any, archivo: ArchivoDatos) {
    const tipoSeleccionado = event.target.value;
    archivo.tipoArchivo = +tipoSeleccionado;
    console.log('Tipo de archivo seleccionado:', archivo.tipoArchivo);
    console.log('Archivo actualizado:', archivo);
  }

  async procesarDatos() {
    try {
          // Mostrar loader
    Swal.fire({
      title: 'Cargando archivos',
      html: 'Por favor espere mientras se cargan los archivos...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
      this.colaArchivos = this.data.colaArchivos;

      for (const item of this.colaArchivos) {
        const archivo = item.archivo;
        const datos:ArchivoDatos = {
          nombre: archivo.name.split('.').slice(0, -1).join('.'),
          formato: (archivo.name.split('.').pop() || 'Desconocido').toLowerCase(),
          tamanio: (archivo.size / (1024 * 1024)).toFixed(2) + 'MB',
          numeroHojas: 0,
          duracion: '0',
          esDocumento: false,
          esImagen: false,
          esComprimido: false,
          firmar: this.firmar,
          tipoArchivo:0
        };

        this.nombre = datos.nombre
        this.formato = datos.formato

        datos.esDocumento = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(datos.formato);
        datos.esImagen = this.formatosImagen.includes(datos.formato);
        datos.esComprimido = this.formatosComprimidos.includes(datos.formato);

        this.esDocumento = datos.esDocumento


        if (this.formatosVideo.includes(datos.formato)) {
          datos.duracion = await this.obtenerDuracionVideo(archivo);
        }

        if (this.formatosAudio.includes(datos.formato)) {
          datos.duracion = await this.obtenerDuracionAudio(archivo);
        }

        datos.numeroHojas = await this.contarHojasArchivo(archivo);


        this.numeroHojas = datos.numeroHojas
        this.duracion = datos.duracion

        // Agregar a un array de formularios o a una tabla
        console.log(datos,'antes de agregar al arreglo');

        this.archivosProcessados.push(datos);

        const grupoArchivo = this.crearGrupoFormularioArchivo();
        grupoArchivo.patchValue({
          nombre: datos.nombre,
          tipoArchivo: ''
        });
        this.archivosFormArray.push(grupoArchivo);
      }
       // Cerrar el loader y mostrar mensaje de éxito
    await Swal.fire({
      icon: 'success',
      title: 'Archivos cargados',
      text: `Se han cargado ${this.archivosProcessados.length} archivos correctamente`,
      timer: 1500
    });

    } catch (error) {
      console.error('Error al procesar datos:', error);
    }
  }

  abrirDetalles(archivo:ArchivoDatos){
    const dialogRef = this.dialog.open(DialogoDetallesArchivosComponent, {
      width: '40%',
      height: '350px',
      maxWidth: '100%', // Desactiva el ancho máximo
      data:{
        archivo
      }
    });
  }


  desactivarDocumento(cod: number,archivo:ArchivoDatos): boolean {
    // Desactivar Documento Electrónico o Digital si es multimedia

    if (this.formatosMultimedia.includes(archivo.formato)) {
      return cod === 1 || cod === 2;
    }

    // Desactivar Imagen, Video o Audio si es documento
    if (archivo.esDocumento) {
      return cod === 3 || cod === 4 || cod === 5;
    }

    // Por defecto, habilitar la opción
    return false;
  }

  obtenerTipoArchivos(){
    this.gestionArchivosService.obtenerTipoArchivo()
    .subscribe({
      next:(tipoArchivosObtenidos) =>{
        this.tipoArchivos = tipoArchivosObtenidos;
      },
      error:(error)=>{
        console.error('Error al obtener los usuarios:', error);

      }
    })
  }


  ObtenerUsuarios(){
    this.gestionUsuarios.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioConsultado[]) => {
        this.usuarios = usuarios;
      },
      error: (err) => {
        console.error('Error al obtener los usuarios:', err);
      }
    });
  }


  async obtenerDuracionAudio(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(archivo);
      const audio = document.createElement('audio');

      audio.preload = 'metadata';
      audio.src = url;

      audio.onloadedmetadata = () => {
        const duracionEnSegundos = audio.duration;

        // Convertir a formato "HH:mm:ss"
        const horas = Math.floor(duracionEnSegundos / 3600);
        const minutos = Math.floor((duracionEnSegundos % 3600) / 60);
        const segundos = Math.floor(duracionEnSegundos % 60);

        const duracion = [
          horas.toString().padStart(2, '0'),
          minutos.toString().padStart(2, '0'),
          segundos.toString().padStart(2, '0'),
        ].join(':');

        URL.revokeObjectURL(url); // Liberar memoria
        resolve(duracion);
      };

      audio.onerror = () => {
        console.error('Error al cargar el archivo de audio.');
        reject('00:00:00');
      };
    });
  }

async obtenerDuracionVideo(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const duracionEnSegundos = video.duration;

      // Convertir a formato "HH:mm:ss"
      const horas = Math.floor(duracionEnSegundos / 3600);
      const minutos = Math.floor((duracionEnSegundos % 3600) / 60);
      const segundos = Math.floor(duracionEnSegundos % 60);

      const duracion = [
        horas.toString().padStart(2, '0'),
        minutos.toString().padStart(2, '0'),
        segundos.toString().padStart(2, '0'),
      ].join(':');

      URL.revokeObjectURL(url); // Liberar memoria
      resolve(duracion);
    };

    video.onerror = () => {
      console.error('Error al cargar el archivo de video.');
      reject('00:00:00');
    };
  });
}



  async contarHojasArchivo(archivo: File): Promise<number> {
    const extension = archivo.name.split('.').pop()?.toLowerCase() || '';

    try {
      switch (extension) {
        case 'pdf':
          return await this.contarHojasPDF(archivo);

        case 'xls':
        case 'xlsx':
          return this.contarHojasExcel(archivo);

        case 'txt':
          return await this.contarHojasTXT(archivo);

        default:
          return 0; // Valor predeterminado
      }
    } catch (error) {
      console.error('Error al contar hojas:', error);
      return 0;
    }
  }

  // Contar hojas en PDF
  async contarHojasPDF(archivo: File): Promise<number> {
    const arrayBuffer = await archivo.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  }

  // Contar hojas en Excel
  contarHojasExcel(archivo: File): Promise<number> {
    const reader = new FileReader();

    return new Promise<number>((resolve) => {
      reader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames.length);
      };
      reader.readAsArrayBuffer(archivo);
    });
  }



  // Contar hojas en TXT
  async contarHojasTXT(archivo: File): Promise<number> {
    const reader = new FileReader();

    return new Promise<number>((resolve) => {
      reader.onload = (event: any) => {
        const texto = event.target.result;
        const numeroLineas = texto.split('\n').length;
        const numeroHojas = Math.ceil(numeroLineas / 50); // Suposición de 50 líneas por hoja
        resolve(numeroHojas || 1);
      };
      reader.readAsText(archivo);
    });
  }

cancelar(){
  this.dialogRef.close();
}

onSaveClick(){
  this.archivoForm.markAllAsTouched()

  if (this.tieneDocumentosSinSeleccionar()) {
    this.archivoForm.setErrors({ documentosSinFirmar: true });
    return;
  }

  if(this.archivoForm.valid){
    console.log(this.archivosProcessados,'archivos a enviar');

    // this.dialogRef.close(this.archivoForm.getRawValue());
    this.dialogRef.close(this.archivosProcessados)
  }
}
}
