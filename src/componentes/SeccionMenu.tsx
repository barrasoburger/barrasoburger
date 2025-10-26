import React, { useState, useEffect } from 'react';
import { ElementoMenu } from '../tipos/ElementoMenu';
import { useIdioma } from '../contextos/ContextoIdioma';
import { baseDatos, ProductoMenu } from '../servicios/BaseDatos';
import { ModalPersonalizacion } from './ModalPersonalizacion';
import { PersonalizacionHamburguesa } from '../App'; // Importar la interfaz de personalización

// Interfaz para las props del componente
interface PropsSeccionMenu {
  onVerDetalleProducto: (producto: ElementoMenu) => void;
  onAgregarAlCarrito: (producto: ElementoMenu, cantidad?: number, personalizacion?: PersonalizacionHamburguesa) => void;
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas' | 'carrito') => void;
  carrito: any[]; // Usar any[] para simplificar, ya que el tipo completo está en App.tsx
  totalCarrito: number;
}

// Componente para la sección del menú con categorías y productos
export function SeccionMenu({ 
  onVerDetalleProducto, 
  onAgregarAlCarrito, 
  onCambiarPantalla, 
  carrito, 
  totalCarrito 
}: PropsSeccionMenu) {
  // Hook de idioma
  const { t } = useIdioma();
  
  // Estado para los productos del menú
  const [productos, setProductos] = useState<ProductoMenu[]>([]);
  
  // Estado para la categoría activa (filtro)
  const [categoriaActiva, setCategoriaActiva] = useState<'hamburguesas' | 'acompañamientos' | 'bebidas'>('hamburguesas');
  
  // Estado para el modal de personalización
  const [modalPersonalizacionAbierto, setModalPersonalizacionAbierto] = useState(false);
  const [productoParaPersonalizar, setProductoParaPersonalizar] = useState<ElementoMenu | null>(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
    
    // Escuchar eventos de actualización de productos
    const manejarProductosActualizados = () => {
      console.log('Productos actualizados, recargando menú...');
      cargarProductos();
    };
    window.addEventListener('productosActualizados', manejarProductosActualizados);
    
    return () => {
      window.removeEventListener('productosActualizados', manejarProductosActualizados);
    };
  }, []);

  // Función para cargar productos desde la base de datos
  const cargarProductos = () => {
    const todosLosProductos = baseDatos.obtenerTodosLosProductos();
    setProductos(todosLosProductos.filter(p => p.disponible)); // Solo mostrar productos disponibles
  };

  // Filtrar productos por categoría activa
  const productosFiltrados = productos.filter(
    (producto) => producto.categoria === categoriaActiva
  );

  // Función para abrir el modal de personalización
  const abrirModalPersonalizacion = (producto: ElementoMenu) => {
    setProductoParaPersonalizar(producto);
    setModalPersonalizacionAbierto(true);
  };

  // Función para cerrar el modal de personalización
  const cerrarModalPersonalizacion = () => {
    setModalPersonalizacionAbierto(false);
    setProductoParaPersonalizar(null);
  };

  // Función para agregar al carrito desde el modal
  const agregarAlCarritoDesdeModal = (producto: ElementoMenu, cantidad: number, personalizacion: PersonalizacionHamburguesa) => {
    onAgregarAlCarrito(producto, cantidad, personalizacion);
    cerrarModalPersonalizacion();
  };

  // Función para verificar si un producto ya está en el carrito
  const estaEnCarrito = (productoId: number) => {
    return carrito.some(item => item.producto.id === productoId && !item.personalizacion);
  };

  return (
    // Sección principal del menú
    <section className="py-20 px-4 bg-orange-50">
      <div className="max-w-6xl mx-auto">
        {/* Navegación de categorías */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white rounded-full p-2 shadow-lg">
            <button
              onClick={() => setCategoriaActiva('hamburguesas')}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                categoriaActiva === 'hamburguesas'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              🍔 {t('menu.hamburguesas')}
            </button>
            <button
              onClick={() => setCategoriaActiva('acompañamientos')}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                categoriaActiva === 'acompañamientos'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              🍟 {t('menu.acompañamientos')}
            </button>
            <button
              onClick={() => setCategoriaActiva('bebidas')}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                categoriaActiva === 'bebidas'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              🥤 {t('menu.bebidas')}
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id_producto}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {/* Imagen del producto */}
              <div 
                className="w-full h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${producto.imagen})` }}
                onClick={() => onVerDetalleProducto(producto as ElementoMenu)}
              ></div>
              
              {/* Contenido del producto */}
              <div className="p-6">
                <h3 
                  className="text-2xl font-bold text-gray-800 mb-2 hover:text-orange-600 transition-colors"
                  onClick={() => onVerDetalleProducto(producto as ElementoMenu)}
                >
                  {producto.nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {producto.descripcion}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-orange-600">
                    €{producto.precio.toFixed(2)}
                  </span>
                  
                  {/* Botón de agregar al carrito */}
                  {producto.categoria === 'hamburguesas' ? (
                    <button
                      onClick={() => abrirModalPersonalizacion(producto as ElementoMenu)}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"/>
                      </svg>
                      {t('menu.agregarCarrito')}
                    </button>
                  ) : (
                    <button
                      onClick={() => onAgregarAlCarrito(producto as ElementoMenu)}
                      className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                        estaEnCarrito(producto.id_producto)
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"/>
                      </svg>
                      {estaEnCarrito(producto.id_producto) ? t('menu.enCarrito') : t('menu.agregarCarrito')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de personalización */}
      {modalPersonalizacionAbierto && productoParaPersonalizar && (
        <ModalPersonalizacion
          producto={productoParaPersonalizar}
          isOpen={modalPersonalizacionAbierto}
          onClose={cerrarModalPersonalizacion}
          onAgregarAlCarrito={agregarAlCarritoDesdeModal}
        />
      )}
    </section>
  );
}
