export interface IPedido {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  fecha: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ENTREGADO';
  total: number;
  items: IPedidoItem[];
}

export interface IPedidoItem {
  id?: number;
  productoId: number;
  productoNombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface CreatePedidoDTO {
  usuarioId: number;
  total: number;
  items: {
    productoId: number;
    productoNombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
  }[];
}