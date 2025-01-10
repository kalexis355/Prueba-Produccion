import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoContenido } from '../../interfaces/contenidoCarpeta';

@Component({
  selector: 'app-visualizador-archivos',
  templateUrl: './visualizador-archivos.component.html',
  styleUrl: './visualizador-archivos.component.css'
})
export class VisualizadorArchivosComponent implements OnInit {

  linkVideo:string='https://drive.google.com/file/d/18NjSEY7W7awFiaCzjgSDF7lJPzhkCBTE/view?usp=sharing'
  linkPdf:string='https://drive.google.com/file/d/1okAy6f1S2igd8-AOKYEEzOKcNtqJ5rVP/view?usp=sharing'
  linkWord:string='https://docs.google.com/document/d/1ZQcl8Mtq184mPxTCmiqquFqStaU2JsVf/edit?usp=sharing&ouid=102322936648925857975&rtpof=true&sd=true'
  linkPower:string='https://docs.google.com/presentation/d/1XiLa4fnnFstD1PKYJgAoS5AcK8zgfaK7/edit?usp=sharing&ouid=102322936648925857975&rtpof=true&sd=true'
  linkExcel:string='https://docs.google.com/spreadsheets/d/1Mve30t8QcO6UaF2uIcXSoqEjutxGDVEw/edit?usp=sharing&ouid=102322936648925857975&rtpof=true&sd=true'
  linkAudio:string='https://drive.google.com/file/d/1TZHOOIyclfGssp6-FI6OFheut-ad_Rsn/view?usp=sharing'
  linkGif:string='https://drive.google.com/file/d/1-f5Wn2xaYmtUEqv-QNmE1-I0tmJhVH-M/view?usp=sharing'
  linkCompri:string='https://drive.google.com/file/d/1PD3ujlK9PqsRiD5eSu3E1bc2vw1kQhGu/view?usp=sharing'
  linkSubido:string='https://drive.google.com/file/d/1dFn-ZK5_bjEb-eqcZgqUIaGfozAp1uq6/view?usp=drivesdk'

  urlSanitizada: SafeResourceUrl | undefined;
  constructor(
     public dialogRef: MatDialogRef<VisualizadorArchivosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DocumentoContenido,
        private sanitizer: DomSanitizer
  ){}


  ngOnInit(): void {

    this.procesarDatos();

  }

  procesarDatos(){
    // const fileId = this.extraerIdArchivo(this.linkVideo);
    // const fileId = this.extraerIdArchivo(this.linkPdf);
    // const fileId = this.extraerIdArchivo(this.linkWord);
    // const fileId = this.extraerIdArchivo(this.linkPower);
    // const fileId = this.extraerIdArchivo(this.linkExcel);
    // const fileId = this.extraerIdArchivo(this.linkAudio);
    // const fileId = this.extraerIdArchivo(this.linkGif);

    const fileId = this.extraerIdArchivo(this.data.Ruta);
    console.log(this.data.Ruta,'rutaaaaaa');




    const urlPrevisualizacion = `https://drive.google.com/file/d/${fileId}/preview`;

    this.urlSanitizada = this.sanitizer.bypassSecurityTrustResourceUrl(urlPrevisualizacion);
  }


  private extraerIdArchivo(url: string): string {
    const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  onNoClick(){
    this.dialogRef.close();
  }
}
