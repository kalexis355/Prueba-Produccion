import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ArchivoGenericoExpediente, CarpetaBase, CarpetaEstructura, CarpetasPadre, ContenidoCarpetaResponse } from '../interfaces/carpeta.interface';

interface MyDB extends DBSchema {
  carpetas: {
    key: number;
    value: {
      Cod: number;
      CodSerie: number;
      CodSubSerie: number;
      Estado: boolean;
      Nombre: string;
      CarpetaPadre: number;
      FechaCreacion: string;
      Delegado: number;
      TipoCarpeta: number;
      NivelVisualizacion: number;
      SerieRaiz: number;
    };
  };
  contenidoCarpetas: {
    key: string;
    value: ContenidoCarpetaResponse; // El tipo para contenido de carpetas
  };
  elementos: {
    key: string;
    value: CarpetaBase | ArchivoGenericoExpediente; // Puede ser cualquiera de los dos tipos
  };



}
@Injectable({providedIn: 'root'})
export class IndexDbService {

  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>('MiBaseDeDatos', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('carpetas')) {
          db.createObjectStore('carpetas', { keyPath: 'Cod' });
        }

        if (!db.objectStoreNames.contains('contenidoCarpetas')) {
          db.createObjectStore('contenidoCarpetas');
        }

        if (!db.objectStoreNames.contains('elementos')) {
          db.createObjectStore('elementos', { keyPath: 'Cod' });
        }
      },
    });
   }

   async guardarCarpetas(carpetas: CarpetaEstructura['estructura_documental']) {
    const db = await this.dbPromise;
    const tx = db.transaction('carpetas', 'readwrite');
    const store = tx.objectStore('carpetas');

    // Obtener todas las carpetas actuales
    const carpetasActuales = await store.getAll();
    const mapaCarpetasActuales = new Map(
      carpetasActuales.map(carpeta => [carpeta.Cod, carpeta])
    );

    // Procesar cada carpeta nueva
    for (const carpeta of carpetas) {
      const carpetaExistente = mapaCarpetasActuales.get(carpeta.Cod);

      if (!carpetaExistente) {
        // Es una carpeta nueva
        await store.add(carpeta);
        console.log(`Nueva carpeta agregada: ${carpeta.Cod}`);
      }
      else if (this.carpetaHaCambiado(carpetaExistente, carpeta)) {
        // La carpeta existe pero ha sido modificada
        await store.put(carpeta);
        console.log(`Carpeta actualizada: ${carpeta.Cod}`);
      }
    }

    // Verificar carpetas eliminadas
    const nuevosIds = new Set(carpetas.map(c => c.Cod));
    for (const carpetaActual of carpetasActuales) {
      if (!nuevosIds.has(carpetaActual.Cod)) {
        await store.delete(carpetaActual.Cod);
        console.log(`Carpeta eliminada: ${carpetaActual.Cod}`);
      }
    }

    await tx.done;
  }

  private carpetaHaCambiado(actual: any, nueva: any): boolean {
    // Compara los campos relevantes
    return actual.Estado !== nueva.Estado ||
           actual.Nombre !== nueva.Nombre ||
           actual.CarpetaPadre !== nueva.CarpetaPadre ||
           actual.Delegado !== nueva.Delegado ||
           actual.TipoCarpeta !== nueva.TipoCarpeta ||
           actual.NivelVisualizacion !== nueva.NivelVisualizacion;
  }

  // Agregar métodos individuales para operaciones CRUD
  async agregarCarpeta(carpeta: any) {
    const db = await this.dbPromise;
    return db.add('carpetas', carpeta);
  }

  async actualizarCarpeta(carpeta: any) {
    const db = await this.dbPromise;
    return db.put('carpetas', carpeta);
  }

  async eliminarCarpeta(cod: number) {
    const db = await this.dbPromise;
    return db.delete('carpetas', cod);
  }

  async obtenerCarpetas() {
    const db = await this.dbPromise;
    return db.getAll('carpetas');
  }

  // Agregar este nuevo método
async obtenerCarpetasPadre() {
  const db = await this.dbPromise;
  const carpetas = await db.getAll('carpetas');
  return carpetas.filter(carpeta => carpeta.CarpetaPadre === 0);
}

