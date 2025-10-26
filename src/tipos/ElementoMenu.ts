// Interfaz para definir la estructura de un elemento del menú
export interface ElementoMenu {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: 'hamburguesas' | 'acompañamientos' | 'bebidas';
  // Propiedades adicionales para el detalle del producto
  descripcionDetallada?: string;
  ingredientes?: string[];
  calorias?: number;
  alergenos?: string[];
  valoracion?: number;
  numeroReseñas?: number;
  tiempoPreparacion?: string;
  disponible?: boolean;
}
