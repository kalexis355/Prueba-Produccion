import { Component, inject, Inject, OnInit } from '@angular/core';
import { CarpetasPadre, CarpetaBase, ContenidoCarpetaResponse } from '../../interfaces/carpeta.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';

@Component({
  selector: 'app-indice-electronico',
  templateUrl: './indice-electronico.component.html',
  styleUrl: './indice-electronico.component.scss'
})
export class IndiceElectronicoComponent implements OnInit{

  private carpetaService = inject(GestionCarpetasService)

  carpetaActual!: CarpetasPadre | CarpetaBase;
  contenidoCarpeta!: ContenidoCarpetaResponse;

  constructor(
    public dialogRef: MatDialogRef<IndiceElectronicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CarpetasPadre | CarpetaBase
  ) {
    // Recibimos los datos de la carpeta aquí
    this.carpetaActual = data;
  }


  ngOnInit(): void {
    console.log('Carpeta recibida en el componente:', this.carpetaActual);
    this.cargarContenidoCarpeta()
  }

  cargarContenidoCarpeta(){
    this.carpetaService.obtenerContenidoCarpeta(this.carpetaActual.Cod)
    .subscribe({
      next: (respuesta)=>{
        this.contenidoCarpeta = respuesta;
        console.log('contenido de carpeta obtenido ', this.contenidoCarpeta, this.contenidoCarpeta.contenido.length);

      },
      error: (error)=>{
        console.error('Error al cargar contenido de carpeta:', error);
      }
    })
  }






}
