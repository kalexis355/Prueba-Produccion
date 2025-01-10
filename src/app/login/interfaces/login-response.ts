import { User } from "./user.interface";

export interface LoginResponse {
  user:  User;
  token: string;
}

// Interfaz para el objeto RolUsuario
export interface LoginResponse2 {
  NombreEntidad:     string;
  Cod:               number;
  Nombres:           string;
  Apellidos:         string;
  Usuario:           string;
  DescripcionEstado: string;
  Token:             string;
  RolesUsuario:      RolesUsuario[];
}

export interface RolesUsuario {
  Oficina: number;
  Rol:     number;
  Usuario: number;
}
