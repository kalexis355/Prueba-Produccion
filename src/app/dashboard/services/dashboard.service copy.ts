import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Archivo, Carpeta } from '../interfaces/carpeta.interface';
import { AuthService } from '../../login/services/auth.service';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { blob } from 'stream/consumers';

@Injectable({providedIn: 'root'})
export class DashboardService  {

  private authService = inject(AuthService);
  public dataCarpetas = signal<Carpeta[]>([]);

  user = this.authService.currentUSer()

  carpetasSeleccionadasDialogo:Carpeta[] = []

  public nombreIgual: boolean = false
  public checkboxStates = signal<{ [id: string]: boolean }>({});


  public carpetaPadre?:Carpeta
  public carpetasSeleccionadas = signal<Carpeta[]>([])

  public archivosSeleccionados = signal<Archivo[]>([])

  public archivosTotal = signal<(Archivo|Carpeta)[]>([])

  public guardarRuta = signal<Carpeta[]>([])


  constructor(){
    this.iniciarCarpetas()
  }


  iniciarCarpetas() {
    const userRoles = this.authService.getUserRoles();
    this.authService.setPermissionsByRoles(userRoles);

    if(this.authService.currentUSer()){
      console.log('usuario para las carpetas');

      console.log(this.authService.currentUSer(),);

      const newCarpetas: Carpeta[] =[
      {
            id:'1',
            nombre: 'Documento',
            fechaCreacion: new Date('01-11-2001'),
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos: [
              {
                id:'1.1',
                nombre: 'Contratos',
                fechaCreacion: new Date(),
                creador: this.authService.currentUSer()!.name,
                tipo: 'carpeta',
                padreId:'1',
                permisos:this.authService.permissions,
                hijos: [
                  {
                    id:'1.1.1',
                    nombre: 'Contraticos',
                    fechaCreacion: new Date(),
                    creador: this.authService.currentUSer()!.name,
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
                creador: this.authService.currentUSer()!.name,
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
                creador: this.authService.currentUSer()!.name,
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
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'3',
            nombre: 'Imagenes',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'4',
            nombre: 'Escritorio',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'5',
            nombre: 'Juegos',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'6',
            nombre: 'Mongo',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
          {
            id:'7',
            nombre: 'Whatsapp',
            fechaCreacion: new Date('01-11-2010'),
            creador: this.authService.currentUSer()!.name,
            tipo: 'carpeta',
            permisos:this.authService.permissions,
            hijos:[]
          },
        ]
          // Actualiza la señal con el nuevo valor
          this.dataCarpetas.update(() => [... newCarpetas]);
    }

  }

  // updateDataCarpetas() {
  //   console.log('Actualizando datos de carpetas');
  //   this.iniciarCarpetas();
  // }





  tienePermiso<T extends { permisos?: string[] }>(elementos: T[], permiso: string): boolean {
    // Recorre todos los elementos (carpetas o archivos) y verifica si todos tienen el permiso requerido
    for (const elemento of elementos) {
      // Si alguno no tiene el permiso, retorna false inmediatamente
      if (!elemento.permisos?.includes(permiso)) {
        return false;
      }
    }
    // Si todos los elementos tienen el permiso, retorna true
    return true;
  }

  permisoArrastrar(carpeta:Carpeta,permiso:string):boolean{
    if (carpeta.permisos?.includes(permiso)) {
      return true; // Si encuentra el permiso 'delete', retorna true inmediatamente
    }
    return false
  }

  guardarRutaPArcial(carpeta:Carpeta | undefined){
    this.guardarRuta.update(carpetica => {

      if (!carpetica.includes(carpeta as Carpeta)) {
        carpetica.push(carpeta as Carpeta);
      }
      return carpetica;
    });

    console.log(this.guardarRuta().length);

  }
  eliminarUltimaCarpeta() {
    this.guardarRuta.update(carpetica => {
      if(carpetica.length<0){
        console.log('no se puede');

      }
      console.log('si se pudo');

      carpetica.pop(); // Elimina la última carpeta de la ruta
      return carpetica;
    });

    console.log(this.guardarRuta());
  }

  recortarRutaHasta(id: string) {
    this.guardarRuta.update(carpetica => {


      const indice = carpetica.findIndex(carpeta => {
        return carpeta.id === id;
      });

      if (indice !== -1) {
        if (indice === 0) {
          console.log('Se ha hecho clic en la primera carpeta, eliminando todas las posteriores.');
          return carpetica.slice(0, 1);
        }

        if (indice < carpetica.length - 1) {
          console.log('Recortando la ruta hasta la carpeta seleccionada.');
          return carpetica.slice(0, indice + 1);
        }

        if (indice === carpetica.length - 1) {
          console.log('No se puede recortar, es la última carpeta.');
          return carpetica;
        }
      }

      return carpetica; // No hacer cambios si el ID no se encuentra
    });

  }


  // updateCheckboxState(carpetas:(Carpeta[]), id: string, isChecked: boolean): void {
  //   this.checkboxStates.update(states => ({
  //     ...states,
  //     [id]: isChecked
  //   }));

  //   if(isChecked){
  //   const carpetaSeleccion = carpetas.filter(carpetaSeleccionada => this.checkboxStates()[carpetaSeleccionada.id]);
  //     this.carpetasSeleccionadas.update(()=>carpetaSeleccion)

  //   }else{

  //     this.carpetasSeleccionadas.update(current => current.filter(c => c.id !== id));
  //     // console.log(this.carpetasSeleccionadas().length,'hola3',this.carpetasSeleccionadas());

  //   }

  // }

  updateCheckboxState(elementos: (Carpeta)[], id: string, isChecked: boolean): void {
    // Actualizar el estado del checkbox
    this.checkboxStates.update(states => ({
      ...states,
      [id]: isChecked
    }));

    if (isChecked) {
      // Filtrar carpetas seleccionadas
      const carpetasSeleccionadas = elementos.filter((elementoSeleccionado): elementoSeleccionado is Carpeta =>
        this.checkboxStates()[elementoSeleccionado.id!] && elementoSeleccionado.tipo === 'carpeta'
      );

      // Actualizar las carpetas seleccionadas
      this.carpetasSeleccionadas.update(() => carpetasSeleccionadas);
    } else {
      // Remover carpeta deseleccionada
      this.carpetasSeleccionadas.update(current =>
        current.filter(c => c.id !== id)
      );
    }
  }

  updateCheckboxArchivo(archivos:Archivo[], id:string, isChecked:boolean){
    this.checkboxStates.update(states => ({
      ...states,
      [id]: isChecked
    }));

    console.log(this.checkboxStates() , 'check');
    if (isChecked) {
      // Filtrar archivos seleccionados
      const archivosSeleccionados = archivos.filter((elementoSeleccionado): elementoSeleccionado is Archivo =>
        this.checkboxStates()[elementoSeleccionado.id!] && elementoSeleccionado.tipo === 'archivo'
      );

      // Actualizar los archivos seleccionados
      this.archivosSeleccionados.update(() => archivosSeleccionados);
    } else {
      // Remover archivo deseleccionado
      this.archivosSeleccionados.update(current =>
        current.filter(a => a.id !== id)
      );
    }

    console.log(this.archivosSeleccionados(), 'archivosSeleccionados');


  }

  // Método para obtener el estado de un checkbox
  isChecked(id: string): boolean {

    return this.checkboxStates()[id] || false;
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
        if (idsSeleccionados.includes(carpeta.id)) {
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
    this.carpetasSeleccionadas.set([]);

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
    this.archivosSeleccionados.set([]);

    return idsSeleccionados.length;
  }



  getCarpetas(): Carpeta[] {

    return this.dataCarpetas();
  }

  getCarpetaId(id:string):Carpeta | undefined{
    return this.carpetaId(this.dataCarpetas(),id)
  }

  carpetaId(carpetas: Carpeta[], id:string):Carpeta | undefined{
    for (const carpeta of carpetas) {
      if(carpeta.id ===id){
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

  // cambiarNombreCarpeta(id: string, nombre: string) {
  //   this.nombreIgual = false;

  //   for (const carpeta of this.dataCarpetas()) {
  //     if (carpeta.nombre === nombre) {
  //       this.nombreIgual = true;
  //       console.log('El nombre ya existe.');
  //       return; // Salimos de la función si se encuentra un nombre igual
  //     }
  //   }

  //   // Si llegamos aquí, significa que no hay un nombre igual
  //   for (const carpeta of this.dataCarpetas()) {
  //     if (carpeta.id === id) {
  //       carpeta.nombre = nombre;
  //       console.log('Nombre cambiado con éxito.');
  //       break; // Salimos del bucle después de cambiar el nombre
  //     }
  //   }
  // }
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
    // const zip = new JSZip();
    // const carpetasSeleccionadas = this.carpetasSeleccionadas();


    // carpetasSeleccionadas.forEach(elemento => {
    //   console.log(elemento,'hola');
    //   if(elemento.tipo ==='carpeta'){
    //     console.log('carpeta');
    //     this.agregarCarpetaAlZip(zip,elemento)
    //   }
    // });
    // console.log('hola yo');
    // zip.generateAsync({ type: 'blob' }).then((contenidoZip) => {
    //   saveAs(contenidoZip, 'carpetas.zip');
    // });
    const zip = new JSZip();
  const elementosSeleccionados = this.archivosTotal(); // Accedemos al contenido de la señal `archivosTotal`

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
