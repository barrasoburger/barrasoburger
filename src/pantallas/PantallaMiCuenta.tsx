import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Pedido } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaMiCuenta {
  onCambiarPantalla: (pantalla: any) => void;
  onRepetirPedido?: (pedido: Pedido) => void;
}

// Componente de la pantalla de mi cuenta
export function PantallaMiCuenta({ onCambiarPantalla, onRepetirPedido }: PropsPantallaMiCuenta) {
  // Hook de autenticación
  const { usuarioActual, clienteActual, estaAutenticado, esCliente } = useAuth();
  
  // Estados para los datos del cliente
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([]);
  const [estadisticasCliente, setEstadisticasCliente] = useState<any>({});
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    if (estaAutenticado && esCliente && clienteActual) {
      cargarDatosCliente();
    }
  }, [estaAutenticado, esCliente, clienteActual]);

  // Función para cargar datos del cliente
  const cargarDatosCliente = () => {
    if (clienteActual) {
      setCargando(true);
      
      try {
        // Obtener pedidos del cliente
        const pedidos = baseDatos.obtenerPedidosCliente(clienteActual.id_cliente);
        setPedidosCliente(pedidos);
        
        // Calcular estadísticas del cliente
        const totalGastado = pedidos.reduce((total, pedido) => total + pedido.total, 0);
        const totalPedidos = pedidos.length;
        const promedioGasto = totalPedidos > 0 ? totalGastado / totalPedidos : 0;
        const ultimoPedido = pedidos.length > 0 ? pedidos[pedidos.length - 1].fecha : null;
        
        // Calcular productos más pedidos
        const productosContador: { [key: string]: number } = {};
        pedidos.forEach(pedido => {
          pedido.productos.forEach(producto => {
            productosContador[producto.producto] = (productosContador[producto.producto] || 0) + producto.cantidad;
          });
        });
        
        const productoFavorito = Object.entries(productosContador)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguno';
        
        setEstadisticasCliente({
          totalGastado,
          totalPedidos,
          promedioGasto,
          ultimoPedido,
          productoFavorito,
          productosContador
        });
      } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
      } finally {
        setCargando(false);
      }
    }
  };

  // Función para obtener el estado del pedido (ahora usa el estado real de la BD)
  const obtenerEstadoPedido = (pedido: Pedido) => {
    // Verificar que el pedido tenga estado
    if (!pedido || !pedido.estado) {
      return {
        estado: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icono: '⏳'
      };
    }

    const colores = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', icono: '⏳' },
      'confirmado': { color: 'bg-blue-100 text-blue-800', icono: '✅' },
      'preparando': { color: 'bg-orange-100 text-orange-800', icono: '👨‍🍳' },
      'listo': { color: 'bg-green-100 text-green-800', icono: '🍽️' },
      'en_camino': { color: 'bg-purple-100 text-purple-800', icono: '🚚' },
      'entregado': { color: 'bg-gray-100 text-gray-800', icono: '📦' },
      'cancelado': { color: 'bg-red-100 text-red-800', icono: '❌' }
    };
    
    const estadoInfo = colores[pedido.estado as keyof typeof colores] || colores.pendiente;
    
    const nombres = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'preparando': 'Preparando',
      'listo': 'Listo para Entrega',
      'en_camino': 'En Camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    
    return {
      estado: nombres[pedido.estado as keyof typeof nombres] || pedido.estado || 'Pendiente',
      color: estadoInfo.color,
      icono: estadoInfo.icono
    };
  };

  // Función para obtener el tiempo relativo
  const obtenerTiempoRelativo = (fecha: string) => {
    const fechaPedido = new Date(fecha);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora.getTime() - fechaPedido.getTime()) / (1000 * 3600 * 24));
    
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
    if (diferenciaDias < 30) return `Hace ${Math.floor(diferenciaDias / 7)} semanas`;
    return `Hace ${Math.floor(diferenciaDias / 30)} meses`;
  };

  // Función para repetir un pedido
  const repetirPedido = (pedido: Pedido) => {
    if (onRepetirPedido) {
      onRepetirPedido(pedido);
      // Mostrar confirmación
      alert(`¡Pedido #${pedido.id_pedido} agregado al carrito! Se han añadido todos los productos con sus configuraciones originales.`);
      // Ir al carrito para que vea los productos agregados
      onCambiarPantalla('carrito');
    }
  };

  // Filtrar pedidos según el estado seleccionado
  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidosCliente 
    : pedidosCliente.filter(pedido => {
        // Usar el estado real del pedido de la base de datos
        if (!pedido.estado) return false;
        
        // Mapear filtros a estados reales
        const mapeoFiltros: { [key: string]: string[] } = {
          'preparación': ['pendiente', 'confirmado', 'preparando'],
          'entregado': ['entregado'],
          'completado': ['entregado'],
          'en_camino': ['en_camino'],
          'listo': ['listo'],
          'cancelado': ['cancelado']
        };
        
        const estadosPermitidos = mapeoFiltros[filtroEstado] || [filtroEstado];
        return estadosPermitidos.includes(pedido.estado);
      });


  // Verificar si el usuario está autenticado y es cliente
  if (!estaAutenticado || !esCliente || !clienteActual) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión como cliente para ver esta información</p>
          <button
            onClick={() => onCambiarPantalla('login')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    // Contenedor principal de la pantalla de mi cuenta
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de mi cuenta mejorado */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 text-white relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Información del cliente */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-6 mb-6">
                {/* Avatar del cliente */}
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">👤</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                    Mi Cuenta
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-orange-500/20 border border-orange-400/30 rounded-full backdrop-blur-sm">
                      <span className="text-orange-200 font-medium">Cliente VIP</span>
                    </div>
                    <div className="text-orange-100 text-lg">
                      Bienvenido, <span className="font-bold text-white">{clienteActual.nombre}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas rápidas del cliente */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="text-2xl font-bold text-white">{estadisticasCliente.totalPedidos || 0}</div>
                  <div className="text-xs text-orange-200">Pedidos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-2xl font-bold text-white">€{estadisticasCliente.totalGastado?.toFixed(0) || '0'}</div>
                  <div className="text-xs text-orange-200">Gastado</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-2xl font-bold text-white">€{estadisticasCliente.promedioGasto?.toFixed(0) || '0'}</div>
                  <div className="text-xs text-orange-200">Promedio</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-sm font-bold text-white truncate">{estadisticasCliente.productoFavorito?.split(' ')[0] || 'N/A'}</div>
                  <div className="text-xs text-orange-200">Favorito</div>
                </div>
              </div>
            </div>

            {/* Panel de puntos destacado */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-8 text-center shadow-2xl border border-yellow-400/30">
                <div className="text-4xl mb-4">⭐</div>
                <div className="text-sm text-yellow-100 mb-2">Puntos de Lealtad</div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {clienteActual.puntos}
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
                  <div className="text-sm text-yellow-100">
                    Próximo beneficio: {clienteActual.puntos >= 1000 ? 'Hamburguesa Gratis' : `${1000 - clienteActual.puntos} pts más`}
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((clienteActual.puntos / 1000) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-yellow-100">
                  {Math.min((clienteActual.puntos / 1000) * 100, 100).toFixed(0)}% hacia hamburguesa gratis
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Código único del cliente */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Tu Código Único para el Restaurante
            </h2>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg text-center">
              <div className="text-sm text-purple-100 mb-2">Muestra este código al empleado para ganar puntos</div>
              <div className="text-4xl font-bold font-mono tracking-wider mb-3">
                {clienteActual.codigo_unico}
              </div>
              <div className="text-purple-100 text-sm">
                Este código te identifica únicamente en nuestro sistema
              </div>
            </div>
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">¿Cómo usar tu código?</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Muestra este código al empleado cuando hagas un pedido en el restaurante</li>
                <li>• El empleado lo ingresará en el sistema para asociar el pedido a tu cuenta</li>
                <li>• Ganarás puntos automáticamente (1 punto por cada €1 gastado)</li>
                <li>• El pedido aparecerá en tu historial personal</li>
              </ul>
            </div>
          </div>

          {/* Resumen de la cuenta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            
            {/* Total de pedidos */}
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-2xl font-bold text-orange-600">
                {estadisticasCliente.totalPedidos || 0}
              </div>
              <div className="text-sm text-gray-600">Pedidos Realizados</div>
            </div>

            {/* Total gastado */}
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-600">
                €{estadisticasCliente.totalGastado?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Total Gastado</div>
            </div>

            {/* Promedio por pedido */}
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-blue-600">
                €{estadisticasCliente.promedioGasto?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Promedio por Pedido</div>
            </div>

            {/* Puntos disponibles */}
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-purple-600">
                {clienteActual.puntos}
              </div>
              <div className="text-sm text-gray-600">Puntos Disponibles</div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <button
              onClick={() => onCambiarPantalla('menu')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🍔</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hacer Nuevo Pedido</h3>
              <p className="text-gray-600 text-sm">Explora nuestro menú y personaliza tu hamburguesa</p>
            </button>

            <button
              onClick={() => onCambiarPantalla('lealtad')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Canjear Puntos</h3>
              <p className="text-gray-600 text-sm">Usa tus {clienteActual.puntos} puntos para obtener beneficios</p>
            </button>

            <button
              onClick={() => onCambiarPantalla('reservas')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Reservar Mesa</h3>
              <p className="text-gray-600 text-sm">Asegura tu lugar para una experiencia especial</p>
            </button>

            <button
              onClick={() => onCambiarPantalla('perfil')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Editar Perfil</h3>
              <p className="text-gray-600 text-sm">Actualiza tus datos personales y de domicilio</p>
            </button>
          </div>

          {/* Historial de pedidos */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Historial de Pedidos
                </h2>
                <button
                  onClick={cargarDatosCliente}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm"
                >
                  🔄 Actualizar
                </button>
              </div>

              {/* Filtros de estado */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroEstado('todos')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'todos'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Todos ({pedidosCliente.length})
                </button>
                <button
                  onClick={() => setFiltroEstado('pendiente')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'pendiente'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                  }`}
                >
                  ⏳ Pendientes
                </button>
                <button
                  onClick={() => setFiltroEstado('confirmado')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'confirmado'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  ✅ Confirmados
                </button>
                <button
                  onClick={() => setFiltroEstado('preparando')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'preparando'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  👨‍🍳 Preparando
                </button>
                <button
                  onClick={() => setFiltroEstado('listo')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'listo'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  🍽️ Listos
                </button>
                <button
                  onClick={() => setFiltroEstado('en_camino')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'en_camino'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  🚚 En Camino
                </button>
                <button
                  onClick={() => setFiltroEstado('entregado')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                    filtroEstado === 'entregado'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📦 Entregados
                </button>
              </div>
            </div>

            {pedidosFiltrados.length === 0 ? (
              // Sin pedidos
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">
                  {filtroEstado === 'todos' ? '📦' : '🔍'}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {filtroEstado === 'todos' 
                    ? 'Aún no has realizado pedidos' 
                    : `No hay pedidos ${filtroEstado}`
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {filtroEstado === 'todos'
                    ? '¡Haz tu primer pedido y comienza a ganar puntos!'
                    : 'Prueba con otro filtro o haz un nuevo pedido'
                  }
                </p>
                <button
                  onClick={() => onCambiarPantalla('menu')}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              // Lista de pedidos
              <div className="divide-y divide-gray-200">
                {pedidosFiltrados.slice().reverse().map((pedido) => {
                  const estadoPedido = obtenerEstadoPedido(pedido);
                  
                  return (
                    <div key={pedido.id_pedido} className="p-6 hover:bg-gray-50 transition-colors">
                      
                      {/* Encabezado del pedido */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">
                              Pedido #{pedido.id_pedido}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estadoPedido.color}`}>
                              <span>{estadoPedido.icono}</span>
                              {estadoPedido.estado}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              📅 {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              🕒 {new Date(pedido.fecha).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              🛍️ {pedido.productos.length} productos
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {obtenerTiempoRelativo(pedido.fecha)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-orange-600">
                            €{pedido.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            +{Math.floor(pedido.total)} pts ganados
                          </div>
                        </div>
                      </div>
                      
                      {/* Productos del pedido */}
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                          <span className="text-lg mr-2">🍔</span>
                          Productos del Pedido:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pedido.productos.map((producto) => (
                            <div key={producto.id_detalle} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-800">
                                    {producto.producto}
                                  </h5>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Cantidad: {producto.cantidad}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Precio unitario: €{producto.precio_unitario.toFixed(2)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-orange-600">
                                    €{(producto.precio_unitario * producto.cantidad).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Información adicional del producto */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>Subtotal del producto</span>
                                  <span className="font-medium">
                                    €{(producto.precio_unitario * producto.cantidad).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                        {/* Información adicional del pedido */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <div className="font-medium text-blue-800">Tiempo Estimado</div>
                            <div className="text-blue-600">{pedido.tiempo_estimado || '45-60 minutos'}</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="font-medium text-green-800">Envío</div>
                            <div className="text-green-600">Gratis</div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg text-center">
                            <div className="font-medium text-orange-800">Puntos Ganados</div>
                            <div className="text-orange-600">+{Math.floor(pedido.total)} pts</div>
                          </div>
                        </div>

                        {/* Información de seguimiento en tiempo real */}
                        {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                              <span className="text-lg mr-2">📍</span>
                              Seguimiento en Tiempo Real
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Estado actual:</span>
                                <span className="font-medium text-blue-800">{estadoPedido.estado}</span>
                              </div>
                              {pedido.tiempo_estimado && (
                                <div className="flex justify-between">
                                  <span className="text-blue-700">Tiempo estimado:</span>
                                  <span className="font-medium text-blue-800">{pedido.tiempo_estimado}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-blue-700">Última actualización:</span>
                                <span className="font-medium text-blue-800">
                                  {new Date(pedido.fecha_actualizacion).toLocaleTimeString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Acciones del pedido */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => repetirPedido(pedido)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm flex items-center gap-1"
                          >
                            🔄 Repetir Pedido
                          </button>
                          <button
                            onClick={() => {
                              // Verificar si ya dejó reseña para este pedido
                              const reseñasCliente = baseDatos.obtenerReseñasCliente(clienteActual.id_cliente);
                              const fechaPedido = new Date(pedido.fecha);
                              const yaReseñado = reseñasCliente.some(r => {
                                const fechaReseña = new Date(r.fecha);
                                return Math.abs(fechaReseña.getTime() - fechaPedido.getTime()) < 24 * 60 * 60 * 1000; // Mismo día
                              });
                              
                              if (yaReseñado) {
                                alert('Ya has dejado una reseña para este período. Puedes ver todas tus reseñas en la sección de reseñas.');
                              } else {
                                onCambiarPantalla('reseñas');
                              }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                          >
                            ⭐ Dejar Reseña
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          ID del pedido: {pedido.id_pedido}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resumen final */}
            {pedidosCliente.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {pedidosCliente.length}
                    </div>
                    <div className="text-sm text-gray-600">Total de Pedidos Históricos</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      €{estadisticasCliente.totalGastado?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Gastado Histórico</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {Math.floor(estadisticasCliente.totalGastado || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total de Puntos Ganados</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Producto favorito */}
          {estadisticasCliente.productoFavorito && estadisticasCliente.productoFavorito !== 'Ninguno' && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Tu Producto Favorito
              </h3>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg text-center">
                <div className="text-4xl mb-3">🥇</div>
                <h4 className="text-2xl font-bold mb-2">{estadisticasCliente.productoFavorito}</h4>
                <p className="text-orange-100">
                  Has pedido este producto {estadisticasCliente.productosContador?.[estadisticasCliente.productoFavorito]} veces
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <button
                    onClick={() => onCambiarPantalla('menu')}
                    className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                  >
                    Pedir de Nuevo
                  </button>
                  <button
                    onClick={() => onCambiarPantalla('reseñas')}
                    className="bg-orange-400 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-500 transition-colors"
                  >
                    ⭐ Reseñar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mis reseñas */}
          {estaAutenticado && esCliente && clienteActual && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">📝</span>
                  Mis Reseñas
                </h3>
                <button
                  onClick={() => onCambiarPantalla('reseñas')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  ➕ Nueva Reseña
                </button>
              </div>
              
              {(() => {
                const misReseñas = baseDatos.obtenerReseñasCliente(clienteActual.id_cliente);
                
                if (misReseñas.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>Aún no has dejado ninguna reseña</p>
                      <p className="text-sm">¡Comparte tu experiencia con otros clientes!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {misReseñas.slice(0, 3).map((reseña) => (
                      <div key={reseña.id_reseña} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-gray-800">
                              {reseña.calificacion}/5
                            </div>
                            {reseña.verificado && (
                              <span className="text-green-500 text-xs">✓ Verificada</span>
                            )}
                            {reseña.producto_reseñado && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                {reseña.producto_reseñado}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(reseña.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        
                        {/* Estrellas de valoración */}
                        <div className="flex items-center mb-3">
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
                        <p className="text-gray-700 text-sm">{reseña.comentario}</p>
                      </div>
                    ))}
                    {misReseñas.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={() => onCambiarPantalla('reseñas')}
                          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          Ver todas mis reseñas ({misReseñas.length})
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
