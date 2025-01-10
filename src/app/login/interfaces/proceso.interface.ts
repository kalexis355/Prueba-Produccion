export interface Procesos {
  Cod:              number;
  Nombre:           string;
  Entidad:          number;
  Estado:           boolean;
  OficinasProceso: OficinasProceso[];
}

export interface OficinasProceso {
  Cod:         number;
  Oficina:     number;
  FechaInicio: Date;
  Proceso:     number;
  Estado:      boolean;
}


export interface OficinaParticipante{
  Oficina:    number;
}

export interface ProcesoNuevo {
  Nombre:          string;
  OficinasProceso: OficinaParticipante[];
}

export interface BorrarResponse {
  Msg: string;
}

export interface CarpetaRaiz {
  Nombre: string;
}
