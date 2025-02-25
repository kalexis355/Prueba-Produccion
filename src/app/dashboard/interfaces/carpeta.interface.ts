


export interface Carpeta {
  id?:string,
  id2?:number,
  nombre: string;
  fechaCreacion: Date;
  creador:string ;
  tipo?: 'carpeta';
  padreId?:string;
  PadreId2?:number,
  hijos?: (Carpeta | Archivo)[];
  permisos?: string[]
}

export interface Archivo{
  id:string;
  padreId?:string;
  nombre: string;
  fechaCreacion:Date;
  creador:string;
  tipo:'archivo';
  extension?: string;
  url?:string;
  archivoBlob?: Blob;
  permisos: string[]
}

export interface TipoCarpeta {
  Cod:    number;
  Nombre: string;
  Estado: boolean;
}

export interface CrearCarpetaResponse {
  Cod:               number;
  CodSerie:          number;
  CodSubSerie:       number;
  Estado:            boolean;
  EstadoCarpeta:     number;
  Nombre:            string;
  Descripcion:       string;
  Copia:             boolean;
  CarpetaPadre:      number;
  FechaCreacion:     Date;
  IndiceElectronico: string;
  Delegado:          number;
  TipoCarpeta:       number;
}

export interface CrearCarpeta {
  CodSerie:      number;
  CodSubSerie:   number;
  Nombre:        string;
  Descripcion:   string;
  EstadoCarpeta: number;
  CarpetaPadre:  number;
  Delegado:      number;
  TipoCarpeta:   number;
  SerieRaiz: number;
  NivelVisualizacion: number;

}

export interface EstadoCarpeta {
  Cod:    number;
  Nombre: string;
}

export interface CarpetaRaiz {
  Cod:               number;
  CodSerie:          number;
  CodSubSerie:       number;
  Estado:            boolean;
  EstadoCarpeta:     number;
  Nombre:            string;
  Descripcion:       string;
  Copia:             boolean;
  CarpetaPadre:      number;
  FechaCreacion:     Date;
  IndiceElectronico: string;
  Delegado:          number;
  TipoCarpeta:       number;
  NombreTipoCarpeta: string;
  Icono:             string;
  CodOficina: number;
}


export interface NivelVisualizacion {
  Cod:    number;
  Nombre: string;
}

export interface IndiceElectronico {
  Cod:                number;
  Nombre:             string;
  Path:               string;
  Nivel:              number;
  TipoCarpeta:        number;
  NivelVisualizacion: number;
  Subcarpetas?:       IndiceElectronico[];
}

export interface IndiceUnificado {
  IndiceElectronico: IndiceElectronico[];
}

export interface CarpetasResponse {
  carpetasOriginales: CarpetaRaiz[];
  indiceUnificado: IndiceUnificado;
}


export interface CortarPegar {
  CodCarpetaCortar:  number;
  CodCarpetaDestino: number;
  SerieRaizOrigen:   number;
  SerieRaizDestino:  number;
}

export interface CopiarPegar {
  CodCarpetaCopiar:  number;
  CodCarpetaDestino: number;
  SerieRaizDestino:  number;
}

export interface CarpetaEstructura {
  estructura_documental: {
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
  }[];
}

export interface CarpetasPadre{
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
}


export interface CarpetaBase {
  Cod: number;
  CodSerie: number;
  CodSubSerie: number;
  Estado: boolean;
  EstadoCarpeta: number;
  NombreEstadoCarpeta: string;
  Nombre: string;
  Descripcion: string;
  Copia: boolean;
  CarpetaPadre: number;
  NombreCarpetaPadre: string;
  FechaCreacion: string;
  IndiceElectronico: string;
  Delegado: number;
  TipoCarpeta: number;
  NombreTipoCarpeta: string;
  NivelVisualizacion: number;
  NombreNivelVisualizacion: string;
  SerieRaiz: number;
  TipoNodo: string;
}

export interface ArchivoGenericoExpediente {
  Cod: number;
  Nombre: string;
  Carpeta: number;
  NombreCarpeta: string;
  Copia: boolean;
  Firmado: boolean;
  FimarPor: string;
  Ruta: string;
  TipoArchivo: number;
  NombreTipoArchivo: string;
  Formato: string;
  NumeroHojas: number;
  Duracion: string;
  Tamaño: string;
  Estado: boolean;
  Indice: number;
  TipoNodo: 'archivo';
}

// Interfaz para la respuesta procesada
export interface ContenidoCarpetaProcesado {
  carpetaPrincipal: CarpetaBase;
  subcarpetas: CarpetaBase[];
  archivos: ArchivoGenericoExpediente[];
}


export interface DetalleCarpeta {

Cod: number;
CodSerie: number;
CodSubSerie: number;
Estado: boolean;
EstadoCarpeta: number;
NombreEstadoCarpeta: string;
Nombre: string;
Descripcion: string;
Copia: boolean;
CarpetaPadre: number;
NombreCarpetaPadre: string;
FechaCreacion: string;
IndiceElectronico: string;
Delegado: number;
TipoCarpeta: number;
NombreTipoCarpeta: string;
NivelVisualizacion: number;
NombreNivelVisualizacion: string;
SerieRaiz: number;
}

export interface FolderNavigationState {
  currentPath: number[];        // Guarda los IDs de las carpetas en la ruta actual
  currentFolder?: number;       // ID de la carpeta actual
  folderCache: Map<number, CarpetaBase & { contenido: (CarpetaBase | ArchivoGenericoExpediente)[] }>;  // Caché de carpetas
}
