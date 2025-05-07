import { Component, ElementRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { CarpetasPadre, CarpetaBase, ContenidoCarpetaResponse } from '../../interfaces/carpeta.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GestionCarpetasService } from '../../services/gestionCarpetas.service';
import { IndexDbService } from '../../services/indexdb.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4

    // Define las columnas del encabezado
    const head = [[
      'ID', 'Nombre Documento', 'Tipología Documental', 'Fecha Declaración',
      'Fecha Incorporación', 'Valor Huella', 'Función Resumen',
      'Orden Documento', 'Página Inicio', 'Página Fin',
      'Formato', 'Tamaño', 'Origen'
    ]];

    // Cuerpo de la tabla
    const body = this.contenidoCarpeta.contenido.map((contenido, i) => ([
      `11223344556677889${contenido.Cod}`,
      contenido.Nombre,
      'Contrato',
      '25-02-2025',
      '01-03-2025',
      'TLFRNZPLI6389',
      'MD5',
      i + 1,
      '1',
      '4',
      'PDF/A',
      '50 KB',
      'Digital'
    ]));

    autoTable(doc, {
      head,
      body,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [22, 160, 133], // Verde-azulado
        textColor: 255
      },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.text('Índice Electrónico de Documentos', 14, 10);
      }
    });

    doc.save('indice-electronico.pdf');
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
