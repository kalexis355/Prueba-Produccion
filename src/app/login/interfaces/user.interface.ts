export interface User {
  _id:      string;
  email:    string;
  name:     string;
  isActive: string;
  roles:    string[];
}

export interface User2 {
  Cod?:               string | number;
  Nombres:           string;
  Apellidos:         string;
  Telefono:          string;
  Documento:         string;
  Usuario:           string;
  Contraseña:        string;
  Estado?:           boolean;
  Entidad:           number;
  DescripcionEstado?: string;
  RolesUsuario?:      RolUsuario[];
}

export interface RolUsuario {
  Oficina: number;
  Rol:     number;
  Usuario: number;

}

export interface UserResponse {
  Cod:        number;
  Nombres:    string;
  Apellidos:  string;
  Telefono:   string;
  Documento:  string;
  Usuario:    string;
  Contraseña: string;
  Estado:     boolean;
  Entidad:    number;
}


export interface UsuarioConsultado {
  Cod:               number;
  Nombres:           string;
  Apellidos:         string;
  Telefono:          string;
  Documento:         string;
  Usuario:           string;
  Contraseña:        string;
  Estado:            boolean;
  Entidad:           number;
  DescripcionEstado: string;
  RolesUsuario:      RolesUsuarioConsultado[];
}

export interface RolesUsuarioConsultado {
  Oficina:       number;
  Rol:           number;
  Usuario:       number;
  CodRolUsuario?: number;
  FechaInicio?:   Date;
  FechaFin?:      Date;
  Estado?:        boolean;
}


