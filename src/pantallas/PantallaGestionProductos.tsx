import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, ProductoMenu } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaGestionProductos {
  onCambiarPantalla: (pantalla: any) => void;
}

// Componente de la pantalla de gestión de productos
export function PantallaGestionProductos({ onCambiarPantalla }: PropsPantallaGestionProductos) {
  // Hook de autenticación
  const { usuarioActual, esAdmin } = useAuth();
  
  // Estados para los datos
  const [productos, setProductos] = useState<ProductoMenu[]>([]);
  const [estadisticasProductos, setEstadisticasProductos] = useState<any>({});
  
  // Estados para la interfaz
  const [categoriaFiltro, setCategoriaFiltro] = useState<'todas' | 'hamburguesas' | 'acompañamientos' | 'bebidas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para gestión de productos
  const [productoEditando, setProductoEditando] = useState<ProductoMenu | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [datosProducto, setDatosProducto] = useState<Partial<ProductoMenu>>({
    nombre: '',
    descripcion: '',
    descripcion_detallada: '',
    precio: 0,
    categoria: 'hamburguesas',
    imagen: '',
    ingredientes: [],
    alergenos: [],
    calorias: 0,
    tiempo_preparacion: '',
    disponible: true
  });
  
  // Estados para manejo de imágenes
  const [imagenSubida, setImagenSubida] = useState<string>('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [tipoImagen, setTipoImagen] = useState<'url' | 'archivo'>('url');

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos
  const cargarDatos = () => {
    setProductos(baseDatos.obtenerTodosLosProductos());
    setEstadisticasProductos(baseDatos.obtenerEstadisticasProductos());
  };

  // Función para manejar cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setDatosProducto(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'precio' || name === 'calorias') {
      setDatosProducto(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'ingredientes' || name === 'alergenos') {
      const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
      setDatosProducto(prev => ({
        ...prev,
        [name]: array
      }));
    } else {
      setDatosProducto(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para manejar la subida de archivos de imagen
  const manejarSubidaImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      // Verificar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)');
        return;
      }

      // Verificar el tamaño del archivo (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB.');
        return;
      }

      setSubiendoImagen(true);

      // Convertir la imagen a base64 para almacenarla
      const reader = new FileReader();
      reader.onload = (event) => {
        const imagenBase64 = event.target?.result as string;
        setImagenSubida(imagenBase64);
        setDatosProducto(prev => ({
          ...prev,
          imagen: imagenBase64
        }));
        setSubiendoImagen(false);
      };

      reader.onerror = () => {
        alert('Error al leer el archivo. Inténtalo de nuevo.');
        setSubiendoImagen(false);
      };

      reader.readAsDataURL(archivo);
    }
  };

  // Función para limpiar imagen subida
  const limpiarImagen = () => {
    setImagenSubida('');
    setDatosProducto(prev => ({
      ...prev,
      imagen: ''
    }));
    // Limpiar el input file
    const inputFile = document.getElementById('archivo-imagen') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  };

  // Función para guardar producto
  const guardarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (productoEditando) {
        const exito = baseDatos.actualizarProducto(productoEditando.id_producto, datosProducto);
        if (exito) {
          alert('Producto actualizado exitosamente');
          resetearFormulario();
          cargarDatos();
          
          // Notificar que se actualizó un producto para que otros componentes se actualicen
          window.dispatchEvent(new CustomEvent('productosActualizados'));
          console.log('Producto actualizado, evento enviado');
        }
      } else {
        const nuevoProducto = baseDatos.crearProducto(datosProducto as Omit<ProductoMenu, 'id_producto' | 'fecha_creacion' | 'fecha_modificacion'>);
        if (nuevoProducto) {
          alert('Producto creado exitosamente');
          resetearFormulario();
          cargarDatos();
          
          // Notificar que se creó un producto para que otros componentes se actualicen
          window.dispatchEvent(new CustomEvent('productosActualizados'));
          console.log('Producto creado, evento enviado');
        }
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  // Función para editar producto
  const editarProducto = (producto: ProductoMenu) => {
    setProductoEditando(producto);
    setDatosProducto({
      ...producto,
      ingredientes: producto.ingredientes || [],
      alergenos: producto.alergenos || []
    });
    
    // Verificar si la imagen es base64 o URL
    if (producto.imagen.startsWith('data:image/')) {
      setTipoImagen('archivo');
      setImagenSubida(producto.imagen);
    } else {
      setTipoImagen('url');
      setImagenSubida('');
    }
    
    setMostrarFormulario(true);
  };

  // Función para eliminar producto
  const eliminarProducto = (id_producto: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      const exito = baseDatos.eliminarProducto(id_producto);
      if (exito) {
        alert('Producto eliminado exitosamente');
        cargarDatos();
        
        // Notificar que se eliminó un producto para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('productosActualizados'));
        console.log('Producto eliminado, evento enviado');
      }
    }
  };

  // Función para cambiar disponibilidad
  const cambiarDisponibilidad = (id_producto: number, disponible: boolean) => {
    const exito = baseDatos.cambiarDisponibilidadProducto(id_producto, disponible);
    if (exito) {
      cargarDatos();
      
      // Notificar que se cambió la disponibilidad para que otros componentes se actualicen
      window.dispatchEvent(new CustomEvent('productosActualizados'));
      console.log(`Disponibilidad cambiada para producto ${id_producto}: ${disponible}`);
    }
  };

  // Función para resetear formulario
  const resetearFormulario = () => {
    setProductoEditando(null);
    setMostrarFormulario(false);
    setImagenSubida('');
    setTipoImagen('url');
    setDatosProducto({
      nombre: '',
      descripcion: '',
      descripcion_detallada: '',
      precio: 0,
      categoria: 'hamburguesas',
      imagen: '',
      ingredientes: [],
      alergenos: [],
      calorias: 0,
      tiempo_preparacion: '',
      disponible: true
    });
    
    // Limpiar el input file
    const inputFile = document.getElementById('archivo-imagen') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'todas' || producto.categoria === categoriaFiltro;
    
    return coincideBusqueda && coincideCategoria;
  });

  // Verificar si es admin
  if (!esAdmin) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo los administradores pueden gestionar productos</p>
          <button
            onClick={() => onCambiarPantalla('menu')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    // Contenedor principal
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">🍔 Gestión de Productos</h1>
          <p className="text-xl">Administra todos los productos de tu restaurante desde aquí</p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Botón de regreso */}
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla('menu')}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver al Menú
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">🍔</div>
              <div className="text-2xl font-bold text-green-600">{estadisticasProductos.totalProductos || 0}</div>
              <div className="text-sm text-gray-600">Total Productos</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{estadisticasProductos.productosDisponibles || 0}</div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">❌</div>
              <div className="text-2xl font-bold text-red-600">{estadisticasProductos.productosNoDisponibles || 0}</div>
              <div className="text-sm text-gray-600">No Disponibles</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-bold text-gray-800">
                🍔 {estadisticasProductos.productosPorCategoria?.hamburguesas || 0}<br/>
                🍟 {estadisticasProductos.productosPorCategoria?.acompañamientos || 0}<br/>
                🥤 {estadisticasProductos.productosPorCategoria?.bebidas || 0}
              </div>
              <div className="text-sm text-gray-600">Por Categoría</div>
            </div>
          </div>

          {/* Controles superiores */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Productos</h2>
                <p className="text-gray-600">Administra todos los productos de tu menú</p>
              </div>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-xl">➕</span>
                Nuevo Producto
              </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar productos:</label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Buscar por nombre o descripción..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría:</label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="todas">Todas las categorías</option>
                  <option value="hamburguesas">🍔 Hamburguesas</option>
                  <option value="acompañamientos">🍟 Acompañamientos</option>
                  <option value="bebidas">🥤 Bebidas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                Productos ({productosFiltrados.length})
              </h3>
            </div>

            {productosFiltrados.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600">Prueba con otros filtros o crea un nuevo producto</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {productosFiltrados.map((producto) => (
                  <div key={producto.id_producto} className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    {/* Imagen del producto */}
                    <div className="relative">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                      {!producto.disponible && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            NO DISPONIBLE
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          producto.categoria === 'hamburguesas' ? 'bg-red-100 text-red-800' :
                          producto.categoria === 'acompañamientos' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {producto.categoria === 'hamburguesas' ? '🍔' :
                           producto.categoria === 'acompañamientos' ? '🍟' : '🥤'}
                        </span>
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{producto.nombre}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-green-600">€{producto.precio.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">{producto.calorias} cal</span>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">⏱️ {producto.tiempo_preparacion}</span>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={producto.disponible}
                            onChange={(e) => cambiarDisponibilidad(producto.id_producto, e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className={`ml-2 text-xs font-medium ${
                            producto.disponible ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {producto.disponible ? 'Disponible' : 'No disponible'}
                          </span>
                        </label>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarProducto(producto)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <span>✏️</span>
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProducto(producto.id_producto)}
                          className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <span>🗑️</span>
                          Eliminar
                        </button>
                      </div>

                      {/* Información adicional */}
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        <div>ID: {producto.id_producto}</div>
                        <div>Creado: {new Date(producto.fecha_creacion).toLocaleDateString('es-ES')}</div>
                        {producto.fecha_modificacion !== producto.fecha_creacion && (
                          <div>Modificado: {new Date(producto.fecha_modificacion).toLocaleDateString('es-ES')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal de formulario */}
          {mostrarFormulario && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                
                {/* Header del modal */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {productoEditando ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}
                      </h3>
                      <p className="text-green-100 mt-1">
                        {productoEditando 
                          ? `Modificando: ${productoEditando.nombre}`
                          : 'Completa todos los campos para crear el producto'
                        }
                      </p>
                    </div>
                    <button
                      onClick={resetearFormulario}
                      className="text-green-200 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={guardarProducto} className="p-6 space-y-8">
                  
                  {/* Información básica */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">📝</span>
                      Información Básica
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          required
                          value={datosProducto.nombre || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Ej: BarrasoBurger Especial"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría *
                        </label>
                        <select
                          name="categoria"
                          required
                          value={datosProducto.categoria || 'hamburguesas'}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="hamburguesas">🍔 Hamburguesas</option>
                          <option value="acompañamientos">🍟 Acompañamientos</option>
                          <option value="bebidas">🥤 Bebidas</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">📄</span>
                      Descripción
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción Corta (aparece en el menú) *
                        </label>
                        <input
                          type="text"
                          name="descripcion"
                          required
                          value={datosProducto.descripcion || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Descripción breve y atractiva"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción Detallada (aparece en la página del producto) *
                        </label>
                        <textarea
                          name="descripcion_detallada"
                          required
                          rows={4}
                          value={datosProducto.descripcion_detallada || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Descripción completa con detalles sobre preparación, ingredientes especiales, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Precio e imagen */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">💰</span>
                      Precio e Imagen
                    </h4>
                    
                    {/* Precio */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio en Euros *
                      </label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          name="precio"
                          required
                          step="0.01"
                          min="0"
                          value={datosProducto.precio || ''}
                          onChange={manejarCambio}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="12.99"
                        />
                      </div>
                    </div>

                    {/* Selector de tipo de imagen */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Método para agregar imagen *
                      </label>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tipoImagen"
                            value="url"
                            checked={tipoImagen === 'url'}
                            onChange={(e) => setTipoImagen(e.target.value as 'url' | 'archivo')}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">🌐 URL de Internet</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tipoImagen"
                            value="archivo"
                            checked={tipoImagen === 'archivo'}
                            onChange={(e) => setTipoImagen(e.target.value as 'url' | 'archivo')}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">📁 Subir desde Ordenador</span>
                        </label>
                      </div>
                    </div>

                    {/* Campo de URL o subida de archivo según selección */}
                    {tipoImagen === 'url' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL de la Imagen *
                        </label>
                        <input
                          type="url"
                          name="imagen"
                          required={tipoImagen === 'url'}
                          value={datosProducto.imagen || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Pega aquí la URL de una imagen desde internet
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subir Imagen desde Ordenador *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                          {subiendoImagen ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                              <p className="text-sm text-gray-600">Procesando imagen...</p>
                            </div>
                          ) : imagenSubida ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={imagenSubida}
                                alt="Imagen subida"
                                className="w-32 h-32 object-cover rounded-lg mb-3"
                              />
                              <p className="text-sm text-green-600 font-medium mb-2">✅ Imagen cargada exitosamente</p>
                              <button
                                type="button"
                                onClick={limpiarImagen}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                🗑️ Eliminar imagen
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-4xl mb-3">📸</div>
                              <p className="text-sm text-gray-600 mb-3">
                                Arrastra una imagen aquí o haz click para seleccionar
                              </p>
                              <input
                                type="file"
                                id="archivo-imagen"
                                accept="image/*"
                                onChange={manejarSubidaImagen}
                                className="hidden"
                              />
                              <label
                                htmlFor="archivo-imagen"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer inline-flex items-center gap-2"
                              >
                                <span>📁</span>
                                Seleccionar Imagen
                              </label>
                              <p className="text-xs text-gray-500 mt-2">
                                Formatos soportados: JPG, PNG, GIF, WebP (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Vista previa de imagen */}
                    {datosProducto.imagen && tipoImagen === 'url' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa:</label>
                        <div className="flex items-start gap-4">
                          <img
                            src={datosProducto.imagen}
                            alt="Vista previa"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">
                              ✅ Imagen cargada desde URL
                            </p>
                            <button
                              type="button"
                              onClick={() => setDatosProducto(prev => ({ ...prev, imagen: '' }))}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              🗑️ Eliminar imagen
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información sobre imágenes */}
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-bold text-blue-800 mb-2 flex items-center">
                        <span className="text-lg mr-2">💡</span>
                        Consejos para Imágenes
                      </h5>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• <strong>Tamaño recomendado:</strong> 800x600 píxeles o superior</li>
                        <li>• <strong>Formato:</strong> JPG o PNG para mejor calidad</li>
                        <li>• <strong>Peso:</strong> Máximo 5MB por imagen</li>
                        <li>• <strong>Contenido:</strong> Imagen clara del producto, bien iluminada</li>
                        <li>• <strong>Fondo:</strong> Preferiblemente fondo neutro o blanco</li>
                      </ul>
                    </div>
                  </div>

                  {/* Ingredientes */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">🥬</span>
                      Ingredientes y Alérgenos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lista de Ingredientes *
                        </label>
                        <textarea
                          name="ingredientes"
                          required
                          rows={4}
                          value={datosProducto.ingredientes?.join(', ') || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Carne de res, Queso cheddar, Lechuga, Tomate, Pan brioche"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separa cada ingrediente con una coma</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alérgenos (opcional)
                        </label>
                        <textarea
                          name="alergenos"
                          rows={4}
                          value={datosProducto.alergenos?.join(', ') || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Gluten, Lácteos, Huevos, Frutos secos"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separa cada alérgeno con una coma</p>
                      </div>
                    </div>
                  </div>

                  {/* Información nutricional */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">📊</span>
                      Información Nutricional y Tiempo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Calorías *
                        </label>
                        <input
                          type="number"
                          name="calorias"
                          required
                          min="0"
                          value={datosProducto.calorias || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="650"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiempo de Preparación *
                        </label>
                        <input
                          type="text"
                          name="tiempo_preparacion"
                          required
                          value={datosProducto.tiempo_preparacion || ''}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="12-15 min"
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="disponible"
                            checked={datosProducto.disponible || false}
                            onChange={manejarCambio}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Producto Disponible</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetearFormulario}
                      className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>❌</span>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>{productoEditando ? '💾' : '➕'}</span>
                      {productoEditando ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
