import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CarpetaEstructura } from '../interfaces/carpeta.interface';

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

}
@Injectable({providedIn: 'root'})
export class IndexDbService {
  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>('MiBaseDeDatos', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('carpetas')) {
          db.createObjectStore('carpetas', { keyPath: 'Cod' });
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

async obtenerCarpetasHijas(codigoPadre:number) {
  const db = await this.dbPromise;
  const carpetas = await db.getAll('carpetas');
  // console.log('carpetas hijas de la carpeta padre', codigoPadre,'son estas',carpetas);

  return carpetas.filter(carpeta => carpeta.CarpetaPadre === codigoPadre);
}

async validarCarpeta(codigoCarpeta: number): Promise<void> {
  const db = await this.dbPromise;
  const carpeta = await db.get('carpetas', codigoCarpeta);

  if (!carpeta) {
    throw new Error('Carpeta no encontrada');
  }

  if (carpeta.TipoCarpeta !== 3 && carpeta.TipoCarpeta !== 4) {
    throw new Error('La carpeta debe ser de tipo Expediente Electrónico o Carpeta Genérica');
  }

  const carpetaPadre = await db.get('carpetas', carpeta.CarpetaPadre);

  if (!carpetaPadre) {
    throw new Error('Carpeta padre no encontrada');
  }

  if (carpetaPadre.TipoCarpeta !== 1 && carpetaPadre.TipoCarpeta !== 2) {
    throw new Error('La carpeta padre debe ser una Serie o Subserie');
  }
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
}
