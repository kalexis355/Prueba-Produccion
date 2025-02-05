


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

