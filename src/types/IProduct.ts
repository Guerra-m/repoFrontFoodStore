export interface IProduct {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoriaId: number;
  categoriaNombre?: string;
  disponible?: boolean;
}
