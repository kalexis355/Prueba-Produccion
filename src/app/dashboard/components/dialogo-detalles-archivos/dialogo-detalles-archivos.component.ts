import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArchivoDatos } from '../../interfaces/archivos.interface';
import { Archivo } from '../../interfaces/carpeta.interface';

@Component({
  selector: 'app-dialogo-detalles-archivos',
  templateUrl: './dialogo-detalles-archivos.component.html',
  styleUrl: './dialogo-detalles-archivos.component.css'
})
export class DialogoDetallesArchivosComponent implements OnInit {

  public archivo:ArchivoDatos={
    nombre: '',
    formato: '',
    tamanio: '',
    numeroHojas: 0,
    duracion: '',
    esDocumento: false,
    esImagen: false,
    esComprimido: false,
    firmar: '0',
    tipoArchivo: 0
  }

  constructor(
        public dialogRef: MatDialogRef<DialogoDetallesArchivosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
  ){


  }
  ngOnInit(): void {
    this.archivo = this.data.archivo
    console.log(this.archivo);

  }
}