async validarCarpeta(codigoCarpeta: number): Promise<void> {
  const db = await this.dbPromise;
  const carpeta = await db.get('carpetas', codigoCarpeta);

  if (!carpeta) {
    // console.warn(`[INDEXDB] Carpeta ${codigoCarpeta} no encontrada`);
    throw new Error('Carpeta no encontrada');
  }

  // Tipos de carpeta permitidos
  const tiposPermitidos = [1, 2, 3, 4];

  console.log('', {
    tipoCarpeta: carpeta.TipoCarpeta,
    tiposPermitidos: tiposPermitidos
  });

  // Validar que el tipo de carpeta esté permitido
  if (!tiposPermitidos.includes(carpeta.TipoCarpeta)) {
    // console.warn(`[INDEXDB] Carpeta ${codigoCarpeta} tiene un tipo no permitido: ${carpeta.TipoCarpeta}`);
    throw new Error('Tipo de carpeta no permitido');
  }

  // Para carpetas de tipo 3 o 4, validar la carpeta padre
  if (carpeta.TipoCarpeta === 3 || carpeta.TipoCarpeta === 4) {
    const carpetaPadre = await db.get('carpetas', carpeta.CarpetaPadre);

    if (!carpetaPadre) {
      // console.warn(`[INDEXDB] Carpeta padre ${carpeta.CarpetaPadre} no encontrada para carpeta ${codigoCarpeta}`);
      throw new Error('Carpeta padre no encontrada');
    }

    // Validar que la carpeta padre sea de tipo 1 o 2
    if (carpetaPadre.TipoCarpeta !== 1 && carpetaPadre.TipoCarpeta !== 2) {
      // console.warn(`[INDEXDB] Carpeta padre ${carpeta.CarpetaPadre} no es una Serie o Subserie`);
      throw new Error('La carpeta padre debe ser una Serie o Subserie');
    }
  }
}

// Método para obtener carpetas hijas con más información de depuración
async obtenerCarpetasHijas(codigoPadre: number): Promise<CarpetasPadre[] | CarpetaBase[]> {
  const db = await this.dbPromise;
  const carpetas = await db.getAll('carpetas');



  const carpetasHijas = carpetas.filter(carpeta => carpeta.CarpetaPadre === codigoPadre);


  return carpetasHijas;
}


  async limpiarBaseDeDatos() {
    try {
      // console.log('Iniciando limpieza de IndexedDB');
      const db = await this.dbPromise;
      const tx = db.transaction('carpetas', 'readwrite');
      const store = tx.objectStore('carpetas');
      await store.clear();
      await tx.done;
      // console.log('IndexedDB limpiado correctamente');
    } catch (error) {
      console.error('Error al limpiar IndexedDB:', error);
    }
  }

  async obtenerCarpeta(codigoCarpeta: number) {
    const db = await this.dbPromise;
    const carpeta = await db.get('carpetas', codigoCarpeta);

    if (!carpeta) {
      throw new Error(`Carpeta ${codigoCarpeta} no encontrada`);
    }

    return carpeta;
  }

  async obtenerDeContenidoCarpeta(codigo:number){

  }


  // En tu indexdbService
