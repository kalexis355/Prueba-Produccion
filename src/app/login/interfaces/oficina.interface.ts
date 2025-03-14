export interface Oficinas {
  Cod:     number;
  Nombre:  string;
  Estado:  boolean;
  Entidad: number;
  CodigoSerie: number;
  Icono?: string;
}

export interface ActualizarOficinas {
  Cod:     number;
  Nombre:  string;
  Estado:  boolean;
  Entidad: number;
  CodigoSerie: number;
  Icono?: number[];
}

export interface DeleteOficinaResponse {
  Msg: string;
}

export interface CrearOficinaResponse {
  Cod:         number;
  Nombre:      string;
  Estado:      boolean;
  Entidad:     number;
  IconoStr?:    string;
  CodigoSerie: number;
}

export interface CrearOficina {
  Nombre:      string;
  CodigoSerie: number;
  Icono?:       number[];
}


export interface Oficinas {
  Cod: number;
  Nombre: string;
  Estado: boolean;
  Entidad: number;
  CodigoSerie: number;
  Icono?: string;

    CodSerie?: number;
    CodSubSerie?: number;

    CarpetaPadre?: number;
    FechaCreacion?: string;
    Delegado?: number;
    TipoCarpeta?: number;
    NivelVisualizacion?: number;
    SerieRaiz?: number;
}

// Interfaz para la estructura de Carpeta
export interface Carpeta {
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
  FechaCreacion: string;
  IndiceElectronico: string;
  Delegado: number;
  TipoCarpeta: number;
  NombreTipoCarpeta: string;
  NivelVisualizacion: number;
  NombreNivelVisualizacion: string;
  SerieRaiz: number;
}

// Interfaz para representar un elemento de la respuesta del backend
export interface RespuestaOficinaCreada{
  Oficina: Oficinas[];
  Carpeta: Carpeta[];
}

export interface RespuestaBackend {
  [index: number]: RespuestaOficinaCreada;
}
