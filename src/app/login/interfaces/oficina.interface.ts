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
  IconoStr:    string;
  CodigoSerie: number;
}

export interface CrearOficina {
  Nombre:      string;
  CodigoSerie: number;
  Icono?:       number[];
}


