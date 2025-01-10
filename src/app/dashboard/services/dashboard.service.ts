import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Archivo, Carpeta } from '../interfaces/carpeta.interface';
import { AuthService } from '../../login/services/auth.service';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { blob } from 'stream/consumers';
import { CheckBoxService } from './checkBox.service';
import { Auth2Service } from '../../login/services/auth2.service';

@Injectable({providedIn: 'root'})
export class DashboardService  {

  private authService = inject(AuthService);
  private authService2 = inject(Auth2Service);

  private checkService = inject(CheckBoxService)
  public dataCarpetas = signal<Carpeta[]>([]);
  carpetasNuevas: { id: string, nombre: string }[] = [];
  // user = this.authService.currentUSer()
  user = this.authService2.currentUSer2()


  public nombreIgual: boolean = false
  public carpetaPadre?:Carpeta


  constructor(){
    // this.iniciarCarpetas()
  }


  iniciarCarpetas() {
    // const userRoles = this.authService.getUserRoles();
    // this.authService.setPermissionsByRoles(userRoles);

    if(this.authService2.currentUSer2()){
      console.log('usuario para las carpetas');

      console.log(this.authService2.currentUSer2(),);

      const newCarpetas: Carpeta[] =[
      {
            id:'1',
            nombre: 'Documento',
            fechaCreacion: new Date('01-11-2001'),
            creador: this.authService2.currentUSer2()!.Nombres,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos: [
              {
                id:'1.1',
                nombre: 'Contratos',
                fechaCreacion: new Date(),
                creador: this.authService2.currentUSer2()!.Nombres,
                tipo: 'carpeta',
                padreId:'1',
                permisos:this.authService.permissions,
                hijos: [
                  {
                    id:'1.1.1',
                    nombre: 'Contraticos',
                    fechaCreacion: new Date(),
                    creador: this.authService2.currentUSer2()!.Nombres,

                    tipo: 'carpeta',
                    padreId:'1.1',
                    permisos:this.authService.permissions,
                    hijos: []
                  },

                ]
              },

              {
                id:'archi',
                nombre: 'Facturas',
                fechaCreacion: new Date(),
                creador: this.authService2.currentUSer2()!.Nombres,

                tipo: 'archivo',
                extension:'pdf',
                padreId:'1',
                url:'kjk',
                permisos: this.authService.permissions
              },
              {
                id:'1.1.2',
                nombre: 'fechas',
                fechaCreacion: new Date(),
                creador: this.authService2.currentUSer2()!.Nombres,

                tipo: 'carpeta',
                padreId: '1',
                permisos:this.authService.permissions,
                hijos: []
              },
            ]
          },

          {
            id:'2',
            nombre: 'Fotos',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService2.currentUSer2()!.Nombres,

            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'3',
            nombre: 'Imagenes',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService2.currentUSer2()!.Nombres,

            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'4',
            nombre: 'Escritorio',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService2.currentUSer2()!.Nombres,

            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'5',
            nombre: 'Juegos',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService2.currentUSer2()!.Nombres,

            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'6',
            nombre: 'Mongo',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService2.currentUSer2()!.Nombres,

            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'7',
            nombre: 'Whatsapp',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService2.currentUSer2()!.Nombres,

            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
        ]
          // Actualiza la señal con el nuevo valor
          this.dataCarpetas.update(() => [... newCarpetas]);
    }

  }


  addNuevaCarpeta(carpeta:any){
    this.carpetasNuevas.push(carpeta)
  }

  get obtenerCarpetas():any{
    return this.carpetasNuevas
  }

  addCarpeta(carpeta: Carpeta): void {
    this.dataCarpetas.update((carpetas) => [...carpetas, carpeta]);
    console.log(this.dataCarpetas());

  }


  borrarCarpetas(idsSeleccionados:string[]): number {
    // Obtener los IDs de las carpetas seleccionadas
    // const idsSeleccionados = this.carpetasSeleccionadas().map(carpeta => carpeta.id);
    const ids = idsSeleccionados;

    // Función recursiva para eliminar carpetas seleccionadas, incluso en subcarpetas
    const eliminarCarpetas = (carpetas:Carpeta[]) => {
      return carpetas.filter(carpeta => {
        // Si la carpeta está seleccionada para eliminar, no la incluimos
        if (idsSeleccionados.includes(carpeta.id!)) {
          return false;
        }

        // Si la carpeta tiene subcarpetas, aplicamos la misma lógica de filtro a sus hijos
        if (carpeta.hijos && carpeta.hijos.length > 0) {
          carpeta.hijos = eliminarCarpetas(carpeta.hijos as Carpeta[]);
        }

        return true;
      });
    };

    // Actualizar `dataCarpetas` aplicando la función de eliminación recursiva
    this.dataCarpetas.update(carpetas => eliminarCarpetas(carpetas));


    // Limpiar la señal `carpetasSeleccionadas` después de eliminar
    this.checkService.carpetasSeleccionadas.set([]);

    return ids.length;
  }

  borrarArchivos(idsSeleccionados: string[]): number {
    // Función recursiva para eliminar archivos seleccionados dentro de las carpetas y subcarpetas
    const eliminarArchivos = (carpetas: Carpeta[]): Carpeta[] => {
      return carpetas.map(carpeta => {
        if (carpeta.hijos && carpeta.hijos.length > 0) {
          // Filtramos los hijos para eliminar los archivos seleccionados
          carpeta.hijos = carpeta.hijos.filter(hijo => {
            // Si es un archivo, verificamos si su ID está en los seleccionados
            if (hijo.tipo === 'archivo') {  // Es un archivo
              return !idsSeleccionados.includes(hijo.id!);
            }

            // Si es una carpeta, aplicamos la recursividad
            if (hijo.tipo === 'carpeta') {
              hijo.hijos = eliminarArchivos(hijo.hijos as Carpeta[]);  // Aplicamos recursividad para subcarpetas
            }

            return true;  // Mantener carpetas en el resultado
          });
        }
        return carpeta;
      });
    };

    // Actualizar `dataCarpetas` aplicando la función de eliminación recursiva para archivos
    this.dataCarpetas.update(carpetas => eliminarArchivos(carpetas));

    // Limpiar la señal `archivosSeleccionados` después de eliminar
    this.checkService.archivosSeleccionados.set([]);

    return idsSeleccionados.length;
  }


//Obtener las carpetas
  getCarpetas(): Carpeta[] {
    return this.dataCarpetas();
  }

//Obtener la carpeta por Id
  getCarpetaId(id:number):Carpeta | undefined{
    return this.carpetaId(this.dataCarpetas(),id)
  }

//Recorrer la jerquia de las carpetas para encontrar la carpeta segun su id
  carpetaId(carpetas: Carpeta[], id:number):Carpeta | undefined{
    for (const carpeta of carpetas) {
      if(carpeta.id2 ===id){
        return carpeta
      }
      if(carpeta.hijos){
        const encontrar = this.carpetaId(carpeta.hijos as Carpeta[],id);
        if(encontrar){
          return encontrar
        }
      }
    }
    return undefined;
  }

//Obtern una carpeta segun su nombre en una jerarquia de carpetas
  getCarpetaPorNombre(nombre: string, carpetas: Carpeta[] = this.getCarpetas()): Carpeta | undefined {
    for (const carpeta of carpetas) {
      if (carpeta.nombre === nombre) {
        return carpeta;
      }
      if (carpeta.hijos && carpeta.hijos.length > 0) {
        const foundCarpeta = this.getCarpetaPorNombre(nombre, carpeta.hijos as Carpeta[]);
        if (foundCarpeta) {
          return foundCarpeta;
        }
      }
    }
    return undefined;
  }


//encontrar una carpeta
  findCarpeta(id: string, carpeta: Carpeta): Carpeta|undefined {
    if (carpeta.id === id) {
      return carpeta;
    }
    if (carpeta.hijos) {
      for (let hijo of carpeta.hijos) {
        const resultado = this.findCarpeta(id, hijo as Carpeta);
        if (resultado) {
          return resultado;
        }
      }
    }
    return undefined;
  }

//Cambiar nombre a una carpeta buscandola jerquicamente
  cambiarNombreCarpeta(id: string, nombre: string, ) {
    this.nombreIgual = false;

    // Función recursiva para buscar y cambiar el nombre de la carpeta en cualquier nivel
    const cambiarNombreRecursivo = (carpetas: Carpeta[]) => {
        for (const carpeta of carpetas) {
            // Si encontramos una carpeta con el mismo nombre, no permitimos cambiar
            if (carpeta.nombre === nombre) {
                this.nombreIgual = true;

                return true; // Salimos de la función si se encuentra un nombre igual
            }
        }
        // Si no hay nombres iguales, procedemos a cambiar el nombre
        for (const carpeta of carpetas) {
            if (carpeta.id === id) {
                carpeta.nombre = nombre;
                return true; // Salimos después de cambiar el nombre
            }

            // Si la carpeta tiene hijos, hacemos la búsqueda recursiva en las subcarpetas
            if (carpeta.hijos && carpeta.hijos.length > 0) {
                if (cambiarNombreRecursivo(carpeta.hijos as Carpeta[])) {
                    return true; // Si ya encontramos la carpeta y cambiamos el nombre en los hijos, salimos
                }
            }
        }

        return false; // Si no se encuentra la carpeta en ningún nivel
    };
    //se llama la funcion cuando se entra al metodo
    cambiarNombreRecursivo(this.dataCarpetas());
}

//Cambiar nombre a un archivo buscando primero la carpeta padre del archivo
  cambiarNombreArchivo(idPadre:string,idArchivo:string,nombre:string){
    this.nombreIgual = false;

    // Buscar la carpeta por idCarpeta
    const carpeta = this.dataCarpetas().find(carpeta => carpeta.id === idPadre);

    if (!carpeta) {
        console.log('La carpeta no existe.');
        return; // Salimos si no encontramos la carpeta
    }

    // Verificar si ya existe un archivo o carpeta con el mismo nombre dentro de la carpeta
    for (const hijo of carpeta.hijos || []) {
        if (hijo.nombre === nombre) {
            this.nombreIgual = true;
            console.log('El nombre del archivo ya existe en la carpeta.');
            return; // Salimos si hay un nombre igual
        }
    }

    // Si no hay un nombre igual, buscar el archivo dentro de la carpeta por id
    for (const hijo of carpeta.hijos || []) {
        if (hijo.id === idArchivo && hijo.tipo === 'archivo') {
            hijo.nombre = nombre;
            console.log('Nombre del archivo cambiado con éxito.');
            return; // Salimos después de cambiar el nombre
        }
    }

    // Si no encontramos el archivo
    console.log('El archivo no existe en la carpeta.');
  }


  //Descargar carpetas

descargarCarpetasSeleccionadas() {

  const zip = new JSZip();
  const elementosSeleccionados = this.checkService.archivosTotal(); // Accedemos al contenido de la señal `archivosTotal`

  elementosSeleccionados.forEach(elemento => {
    if (elemento.tipo === 'carpeta') {
      // Si el elemento es una carpeta, lo agregamos al ZIP
      this.agregarCarpetaAlZip(zip, elemento as Carpeta);
    } else if (elemento.tipo === 'archivo') {
      // Si el elemento es un archivo, lo agregamos directamente al ZIP
      console.log('Agregando archivo:', elemento.nombre);
      zip.file(elemento.nombre, (elemento as Archivo).archivoBlob!, { binary: true });
    }
  });

  // Generar el ZIP y descargarlo
  zip.generateAsync({ type: 'blob' }).then((contenidoZip) => {
    saveAs(contenidoZip, 'archivos_y_carpetas.zip');
  });

  }



private agregarCarpetaAlZip(zip: JSZip, carpeta: Carpeta, rutaActual: string = '') {

    const nuevaRuta = `${rutaActual}/${carpeta.nombre}`;
    console.log(`Creando carpeta en: ${nuevaRuta}`);
    const carpetaZip = zip.folder(nuevaRuta);

    if (carpeta.hijos  && carpeta.hijos.length > 0) {

      carpeta.hijos.forEach(hijo => {
        if(hijo.tipo === 'carpeta'){
          this.agregarCarpetaAlZip(zip, hijo as Carpeta, nuevaRuta);
        }

        if(hijo.tipo === 'archivo'){
          console.log(hijo.nombre);
          console.log(hijo.url);
          carpetaZip!.file(hijo.nombre,hijo.archivoBlob!,{binary: true})
        }
      });
    }


  }


}
