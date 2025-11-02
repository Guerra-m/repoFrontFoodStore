export interface IOrder {
  id: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'en_proceso' | 'enviado' | 'entregado';
  items: {
    nombre: string;
    qty: number;
    precio: number;
  }[];
}
