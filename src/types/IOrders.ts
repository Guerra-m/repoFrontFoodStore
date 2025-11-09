//src/types/IOrders.ts
export interface IPedido {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  fecha: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'TERMINADO';
  total: number;
  detalles: IPedidoItem[];
}


export interface IPedidoDetalle {
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
