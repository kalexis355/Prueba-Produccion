import { Component, Inject, inject, OnInit } from '@angular/core';
import { GestionUsuariosService } from '../../services/gestionUsuarios.service';
import { UsuarioConsultado } from '../../../login/interfaces';
import { GestionArchivosService } from '../../services/gestionArchivos.service';
import { Documento, TipoArchivos } from '../../interfaces/archivos.interface';
import { error } from 'console';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  documento!: Documento;
  nombre:string = '';
  formato:string = '';
  esDocumento: boolean = false;
  tamanio:string='';
  numeroHojas:number=0;
  duracion:string=''
  esImagen:boolean=false
  esComprimido:boolean=false;


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
    public dialogRef: MatDialogRef<DialogoSubirArchivoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}



  ngOnInit(): void {
    this.ObtenerUsuarios();
    this.obtenerTipoArchivos();

    this.procesarDatos();
    this.inicializarFormularioArchivo();


  }

  inicializarFormularioArchivo(){
    this.archivoForm=this.fb.group({
      nombre:[{ value: this.nombre, disabled: true }],
      firmarPor:[''],
      tipoArchivo:['',Validators.required],
      formato:[{value:this.formato, disabled:true}],
      numeroHojas:[{value:this.numeroHojas, disabled:true}],
      duracion:[{value: this.duracion, disabled:true}],
      tamaño:[{value: this.tamanio, disabled:true}]
    });

    this.onfigurarValidacionFirmarPor();
  }


  onfigurarValidacionFirmarPor() {
    const firmarPorControl = this.archivoForm.get('firmarPor');

    if (this.esDocumento) {
      // Si es un documento, aplica Validators.required
      firmarPorControl?.setValidators(Validators.required);
    } else {
      // Si no es un documento, elimina las validaciones
      firmarPorControl?.clearValidators();
    }

    // Actualiza el estado del control
    firmarPorControl?.updateValueAndValidity();
  }


  async procesarDatos(){
    try {
      const archivo: File = this.data.archivo;

      // Obtener nombre y formato
      this.nombre = archivo.name.split('.').slice(0, -1).join('.');
      this.formato = archivo.name.split('.').pop() || 'Desconocido';

      // Validar si es un documento
      const formatosDocumentos = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];

      this.esDocumento = formatosDocumentos.includes(this.formato);



      this.esImagen = this.formatosImagen.includes(this.formato);

      this.esComprimido = this.formatosComprimidos.includes(this.formato);

       this.tamanio = (archivo.size / (1024 * 1024)).toFixed(2)+'MB';


       if(this.formatosVideo.includes(this.formato)){
        this.duracion = await this.obtenerDuracionVideo(archivo);
       }

       if (this.formatosAudio.includes(this.formato)) {
        this.duracion = await this.obtenerDuracionAudio(archivo);
       }


      // Esperar el número de hojas
      this.numeroHojas = await this.contarHojasArchivo(archivo);

      this.archivoForm.patchValue({
        nombre: this.nombre,
        formato: this.formato,
        numeroHojas: this.numeroHojas,
        duracion: this.duracion,
        tamaño: this.tamanio
      });
      console.log(`Archivo procesado: ${this.nombre}, Hojas: ${this.numeroHojas}`);
    } catch (error) {
      console.error('Error al procesar datos:', error);
    }

  }

  desactivarDocumento(cod: number): boolean {
    // Desactivar Documento Electrónico o Digital si es multimedia

    if (this.formatosMultimedia.includes(this.formato)) {
      return cod === 1 || cod === 2;
    }

    // Desactivar Imagen, Video o Audio si es documento
    if (this.esDocumento) {
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

  onNoClick(){
    this.dialogRef.close();

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

onSaveClick(){
  this.archivoForm.markAllAsTouched()

  if(this.archivoForm.valid){
    this.dialogRef.close(this.archivoForm.getRawValue());
  }else{

  }
}
}
