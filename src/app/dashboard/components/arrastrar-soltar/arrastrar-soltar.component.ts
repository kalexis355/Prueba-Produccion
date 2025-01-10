import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../../services/toast.service';
import { DashboardService } from '../../services/dashboard.service';
import { Archivo, Carpeta } from '../../interfaces/carpeta.interface';
import { v4 as uuidv4 } from 'uuid';
import { retry } from 'rxjs';

import Swal from 'sweetalert2';

interface ArchivoSubido {
  nombre: string;
}
@Component({
  selector: 'app-arrastrar-soltar',
  templateUrl: './arrastrar-soltar.component.html',
  styleUrl: './arrastrar-soltar.component.css',
})
export class ArrastrarSoltarComponent  {


  @Input()
  public deshabilitado?: boolean;

  @Input()
  public hijo?: string;
  //propiedad para saber si esta activa o desactiva el aera arrastrable
  arrastre = false;
  carpetaAgregada = false;
  //arreglo para los archivos subidos y gestionar su carga
  archivosSubidos: ArchivoSubido[] = [];

  @Input()
  carpetaIdFocu: string = '';

  private role: string | null = localStorage.getItem('role');

  lastFocusedCarpetaId: string | undefined = undefined;

  //injecciones
  public snackBar = inject(MatSnackBar);

  public toast = inject(ToastService);
  public dashService = inject(DashboardService);




  //metodo para activar el area cuando esta el objeto sobre ella
  onDragOver(event: DragEvent) {
    // console.log(this.deshabilitado);

    event.preventDefault();
    event.stopPropagation();

    this.arrastre = true;
  }

  //metodo para desactivar el area cuando esta el objeto fuera de ella
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastre = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation(); // Detener la propagación del evento

    this.arrastre = false;

    // console.log('Valor de rol en onDrop:', this.role);



