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

async validarCarpeta(codigoCarpeta: number): Promise<void> {
  const db = await this.dbPromise;
  const carpeta = await db.get('carpetas', codigoCarpeta);

  if (!carpeta) {
    console.warn(`[INDEXDB] Carpeta ${codigoCarpeta} no encontrada`);
    throw new Error('Carpeta no encontrada');
  }

  // Tipos de carpeta permitidos
  const tiposPermitidos = [1, 2, 3, 4];

  console.log(`[INDEXDB] Validando carpeta ${codigoCarpeta}:`, {
    tipoCarpeta: carpeta.TipoCarpeta,
    tiposPermitidos: tiposPermitidos
  });

  // Validar que el tipo de carpeta esté permitido
  if (!tiposPermitidos.includes(carpeta.TipoCarpeta)) {
    console.warn(`[INDEXDB] Carpeta ${codigoCarpeta} tiene un tipo no permitido: ${carpeta.TipoCarpeta}`);
    throw new Error('Tipo de carpeta no permitido');
  }

  // Para carpetas de tipo 3 o 4, validar la carpeta padre
  if (carpeta.TipoCarpeta === 3 || carpeta.TipoCarpeta === 4) {
    const carpetaPadre = await db.get('carpetas', carpeta.CarpetaPadre);

    if (!carpetaPadre) {
      console.warn(`[INDEXDB] Carpeta padre ${carpeta.CarpetaPadre} no encontrada para carpeta ${codigoCarpeta}`);
      throw new Error('Carpeta padre no encontrada');
    }

    // Validar que la carpeta padre sea de tipo 1 o 2
    if (carpetaPadre.TipoCarpeta !== 1 && carpetaPadre.TipoCarpeta !== 2) {
      console.warn(`[INDEXDB] Carpeta padre ${carpeta.CarpetaPadre} no es una Serie o Subserie`);
      throw new Error('La carpeta padre debe ser una Serie o Subserie');
    }
  }
}

// Método para obtener carpetas hijas con más información de depuración
async obtenerCarpetasHijas(codigoPadre: number): Promise<any[]> {
  const db = await this.dbPromise;
  const carpetas = await db.getAll('carpetas');

  console.log(`[INDEXDB] Buscando carpetas hijas para padre ${codigoPadre}`);
  console.log(`[INDEXDB] Total de carpetas en base de datos:`, carpetas.length);

  const carpetasHijas = carpetas.filter(carpeta => carpeta.CarpetaPadre === codigoPadre);

  console.log(`[INDEXDB] Carpetas hijas encontradas para ${codigoPadre}:`, carpetasHijas);

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



}
