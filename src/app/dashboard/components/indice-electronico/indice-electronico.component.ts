import { Component, ElementRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { CarpetasPadre, CarpetaBase, ContenidoCarpetaResponse } from '../../interfaces/carpeta.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { IndexDbService } from '../../services/indexdb.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-indice-electronico',
  templateUrl: './indice-electronico.component.html',
  styleUrl: './indice-electronico.component.scss'
})
export class IndiceElectronicoComponent implements OnInit{

  private carpetaService = inject(GestionCarpetasService)
  private indexService = inject(IndexDbService)

  carpetaActual!: CarpetasPadre | CarpetaBase;
  contenidoCarpeta!: ContenidoCarpetaResponse;

  @ViewChild('tablaPDF', { static: false }) tablaPDF!: ElementRef;

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
        // console.error('Error al cargar contenido de carpeta:', error);
        this.indexService.obtenerContenidoCarpetaDesdeIndexDB(this.carpetaActual.Cod)
        .then(resultado =>{
          console.log(resultado,'este es el resultado señores y señoras');

          this.contenidoCarpeta = {
            ...this.contenidoCarpeta, // Mantiene las propiedades existentes
            contenido: [...resultado.carpetas, ...resultado.archivos] // Combina carpetas y archivos en un solo array
          };
        })

      }
    })
  }

  descargarPdf(): void {
   // Da tiempo para asegurar que Angular renderice todo
   setTimeout(() => {
    const DATA = this.tablaPDF.nativeElement;

    html2canvas(DATA, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Apaisado
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('indice-electronico.pdf');
    }).catch(error => {
      console.error('Error al generar el PDF:', error);
    });
  }, 100); // Puede ajustarse según el tiempo de carga de datosM esté listo
  }

  descargarExcel(){
    const tabla = this.tablaPDF.nativeElement.querySelector('table') as HTMLTableElement;
    const ws = XLSX.utils.table_to_sheet(tabla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'indice-electronico.xlsx');
  }






}
