// import { inject, Injectable, signal } from '@angular/core';
// import { ArchivoGenericoExpediente, CarpetaBase, FolderNavigationState } from '../interfaces/carpeta.interface';
// import { GestionCarpetasService } from './gestionCarpetas.service';
// import { firstValueFrom } from 'rxjs';
// import { IndexDbService } from './indexdb.service';

// @Injectable({providedIn: 'root'})
// export class NavegacionCarpetasService {

//   private gestionCarpetaService = inject(GestionCarpetasService)
//   private indexdbService = inject(IndexDbService)
//   constructor() { }

//   private navigationState = signal<FolderNavigationState>({
//     currentPath: [],
//     folderCache: new Map()
//   });

//   public processFolderHierarchy(contenido: (CarpetaBase | ArchivoGenericoExpediente)[]): {
//     [key: number]: {
//       carpetas: CarpetaBase[],
//       archivos: ArchivoGenericoExpediente[]
//     }
//   } {
//     const hierarchyMap: {
//       [key: number]: {
//         carpetas: CarpetaBase[],
//         archivos: ArchivoGenericoExpediente[]
//       }
//     } = {};

//     contenido.forEach(item => {
//       if (item.TipoNodo === 'carpeta') {
//         const carpeta = item as CarpetaBase;
//         const parentId = carpeta.CarpetaPadre;

//         if (!hierarchyMap[parentId]) {
//           hierarchyMap[parentId] = { carpetas: [], archivos: [] };
//         }
//         hierarchyMap[parentId].carpetas.push(carpeta);
//       }
//       else if (item.TipoNodo === 'archivo') {
//         const archivo = item as ArchivoGenericoExpediente;
//         const parentId = archivo.Carpeta;

//         if (!hierarchyMap[parentId]) {
//           hierarchyMap[parentId] = { carpetas: [], archivos: [] };
//         }
//         hierarchyMap[parentId].archivos.push(archivo);
//       }
//     });

//     return hierarchyMap;
//   }


//    // Método principal de navegación
//    async navigateToFolder(folderId: number): Promise<void> {
//     try {
//       // Verificar caché
//       if (this.navigationState().folderCache.has(folderId)) {
//         const cachedFolder = this.navigationState().folderCache.get(folderId);
//         if (cachedFolder) {
//           this.updateNavigationState(folderId, cachedFolder);
//           return;
//         }
//       }

//       // Primero intentamos obtener las carpetas hijas del IndexDB
//       const carpetasIndexDB = await this.indexdbService.obtenerCarpetasHijas(folderId);

//       try {
//         // Intentamos validar si es una carpeta tipo 3 o 4
//         await this.indexdbService.validarCarpeta(folderId);

//         // Si es válida, obtenemos el contenido del API
//         const folderContent = await firstValueFrom(
//           this.gestionCarpetaService.obtenerContenidoCarpeta(folderId)
//         );

//         const folderData = {
//           ...folderContent.carpetaPrincipal,
//           contenido: [
//             ...folderContent.subcarpetas,
//             ...folderContent.archivos
//           ]
//         } as CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] };

//         this.updateNavigationState(folderId, folderData);

//       } catch (error) {
//         // Si no es tipo 3 o 4, usamos los datos del IndexDB
//         console.log('Usando datos de IndexDB para carpeta tipo 1 o 2');

//         const folderData = {
//           Cod: folderId,
//           TipoNodo: 'carpeta',
//           contenido: carpetasIndexDB.map(carpeta => ({
//             ...carpeta,
//             TipoNodo: 'carpeta'
//           }))
//         } as CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] };

//         this.updateNavigationState(folderId, folderData);
//       }

//     } catch (error) {
//       console.error('Error navigating to folder:', error);
//       throw error;
//     }
//   }

//     // Métodos de gestión del estado
//     private updateNavigationState(folderId: number, folderData: CarpetaBase & {
//       contenido: (CarpetaBase | ArchivoGenericoExpediente)[]
//     }): void {
//       const currentState = this.navigationState();
//       currentState.folderCache.set(folderId, folderData);

//       const pathIndex = currentState.currentPath.indexOf(folderId);
//       if (pathIndex === -1) {
//         currentState.currentPath.push(folderId);
//       } else {
//         currentState.currentPath = currentState.currentPath.slice(0, pathIndex + 1);
//       }

//       currentState.currentFolder = folderId;
//       this.navigationState.set({ ...currentState });
//     }


//       // Métodos de consulta
//   getCurrentFolderContent(): {
//     currentFolder?: CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] },
//     hierarchy: { [key: number]: { carpetas: CarpetaBase[], archivos: ArchivoGenericoExpediente[] } }
//   } {
//     const state = this.navigationState();
//     const currentFolderId = state.currentFolder;

//     if (!currentFolderId) {
//       return { hierarchy: {} };
//     }

//     const currentFolder = state.folderCache.get(currentFolderId);
//     if (!currentFolder) {
//       return { hierarchy: {} };
//     }

//     return {
//       currentFolder,
//       hierarchy: this.processFolderHierarchy(currentFolder.contenido)
//     };
//   }

//   getCurrentPath(): number[] {
//     return this.navigationState().currentPath;
//   }

//   getParentFolder(): number | undefined {
//     const path = this.getCurrentPath();
//     return path.length > 1 ? path[path.length - 2] : undefined;
//   }

//   // Métodos de navegación adicionales
//   async navigateBack(): Promise<void> {
//     const parentId = this.getParentFolder();
//     if (parentId !== undefined) {
//       await this.navigateToFolder(parentId);
//     }
//   }

//   canNavigateBack(): boolean {
//     return this.getCurrentPath().length > 1;
//   }

//   // Métodos de gestión de caché
//   clearNavigationCache(): void {
//     this.navigationState.set({
//       currentPath: [],
//       folderCache: new Map()
//     });
//   }

//   isFolderCached(folderId: number): boolean {
//     return this.navigationState().folderCache.has(folderId);
//   }

// }