      const items = event.dataTransfer!.items;
      this.procesamientoItems(items);

  }

  procesamientoItems(items: DataTransferItemList) {
    const rol = localStorage.getItem('role')
    console.log(rol,'procesamiento');

    switch (rol) {
      case 'Administrador':
        this.toast.showToast(`Permitido`, 'Exito', 'success');
      break;
      case 'Sa':
        this.toast.showToast(`Permitido`, 'Exito', 'success');

        break;
      case 'Encargado':
        this.toast.showToast(`Permitido`, 'Exito', 'success');

        break;

      default:
        this.toast.showToast(`No Puede crear o subir carpetas`, 'Error', 'error');

    }
  }

  //metodo para procesar las carpetas
  processItems(items: DataTransferItemList, parentFolderId?: string) {
    //ciclo para recorrer los items arrastrados
    console.log('processItems called with parentFolderId:', parentFolderId);

    if (!this.deshabilitado && this.hijo === 'hijo1') {
      Swal.fire('Error', 'No tiene Permisos', 'error');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      console.log(i, 'contador');

      //se crea un item por si son varios para trabajar en cada ciclo con el
      const item = items[i];
      //se crea una entrada para determinar si es una carpeta o archivo
      const entry = item.webkitGetAsEntry();
      if (!entry) return;

      if (parentFolderId) {
        console.log(parentFolderId, 'entro');

        if (entry.isDirectory) {
          //si lo es se llama al metodo que procesa carpetas pasando la entrada y el id del padre
          this.handleDirectory(
            entry as FileSystemDirectoryEntry,
            parentFolderId
          );
        } else {
          //si no se llama al metodo que procesa archivos

          this.handleFile(entry as FileSystemFileEntry, parentFolderId);
        }
      } else {
        if (entry.isDirectory) {
          this.handleDirectory(
            entry as FileSystemDirectoryEntry,
            parentFolderId
          );
        } else {
          console.log('hola2');
          console.log(parentFolderId, 'hola2');

          this.toast.showToast(`No se permiten archivos`, 'Error', 'error');
        }
      }

      console.log(parentFolderId, 'for');
    }
  }

  //metodo que procesa el contenido de la carpeta pasando la carpeta y su id
  handleDirectory(
    directory: FileSystemDirectoryEntry,
    parentFolderId?: string
  ) {
    console.log('handleDirectory called with parentFolderId:', parentFolderId);
    //se crea la propiedad para leer lo que hay dentro de la carpeta
    const reader = directory.createReader();
    //se lee las entradas pueden ser subcarpetas o archivos y se hace una deserialzicion
    //de un arreglo de entradas
    reader.readEntries((entries: FileSystemEntry[]) => {
      //se prosigue a crear la carpeta
      const carpeta: Carpeta = {
        id: uuidv4(),
        nombre: directory.name,
        fechaCreacion: new Date(),
        creador: 'yo',
        padreId: parentFolderId,
        tipo: 'carpeta',
        hijos: [],
        permisos: [
          'read',
          'write',
          'delete',
          'share',
          'rename',
          'manage_permissions',
          'upload',
          'download',
          'view_audit_logs',
          'lock',
        ],
      };
      //si hay un id presente quiere decir que es un hijo de la carpeta padre
      if (parentFolderId) {
        //se busca esa carpeta
        const parentFolder = this.dashService.getCarpetaId(+parentFolderId);
        //si esa carpeta existe
        if (parentFolder) {
          //esa nueva carpeta se agrega como hija de la presente
          parentFolder.hijos?.push(carpeta);
          this.toast.showToast(
            `Carpeta ${carpeta.nombre} subida a ${parentFolder.nombre}`,
            'Éxito',
            'success'
          );
        }
        //si no esta presente el id de la carpeta
      } else {
        //se agrega en la raiz del proyecto
        if (this.dashService.getCarpetaPorNombre(carpeta.nombre)) {
          this.toast.showToast(
            `Carpeta ${carpeta.nombre} ya existe`,
            'Error',
            'error'
          );
          this.carpetaAgregada = false;
        } else {
          this.dashService.addCarpeta(carpeta);
          this.carpetaAgregada = true;
        }
      }

      if (this.carpetaAgregada) {
        //se trabaja con los hijos de la carpeta padre
        for (const entry of entries) {
          //si es una carpeta
          if (entry.isDirectory) {
            //el metodo se llama a si mismo enviando esta vez el id para que la subcarpeta se guarde como un hijo
            this.handleDirectory(entry as FileSystemDirectoryEntry, carpeta.id);
          } else {
            //si no se llama al metodo que procesa los archivos enviando su entrada y el id del padre
            this.handleFile(entry as FileSystemFileEntry, carpeta.id);
          }
        }
        //por ultimo se muestra el toast de que se subio con exito la carpeta
        this.toast.showToast(
          `Carpeta ${carpeta.nombre} subida`,
          'Éxito',
          'success'
        );
      }
    });
  }

  //metodo para procesar los archivos se pasa el archivo y el id del padre si es que lo tiene
  handleFile(file: FileSystemFileEntry, parentFolderId?: string) {
    console.log('handleFile called with parentFolderId:', parentFolderId);

    //se llama a la funcion file para convertir la entrada en un archivo y poder tener mas info
    file.file((file: File) => {
      //se crea el archivo con sus datos correspondientes
      const archivo: Archivo = {
        id: uuidv4(),
        nombre: file.name,
        fechaCreacion: new Date(),
        creador: 'yo',
        tipo: 'archivo',
        extension: file.name.split('.').pop(),
        url: URL.createObjectURL(file),
        archivoBlob: file,
        permisos: [
          'read',
          'write',
          'delete',
          'share',
          'rename',
          'manage_permissions',
          'upload',
          'download',
          'view_audit_logs',
          'lock',
        ],
      };

      //se verifica si hay un id padre

      if (parentFolderId) {
        const parentFolder = this.dashService.getCarpetaId(+parentFolderId);
        if (parentFolder) parentFolder.hijos?.push(archivo);
        this.archivosSubidos.push(archivo);
        console.log(this.archivosSubidos);
        this.toast.showToast(`Archivo ${file.name} subido`, 'Éxito', 'success');
      }
    });
  }
}
