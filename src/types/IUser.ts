export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  rol: 'ADMIN' | 'CLIENTE';
  celular?: number;
}
