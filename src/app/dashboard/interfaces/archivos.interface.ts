export interface Documento {
  Nombre: string; // Nombre del documento
  Carpeta: number; // Identificador de la carpeta
  FimarPor: string; // Persona encargada de firmar
  TipoArchivo: number; // Tipo de archivo (1 podría ser un tipo específico)
  Formato: string; // Formato del archivo (e.g., "pdf")
  NumeroHojas: number; // Número de hojas
  Duracion: string; // Duración en formato "HH:mm:ss"
  Tamaño: string; // Tamaño del archivo (e.g., "2MB")
  Indice: number; // Índice del archivo
  Archivo: number[]; // Array de números relacionado al archivo
}

export interface TipoArchivos {
  Cod:    number;
  Nombre: string;
  Estado: boolean;
}
