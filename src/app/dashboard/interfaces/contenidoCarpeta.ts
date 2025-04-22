// Interfaz para la carpeta
export interface CarpetaContenido {
  Cod: number;
  CodSerie: number;
  CodSubSerie: number;
  Estado: boolean;
  EstadoCarpeta: number;
  Nombre: string;
  Descripcion: string;
  Copia: boolean;
  CarpetaPadre: number;
  FechaCreacion: string;  // ISO Date
  IndiceElectronico: string;
  Delegado: number;
  TipoCarpeta: number;
  NombreTipoCarpeta: string;
  NivelVisualizacion: number;
}

// Interfaz para el documento
export interface DocumentoContenido {
  Cod: number;
  Nombre: string;
  Carpeta: number;
  Copia: boolean;
  Firmado: boolean;
  FimarPor: string;
  Ruta: string;
  TipoArchivo: number;
  Formato: string;
  NumeroHojas: number;
  Duracion: string;  // Formato de tiempo
  Tamaño: string;    // Formato de tamaño
  Estado: boolean;
  Indice: number;
  NombreTipoArchivo: string;
}
