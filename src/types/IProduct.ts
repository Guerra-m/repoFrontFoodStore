export interface IProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;  // ← AGREGAR
  disponible: boolean;
  imagen: string;
  categoriaId: number;
  categoriaNombre?: string;
}