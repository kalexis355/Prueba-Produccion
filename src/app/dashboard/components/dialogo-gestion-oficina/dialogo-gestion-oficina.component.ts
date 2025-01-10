import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { GestionOficinasService } from '../../services/gestionOficinas.service';
import { ActualizarOficinas, Oficinas } from '../../../login/interfaces/oficina.interface';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-dialogo-gestion-oficina',
  templateUrl: './dialogo-gestion-oficina.component.html',
  styleUrl: './dialogo-gestion-oficina.component.css'
})
export class DialogoGestionOficinaComponent  implements OnInit {

  public oficinaService = inject(GestionOficinasService)

  public oficinasCreadas:Oficinas[]=[]

public oficinaSeleccionada!:Oficinas

@ViewChild('tabGroup') tabGroup!: MatTabGroup;


  ngOnInit(): void {
    this.cargarOficinas();
    this.oficinaService.oficinas$.subscribe(oficinas=>{
      this.oficinasCreadas = oficinas
    })
  }


  cargarOficinas():void{
    this.oficinaService.obtenerOficinas()
    .subscribe(oficinas => {
      this.oficinasCreadas = oficinas
      console.log(this.oficinasCreadas);

    })
  }

  borrarOficina(id:number,nombre:string){
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result)=>{
      if(result.isConfirmed){
        this.oficinaService.borrarOficina(id)
        .subscribe(()=>{
          Swal.fire('Exito',`Oficina ${nombre} borrada con exito`,'success')
          this.cargarOficinas();
        })
      }
    })

  }

  editarOfi(oficina:Oficinas){
    this.oficinaSeleccionada = oficina;      // Asigna la oficina seleccionada
    this.tabGroup.selectedIndex = 1;
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

  actualizarEstado(oficina:Oficinas){
    const bodyActualizar:ActualizarOficinas={
      Cod: oficina.Cod,
      Nombre: oficina.Nombre,
      Estado: !oficina.Estado,
      Entidad: oficina.Entidad,
      CodigoSerie: oficina.CodigoSerie,
      Icono: this.convertirBase64ABits(oficina.Icono!)
    }

    this.oficinaService.ActualizarEstadoDependencia(bodyActualizar)
    .subscribe(()=>{
      Swal.fire('Exito',`Estado cambiado con exito`,'success')
      this.oficinaService.actualizarOficinas()
    })
  }
}