async guardarContenidoCarpeta(carpetaId: number, contenido: ContenidoCarpetaResponse): Promise<void> {
  try {
    const db = await this.dbPromise;

    // Guardar la carpeta principal con su contenido completo
    await db.put('contenidoCarpetas', contenido, carpetaId.toString());

    console.log(`Contenido de carpeta ${carpetaId} guardado en IndexedDB`);

    const elementosContenido = contenido.contenido;

    for (const elemento of elementosContenido) {
      // Usamos el Cod como clave
      await db.put('elementos', elemento);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error guardando contenido en IndexedDB:', error);
    return Promise.reject(error);
  }
}

// Método para obtener las carpetas hijas y archivos de una carpeta específica desde IndexedDB
async obtenerContenidoCarpetaDesdeIndexDB(carpetaId: number): Promise<{carpetas: CarpetaBase[], archivos: ArchivoGenericoExpediente[]}> {
  try {
    const db = await this.dbPromise;

    // Obtener todos los elementos
    const todosElementos = await db.getAll('elementos');

    // Filtrar las carpetas hijas directas (donde CarpetaPadre es igual al carpetaId)
    const carpetasHijas = todosElementos.filter(
      item => item.TipoNodo === 'carpeta' && item.CarpetaPadre === carpetaId
    ) as CarpetaBase[];

    // Filtrar los archivos directos (donde Carpeta es igual al carpetaId)
    const archivos = todosElementos.filter(
      item => {
        if (item.TipoNodo === 'archivo') {
          return (item as ArchivoGenericoExpediente).Carpeta === carpetaId;
        }
        return false;
      }) as ArchivoGenericoExpediente[];


    console.log(`Contenido de carpeta ${carpetaId} recuperado de IndexedDB:`);
    console.log('Carpetas hijas:', carpetasHijas);
    console.log('Archivos:', archivos);

    return {
      carpetas: carpetasHijas,
      archivos: archivos
    };
  } catch (error) {
    console.error('Error al obtener contenido de carpeta desde IndexedDB:', error);
    // Devolver arrays vacíos en caso de error
    return {
      carpetas: [],
      archivos: []
    };
  }
}


// En tu IndexedDB service
async agregarElemento(elemento: CarpetaBase | ArchivoGenericoExpediente): Promise<void> {
  try {
    const db = await this.dbPromise;

    // Agregar el elemento al almacén 'elementos'
    await db.put('elementos', elemento);

    console.log(`Elemento con Cod=${elemento.Cod} agregado a IndexedDB`);
    return Promise.resolve();
  } catch (error) {
    console.error('Error al agregar elemento a IndexedDB:', error);
    return Promise.reject(error);
  }
}

public async existeContenidoCarpeta(carpetaId: number): Promise<boolean> {
  try {
    const db = await this.dbPromise;

    // Usar el método get de la instancia db
    const resultado = await db.get('elementos', carpetaId.toString());

    // Si existe data, devuelve true
    return !!resultado;
  } catch (error) {
    console.error('Error al verificar existencia de carpeta:', error);
    throw new Error('Error al verificar existencia de carpeta en IndexedDB');
  }
}


async carpetaTieneContenidoEnIndexDB(carpetaId: number): Promise<boolean> {
  try {
    console.log(`Verificando contenido para carpeta ID: ${carpetaId}, tipo: ${typeof carpetaId}`);

    const db = await this.dbPromise;
    const elementos = await db.getAll('elementos');

    console.log(`Total de elementos en IndexedDB: ${elementos.length}`);

    // Buscar carpetas hijas
    const carpetasHijas = elementos.filter(item =>
      item.TipoNodo === 'carpeta' && (item as CarpetaBase).CarpetaPadre === carpetaId
    );

    // Buscar archivos
    const archivos = elementos.filter(item =>
      item.TipoNodo === 'archivo' && (item as ArchivoGenericoExpediente).Carpeta === carpetaId
    );

    // console.log(`Carpetas hijas encontradas: ${carpetasHijas.length}`);
    // console.log(`Archivos encontrados: ${archivos.length}`);

    if (carpetasHijas.length > 0 || archivos.length > 0) {
      // console.log('La carpeta SÍ tiene contenido');
      return true;
    } else {
      // console.log('La carpeta NO tiene contenido');

      // Depuración adicional para ver si hay problemas de tipo de dato
      // console.log('Mostrando algunos elementos para verificar estructura:');
      // elementos.slice(0, 3).forEach((e, i) => {
      //   console.log(`Elemento ${i}:`, JSON.stringify(e));
      // });

      // Verificar si hay problemas de tipo de dato con casting explícito
      const carpetasPotenciales = elementos.filter(e => e.TipoNodo === 'carpeta');
      // console.log(`Ejemplo de CarpetaPadre:`,
      //   carpetasPotenciales.length > 0 ?
      //   `${(carpetasPotenciales[0] as CarpetaBase).CarpetaPadre} (${typeof (carpetasPotenciales[0] as CarpetaBase).CarpetaPadre})` :
      //   'No hay carpetas'
      // );

      const archivosPotenciales = elementos.filter(e => e.TipoNodo === 'archivo');
      // console.log(`Ejemplo de Carpeta en archivo:`,
      //   archivosPotenciales.length > 0 ?
      //   `${(archivosPotenciales[0] as ArchivoGenericoExpediente).Carpeta} (${typeof (archivosPotenciales[0] as ArchivoGenericoExpediente).Carpeta})` :
      //   'No hay archivos'
      // );

      return false;
    }
  } catch (error) {
    console.error(`Error al verificar contenido de carpeta ${carpetaId}:`, error);
    return false;
  }
}


async carpetaExisteEnElementos(carpetaId: number): Promise<boolean> {
  try {
    const db = await this.dbPromise;
    const elementos = await db.getAll('elementos');

    // Buscar si la carpeta existe como un elemento
    const carpetaExiste = elementos.some(item =>
      item.TipoNodo === 'carpeta' && (item as CarpetaBase).Cod === carpetaId
    );

    return carpetaExiste;
  } catch (error) {
    console.error(`Error al verificar si la carpeta ${carpetaId} existe:`, error);
    return false;
  }
}
}
