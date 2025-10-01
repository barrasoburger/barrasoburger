import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Usuario, Cliente, Pedido, Reseña, ProductoMenu } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaAdmin {
  onCambiarPantalla: (pantalla: any) => void;
  onVerDetalleCliente: (clienteId: number) => void;
}

// Componente de la pantalla de administración
export function PantallaAdmin({ onCambiarPantalla, onVerDetalleCliente }: PropsPantallaAdmin) {
  // Estados para los datos
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<(Cliente & { username: string })[]>([]);
  const [pedidos, setPedidos] = useState<(Pedido & { nombreCliente: string })[]>([]);
  const [reseñas, setReseñas] = useState<(Reseña & { nombreCliente: string; avatarCliente: string })[]>([]);
  const [productos, setProductos] = useState<ProductoMenu[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>({});
  
  // Estados para la interfaz
  const [pestañaActiva, setPestañaActiva] = useState<'usuarios' | 'clientes' | 'pedidos' | 'reseñas' | 'productos' | 'estadisticas'>('estadisticas');
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [nuevoRol, setNuevoRol] = useState<'admin' | 'empleado' | 'cliente'>('cliente');
  
  // Estados para gestión de productos
  const [productoEditando, setProductoEditando] = useState<ProductoMenu | null>(null);
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);
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

  // Función para limpiar imagen subida
  const limpiarImagen = () => {
    setImagenSubida('');
    setDatosProducto(prev => ({
      ...prev,
      imagen: ''
    }));
    // Limpiar el input file
    const inputFile = document.getElementById('archivo-imagen-admin') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  };

  // Hook de autenticación
  const { usuarioActual, esAdmin } = useAuth();

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos
  const cargarDatos = () => {
    setUsuarios(baseDatos.obtenerTodosLosUsuarios());
    setClientes(baseDatos.obtenerTodosLosClientes());
    setPedidos(baseDatos.obtenerTodosLosPedidos());
    setReseñas(baseDatos.obtenerTodasLasReseñas());
    setProductos(baseDatos.obtenerTodosLosProductos());
    setEstadisticas(baseDatos.obtenerEstadisticas());
  };

  // Función para actualizar rol de usuario
  const actualizarRol = (id_usuario: number, nuevoRol: 'admin' | 'empleado' | 'cliente') => {
    const exito = baseDatos.actualizarRolUsuario(id_usuario, nuevoRol);
    if (exito) {
      cargarDatos();
      setUsuarioEditando(null);
    }
  };

  // Función para eliminar usuario
  const eliminarUsuario = (id_usuario: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      const exito = baseDatos.eliminarUsuario(id_usuario);
      if (exito) {
        cargarDatos();
      } else {
        alert('No se puede eliminar este usuario');
      }
    }
  };

  // Función para manejar cambios en el formulario de producto
  const manejarCambioProducto = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // Convertir string separado por comas en array
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

  // Función para guardar producto (crear o actualizar)
  const guardarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (productoEditando) {
        // Actualizar producto existente
        const exito = baseDatos.actualizarProducto(productoEditando.id_producto, datosProducto);
        if (exito) {
          alert('Producto actualizado exitosamente');
          setProductoEditando(null);
          setMostrarFormularioProducto(false);
          cargarDatos();
        }
      } else {
        // Crear nuevo producto
        const nuevoProducto = baseDatos.crearProducto(datosProducto as Omit<ProductoMenu, 'id_producto' | 'fecha_creacion' | 'fecha_modificacion'>);
        if (nuevoProducto) {
          alert('Producto creado exitosamente');
          setMostrarFormularioProducto(false);
          cargarDatos();
        }
      }
      
      // Resetear formulario
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
    setMostrarFormularioProducto(true);
  };

  // Función para eliminar producto
  const eliminarProducto = (id_producto: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      const exito = baseDatos.eliminarProducto(id_producto);
      if (exito) {
        alert('Producto eliminado exitosamente');
        cargarDatos();
      } else {
        alert('Error al eliminar el producto');
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
    }
  };

  // Función para cancelar edición de producto
  const cancelarEdicionProducto = () => {
    setProductoEditando(null);
    setMostrarFormularioProducto(false);
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
  };

  // Verificar si el usuario es admin
  if (!esAdmin) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta sección</p>
          <button
            onClick={() => onCambiarPantalla('inicio')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    // Contenedor principal de la pantalla de admin
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de admin mejorado */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Información del administrador */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-6 mb-6">
                {/* Avatar del administrador */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">👑</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Panel de Administración
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-orange-600/20 border border-orange-500/30 rounded-full backdrop-blur-sm">
                      <span className="text-orange-300 font-medium">Administrador</span>
                    </div>
                    <div className="text-gray-300 text-lg">
                      Bienvenido, <span className="font-bold text-white">{usuarioActual?.username}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-white">{estadisticas.totalUsuarios || 0}</div>
                  <div className="text-xs text-gray-300">Usuarios</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🛍️</div>
                  <div className="text-2xl font-bold text-white">{estadisticas.totalClientes || 0}</div>
                  <div className="text-xs text-gray-300">Clientes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-2xl font-bold text-white">{estadisticas.totalPedidos || 0}</div>
                  <div className="text-xs text-gray-300">Pedidos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-white">{estadisticas.totalReseñas || 0}</div>
                  <div className="text-xs text-gray-300">Reseñas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🍔</div>
                  <div className="text-2xl font-bold text-white">{estadisticas.totalProductos || 0}</div>
                  <div className="text-xs text-gray-300">Productos</div>
                </div>
              </div>
            </div>

            {/* Panel de ingresos destacado */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-center shadow-2xl border border-orange-400/30">
                <div className="text-4xl mb-4">💰</div>
                <div className="text-sm text-orange-100 mb-2">Ingresos Totales</div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  €{estadisticas.ingresoTotal?.toFixed(2) || '0.00'}
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-sm text-orange-100">
                    Promedio por pedido: €{estadisticas.totalPedidos > 0 ? (estadisticas.ingresoTotal / estadisticas.totalPedidos).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setPestañaActiva('usuarios')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-white">Gestionar Usuarios</div>
            </button>
            <button
              onClick={() => setPestañaActiva('clientes')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-2xl mb-2">🛍️</div>
              <div className="text-sm font-medium text-white">Ver Clientes</div>
            </button>
            <button
              onClick={() => onCambiarPantalla('gestion-productos')}
              className="bg-gradient-to-r from-green-500 to-green-600 border border-green-400/30 rounded-xl p-4 text-center hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🍔</div>
              <div className="text-sm font-bold text-white">Gestionar Productos</div>
              <div className="text-xs text-green-100 mt-1">Crear • Editar • Eliminar</div>
            </button>
            <button
              onClick={() => onCambiarPantalla('gestion-pedidos')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-400/30 rounded-xl p-4 text-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-bold text-white">Gestionar Pedidos</div>
              <div className="text-xs text-blue-100 mt-1">Estados • Tiempos • Seguimiento</div>
            </button>
            <button
              onClick={() => onCambiarPantalla('comandas-empleado')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 border border-purple-400/30 rounded-xl p-4 text-center hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🍽️</div>
              <div className="text-sm font-bold text-white">Tomar Comandas</div>
              <div className="text-xs text-purple-100 mt-1">Restaurante • Clientes • Puntos</div>
            </button>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Navegación por pestañas */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-white rounded-full p-2 shadow-lg">
              <button
                onClick={() => setPestañaActiva('estadisticas')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'estadisticas'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-800'
                }`}
              >
                📊 Estadísticas
              </button>
              <button
                onClick={() => setPestañaActiva('usuarios')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'usuarios'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-800'
                }`}
              >
                👥 Usuarios
              </button>
              <button
                onClick={() => setPestañaActiva('clientes')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'clientes'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-800'
                }`}
              >
                🛍️ Clientes
              </button>
              <button
                onClick={() => setPestañaActiva('pedidos')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'pedidos'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-800'
                }`}
              >
                📦 Pedidos
              </button>
              <button
                onClick={() => setPestañaActiva('reseñas')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'reseñas'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-800'
                }`}
              >
                ⭐ Reseñas
              </button>
              <button
                onClick={() => setPestañaActiva('productos')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'productos'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-110'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                🍔 Productos
              </button>
            </div>
          </div>

          {/* Botón flotante para gestión de productos */}
          <div className="fixed bottom-8 left-8 z-50">
            <button
              onClick={() => {
                console.log('Botón flotante clickeado');
                onCambiarPantalla('gestion-productos');
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-110 flex items-center gap-3"
            >
              <span className="text-2xl">🍔</span>
              <span className="hidden md:block font-bold">Gestionar Productos</span>
            </button>
          </div>

          {/* Alerta para gestión de productos */}
          {pestañaActiva !== 'productos' && (
            <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍔</span>
                  <div>
                    <h4 className="font-bold text-green-800">Gestión de Productos del Menú</h4>
                    <p className="text-green-700 text-sm">Crea, edita y elimina productos de tu restaurante</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Botón Ir a Productos clickeado');
                    onCambiarPantalla('gestion-productos');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>🍔</span>
                  Ir a Productos
                </button>
              </div>
            </div>
          )}

          {/* Contenido según la pestaña activa */}
          {pestañaActiva === 'estadisticas' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
                Estadísticas Generales
              </h2>
              
              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-3">👥</div>
                  <div className="text-2xl font-bold text-gray-800">{estadisticas.totalUsuarios || 0}</div>
                  <div className="text-sm text-gray-600">Total Usuarios</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-3">🛍️</div>
                  <div className="text-2xl font-bold text-gray-800">{estadisticas.totalClientes || 0}</div>
                  <div className="text-sm text-gray-600">Clientes Registrados</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-3">📦</div>
                  <div className="text-2xl font-bold text-gray-800">{estadisticas.totalPedidos || 0}</div>
                  <div className="text-sm text-gray-600">Pedidos Realizados</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-3">⭐</div>
                  <div className="text-2xl font-bold text-gray-800">{estadisticas.totalReseñas || 0}</div>
                  <div className="text-sm text-gray-600">Reseñas Recibidas</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-3">🍔</div>
                  <div className="text-2xl font-bold text-gray-800">{estadisticas.totalProductos || 0}</div>
                  <div className="text-sm text-gray-600">Productos en Menú</div>
                </div>
              </div>

              {/* Información de la base de datos */}
              <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">💾</span>
                  Estado de la Base de Datos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-800">Persistencia:</div>
                    <div className="text-green-600">✅ localStorage activo</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-800">Última actualización:</div>
                    <div className="text-gray-600">{new Date().toLocaleTimeString('es-ES')}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-800">Registros totales:</div>
                    <div className="text-gray-600">{usuarios.length + clientes.length + pedidos.length}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const datos = baseDatos.exportarDatos();
                      console.log('Datos exportados:', datos);
                      navigator.clipboard.writeText(datos);
                      alert('Datos copiados al portapapeles (revisa la consola)');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    📋 Exportar Datos
                  </button>
                </div>
              </div>
            </div>
          )}

          {pestañaActiva === 'usuarios' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  Gestión de Usuarios
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={cargarDatos}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    🔄 Actualizar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres limpiar toda la base de datos? Esta acción no se puede deshacer.')) {
                        baseDatos.limpiarDatos();
                        cargarDatos();
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    🗑️ Limpiar BD
                  </button>
                  <button
                    onClick={() => {
                      // Forzar creación de productos
                      localStorage.removeItem('barraso_productos');
                      window.location.reload();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    🔄 Recrear Productos
                  </button>
                </div>
              </div>
              
              {/* Tabla de usuarios */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Usuario</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Rol</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{usuario.id_usuario}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{usuario.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                              usuario.rol === 'empleado' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setUsuarioEditando(usuario)}
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                              >
                                Editar Rol
                              </button>
                              {usuario.rol !== 'admin' && (
                                <button
                                  onClick={() => eliminarUsuario(usuario.id_usuario)}
                                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {pestañaActiva === 'clientes' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Gestión de Clientes
              </h2>
              
              {/* Información sobre cómo usar la tabla */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-sm flex items-center">
                  <span className="text-lg mr-2">💡</span>
                  <strong>Tip:</strong> Haz click en cualquier cliente para ver su perfil completo y historial de pedidos
                </p>
              </div>

              {/* Tabla de clientes */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nombre</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Código Único</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Usuario</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">DNI</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Puntos</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Pedidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clientes.map((cliente) => {
                        const pedidosCliente = baseDatos.obtenerPedidosCliente(cliente.id_cliente);
                        return (
                          <tr 
                            key={cliente.id_cliente} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => onVerDetalleCliente(cliente.id_cliente)}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">{cliente.id_cliente}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors">
                              {cliente.nombre}
                            </td>
                            <td className="px-6 py-4">
                              <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-sm font-bold">
                                {cliente.codigo_unico}
                              </code>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{cliente.username}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {cliente.dni || 'No especificado'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                {cliente.puntos} pts
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>{pedidosCliente.length} pedidos</span>
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                </svg>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {pestañaActiva === 'pedidos' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Historial de Pedidos
              </h2>
              
              {/* Lista de pedidos */}
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div key={pedido.id_pedido} className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Pedido #{pedido.id_pedido}
                        </h3>
                        <p className="text-gray-600">
                          Cliente: {pedido.nombreCliente}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          €{pedido.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pedido.productos.length} productos
                        </div>
                      </div>
                    </div>
                    
                    {/* Productos del pedido */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                      <div className="space-y-1">
                        {pedido.productos.map((producto) => (
                          <div key={producto.id_detalle} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {producto.cantidad}x {producto.producto}
                            </span>
                            <span className="font-medium text-gray-800">
                              €{(producto.precio_unitario * producto.cantidad).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pestañaActiva === 'reseñas' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  Gestión de Reseñas
                </h2>
                <button
                  onClick={cargarDatos}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  🔄 Actualizar
                </button>
              </div>

              {/* Estadísticas de reseñas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-gray-800">{reseñas.length}</div>
                  <div className="text-sm text-gray-600">Total Reseñas</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {estadisticas.totalReseñas > 0 
                      ? (reseñas.reduce((sum, r) => sum + r.calificacion, 0) / reseñas.length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Promedio</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-green-600">
                    {reseñas.filter(r => r.verificado).length}
                  </div>
                  <div className="text-sm text-gray-600">Verificadas</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {reseñas.filter(r => !r.verificado).length}
                  </div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </div>
              
              {/* Lista de reseñas */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Cliente</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Calificación</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Producto</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Comentario</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fecha</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estado</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reseñas.map((reseña) => (
                        <tr key={reseña.id_reseña} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{reseña.avatarCliente}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{reseña.nombreCliente}</div>
                                <div className="text-xs text-gray-500">ID: {reseña.id_cliente}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <div className="text-lg font-bold text-gray-800 mb-1">
                                {reseña.calificacion}/5
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((estrella) => (
                                  <span
                                    key={estrella}
                                    className={estrella <= reseña.calificacion ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {reseña.producto_reseñado ? (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                {reseña.producto_reseñado}
                              </span>
                            ) : (
                              <span className="text-gray-400">General</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-600 truncate" title={reseña.comentario}>
                                {reseña.comentario}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(reseña.fecha).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reseña.verificado 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reseña.verificado ? 'Verificada' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {!reseña.verificado && (
                                <button
                                  onClick={() => {
                                    baseDatos.verificarReseña(reseña.id_reseña);
                                    cargarDatos();
                                  }}
                                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                                >
                                  ✓ Verificar
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                                    baseDatos.eliminarReseña(reseña.id_reseña);
                                    cargarDatos();
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {pestañaActiva === 'productos' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Gestión de Productos del Menú
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Administra todos los productos disponibles en tu restaurante
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarFormularioProducto(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="text-lg">➕</span>
                    Nuevo Producto
                  </button>
                  <button
                    onClick={cargarDatos}
                    className="bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg">🔄</span>
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Estadísticas de productos mejoradas */}
              {(() => {
                const statsProductos = baseDatos.obtenerEstadisticasProductos();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg text-center">
                      <div className="text-3xl mb-2">🍔</div>
                      <div className="text-2xl font-bold">{statsProductos.totalProductos}</div>
                      <div className="text-sm text-orange-100">Total Productos</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <div className="text-2xl font-bold">{statsProductos.productosDisponibles}</div>
                      <div className="text-sm text-green-100">Disponibles</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg text-center">
                      <div className="text-3xl mb-2">❌</div>
                      <div className="text-2xl font-bold">{statsProductos.productosNoDisponibles}</div>
                      <div className="text-sm text-red-100">No Disponibles</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg text-center">
                      <div className="text-3xl mb-2">📊</div>
                      <div className="text-sm font-bold">
                        🍔 {statsProductos.productosPorCategoria.hamburguesas}<br/>
                        🍟 {statsProductos.productosPorCategoria.acompañamientos}<br/>
                        🥤 {statsProductos.productosPorCategoria.bebidas}
                      </div>
                      <div className="text-sm text-purple-100">Por Categoría</div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Acciones rápidas para productos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => setMostrarFormularioProducto(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="text-3xl mb-3">➕</div>
                  <h3 className="text-lg font-bold mb-2">Crear Producto</h3>
                  <p className="text-green-100 text-sm">Agregar nuevo producto al menú</p>
                </button>

                <button
                  onClick={() => {
                    // Filtrar productos por categoría para edición rápida
                    const hamburguesas = productos.filter(p => p.categoria === 'hamburguesas');
                    if (hamburguesas.length > 0) {
                      editarProducto(hamburguesas[0]);
                    } else {
                      alert('No hay hamburguesas para editar');
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="text-3xl mb-3">🍔</div>
                  <h3 className="text-lg font-bold mb-2">Editar Hamburguesas</h3>
                  <p className="text-blue-100 text-sm">Modificar hamburguesas existentes</p>
                </button>

                <button
                  onClick={() => {
                    // Filtrar productos por categoría para edición rápida
                    const acompañamientos = productos.filter(p => p.categoria === 'acompañamientos');
                    if (acompañamientos.length > 0) {
                      editarProducto(acompañamientos[0]);
                    } else {
                      alert('No hay acompañamientos para editar');
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="text-3xl mb-3">🍟</div>
                  <h3 className="text-lg font-bold mb-2">Editar Acompañamientos</h3>
                  <p className="text-purple-100 text-sm">Modificar acompañamientos</p>
                </button>

                <button
                  onClick={() => {
                    // Filtrar productos por categoría para edición rápida
                    const bebidas = productos.filter(p => p.categoria === 'bebidas');
                    if (bebidas.length > 0) {
                      editarProducto(bebidas[0]);
                    } else {
                      alert('No hay bebidas para editar');
                    }
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="text-3xl mb-3">🥤</div>
                  <h3 className="text-lg font-bold mb-2">Editar Bebidas</h3>
                  <p className="text-cyan-100 text-sm">Modificar bebidas disponibles</p>
                </button>
              </div>

              {/* Información de ayuda */}
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-8">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">💡</span>
                  Gestión de Productos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <h5 className="font-medium mb-2">Acciones Disponibles:</h5>
                    <ul className="space-y-1">
                      <li>• <strong>Crear:</strong> Agregar nuevos productos al menú</li>
                      <li>• <strong>Editar:</strong> Modificar productos existentes</li>
                      <li>• <strong>Eliminar:</strong> Quitar productos del menú</li>
                      <li>• <strong>Disponibilidad:</strong> Activar/desactivar productos</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Información que puedes gestionar:</h5>
                    <ul className="space-y-1">
                      <li>• Nombre, descripción y precio</li>
                      <li>• Imágenes y categorías</li>
                      <li>• Ingredientes y alérgenos</li>
                      <li>• Calorías y tiempo de preparación</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Imagen</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nombre</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Categoría</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Precio</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Calorías</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estado</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productos.map((producto) => (
                        <tr key={producto.id_producto} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="relative group">
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-20 h-20 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                                loading="lazy"
                              />
                              {!producto.disponible && (
                                <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                  <span className="text-red-600 font-bold text-xs">NO DISPONIBLE</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-base font-bold text-gray-900 mb-1">{producto.nombre}</div>
                              <div className="text-sm text-gray-500 max-w-xs">{producto.descripcion}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {producto.id_producto} • Creado: {new Date(producto.fecha_creacion).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-2 rounded-full text-sm font-bold ${
                              producto.categoria === 'hamburguesas' ? 'bg-red-100 text-red-800' :
                              producto.categoria === 'acompañamientos' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {producto.categoria === 'hamburguesas' ? '🍔 Hamburguesas' :
                               producto.categoria === 'acompañamientos' ? '🍟 Acompañamientos' :
                               '🥤 Bebidas'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-lg font-bold text-gray-900">€{producto.precio.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{producto.tiempo_preparacion}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm font-medium text-gray-900">{producto.calorias}</div>
                            <div className="text-xs text-gray-500">calorías</div>
                          </td>
                          <td className="px-6 py-4">
                            <label className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={producto.disponible}
                                onChange={(e) => cambiarDisponibilidad(producto.id_producto, e.target.checked)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className={`ml-2 text-sm font-bold ${
                                producto.disponible ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {producto.disponible ? '✅ Sí' : '❌ No'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => editarProducto(producto)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <span>✏️</span>
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarProducto(producto.id_producto)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <span>🗑️</span>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Modal para crear/editar producto */}
          {mostrarFormularioProducto && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {productoEditando ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
                      </h3>
                      <p className="text-orange-100 mt-1">
                        {productoEditando 
                          ? `Modificando: ${productoEditando.nombre}`
                          : 'Completa la información para crear un nuevo producto'
                        }
                      </p>
                    </div>
                    <button
                      onClick={cancelarEdicionProducto}
                      className="text-orange-200 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={guardarProducto} className="p-6 space-y-6">
                  {/* Información básica */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Información Básica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          required
                          value={datosProducto.nombre || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Ej: BarrasoBurger Especial"
                        />
                      </div>
                      <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría *
                        </label>
                        <select
                          id="categoria"
                          name="categoria"
                          required
                          value={datosProducto.categoria || 'hamburguesas'}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="hamburguesas">Hamburguesas</option>
                          <option value="acompañamientos">Acompañamientos</option>
                          <option value="bebidas">Bebidas</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Descripción</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción Corta *
                        </label>
                        <input
                          type="text"
                          id="descripcion"
                          name="descripcion"
                          required
                          value={datosProducto.descripcion || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Descripción breve que aparece en el menú"
                        />
                      </div>
                      <div>
                        <label htmlFor="descripcion_detallada" className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción Detallada *
                        </label>
                        <textarea
                          id="descripcion_detallada"
                          name="descripcion_detallada"
                          required
                          rows={4}
                          value={datosProducto.descripcion_detallada || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Descripción completa que aparece en la página de detalle del producto"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Precio e imagen */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Precio e Imagen</h4>
                    
                    {/* Precio */}
                    <div className="mb-6">
                      <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                        Precio (€) *
                      </label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          id="precio"
                          name="precio"
                          required
                          step="0.01"
                          min="0"
                          value={datosProducto.precio || ''}
                          onChange={manejarCambioProducto}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="12.99"
                        />
                      </div>
                    </div>

                    {/* Imagen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Imagen del Producto *
                      </label>
                      
                      {/* Selector de método */}
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="url"
                            checked={tipoImagen === 'url'}
                            onChange={(e) => setTipoImagen('url')}
                            className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">🌐 URL de Internet</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="archivo"
                            checked={tipoImagen === 'archivo'}
                            onChange={(e) => setTipoImagen('archivo')}
                            className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">📁 Subir Archivo</span>
                        </label>
                      </div>

                      {/* Campo según el tipo seleccionado */}
                      {tipoImagen === 'url' ? (
                        <div>
                          <input
                            type="url"
                            id="imagen"
                            name="imagen"
                            required={tipoImagen === 'url'}
                            value={datosProducto.imagen || ''}
                            onChange={manejarCambioProducto}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Pega aquí la URL de una imagen desde internet
                          </p>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                          {subiendoImagen ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
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
                                🗑️ Cambiar imagen
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
                                id="archivo-imagen-admin"
                                accept="image/*"
                                onChange={(e) => {
                                  const archivo = e.target.files?.[0];
                                  if (archivo) {
                                    if (!archivo.type.startsWith('image/')) {
                                      alert('Por favor selecciona un archivo de imagen válido');
                                      return;
                                    }
                                    if (archivo.size > 5 * 1024 * 1024) {
                                      alert('El archivo es demasiado grande. Máximo 5MB.');
                                      return;
                                    }
                                    setSubiendoImagen(true);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imagenBase64 = event.target?.result as string;
                                      setImagenSubida(imagenBase64);
                                      setDatosProducto(prev => ({ ...prev, imagen: imagenBase64 }));
                                      setSubiendoImagen(false);
                                    };
                                    reader.readAsDataURL(archivo);
                                  }
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor="archivo-imagen-admin"
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors cursor-pointer inline-flex items-center gap-2"
                              >
                                <span>📁</span>
                                Seleccionar Imagen
                              </label>
                              <p className="text-xs text-gray-500 mt-2">
                                JPG, PNG, GIF, WebP (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Vista previa de imagen URL */}
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
                  </div>

                  {/* Ingredientes y alérgenos */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Ingredientes y Alérgenos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ingredientes" className="block text-sm font-medium text-gray-700 mb-2">
                          Ingredientes (separados por comas) *
                        </label>
                        <textarea
                          id="ingredientes"
                          name="ingredientes"
                          required
                          rows={3}
                          value={datosProducto.ingredientes?.join(', ') || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Carne de res, Queso cheddar, Lechuga, Tomate"
                        />
                      </div>
                      <div>
                        <label htmlFor="alergenos" className="block text-sm font-medium text-gray-700 mb-2">
                          Alérgenos (separados por comas)
                        </label>
                        <textarea
                          id="alergenos"
                          name="alergenos"
                          rows={3}
                          value={datosProducto.alergenos?.join(', ') || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Gluten, Lácteos, Huevos"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información nutricional y tiempo */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Información Adicional</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="calorias" className="block text-sm font-medium text-gray-700 mb-2">
                          Calorías *
                        </label>
                        <input
                          type="number"
                          id="calorias"
                          name="calorias"
                          required
                          min="0"
                          value={datosProducto.calorias || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="650"
                        />
                      </div>
                      <div>
                        <label htmlFor="tiempo_preparacion" className="block text-sm font-medium text-gray-700 mb-2">
                          Tiempo de Preparación *
                        </label>
                        <input
                          type="text"
                          id="tiempo_preparacion"
                          name="tiempo_preparacion"
                          required
                          value={datosProducto.tiempo_preparacion || ''}
                          onChange={manejarCambioProducto}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="12-15 min"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="disponible"
                            checked={datosProducto.disponible || false}
                            onChange={manejarCambioProducto}
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
                      onClick={cancelarEdicionProducto}
                      className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>❌</span>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-lg font-bold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>{productoEditando ? '💾' : '➕'}</span>
                      {productoEditando ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para editar rol de usuario */}
          {usuarioEditando && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Editar Rol de Usuario
                </h3>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Usuario: <strong>{usuarioEditando.username}</strong>
                  </p>
                  <p className="text-gray-600 mb-4">
                    Rol actual: <strong>{usuarioEditando.rol}</strong>
                  </p>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Rol:
                  </label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as 'admin' | 'empleado' | 'cliente')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="empleado">Empleado</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setUsuarioEditando(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => actualizarRol(usuarioEditando.id_usuario, nuevoRol)}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-orange-700 transition-colors"
                  >
                    Actualizar Rol
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
