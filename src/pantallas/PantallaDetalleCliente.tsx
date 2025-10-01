import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Cliente, Pedido } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaDetalleCliente {
  onCambiarPantalla: (pantalla: any) => void;
  clienteId: number;
}

// Componente de la pantalla de detalle del cliente
export function PantallaDetalleCliente({ onCambiarPantalla, clienteId }: PropsPantallaDetalleCliente) {
  // Estados para los datos del cliente
  const [cliente, setCliente] = useState<(Cliente & { username: string }) | null>(null);
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([]);
  const [estadisticasCliente, setEstadisticasCliente] = useState<any>({});
  const [cargando, setCargando] = useState(true);

  // Hook de autenticación
  const { esAdmin } = useAuth();

  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    cargarDatosCliente();
  }, [clienteId]);

  // Función para cargar todos los datos del cliente
  const cargarDatosCliente = () => {
    setCargando(true);
    
    try {
      // Obtener información del cliente
      const todosLosClientes = baseDatos.obtenerTodosLosClientes();
      const clienteEncontrado = todosLosClientes.find(c => c.id_cliente === clienteId);
      
      if (clienteEncontrado) {
        setCliente(clienteEncontrado);
        
        // Obtener pedidos del cliente
        const pedidos = baseDatos.obtenerPedidosCliente(clienteId);
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
      }
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
    } finally {
      setCargando(false);
    }
  };

  // Función para renderizar el estado del pedido (simulado)
  const obtenerEstadoPedido = (fecha: string) => {
    const fechaPedido = new Date(fecha);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora.getTime() - fechaPedido.getTime()) / (1000 * 3600 * 24));
    
    if (diferenciaDias === 0) return { estado: 'En preparación', color: 'bg-yellow-100 text-yellow-800' };
    if (diferenciaDias <= 1) return { estado: 'Entregado', color: 'bg-green-100 text-green-800' };
    return { estado: 'Completado', color: 'bg-gray-100 text-gray-800' };
  };

  // Verificar si el usuario es admin
  if (!esAdmin) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta sección</p>
          <button
            onClick={() => onCambiarPantalla('admin')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Volver al Panel Admin
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
          <p className="text-xl text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Cliente No Encontrado</h1>
          <p className="text-gray-600 mb-6">No se pudo encontrar la información del cliente</p>
          <button
            onClick={() => onCambiarPantalla('admin')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Volver al Panel Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    // Contenedor principal de la pantalla de detalle del cliente
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner del cliente mejorado */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Información del cliente */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-6 mb-6">
                {/* Avatar del cliente */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">👤</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Perfil del Cliente
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
                      <span className="text-blue-300 font-medium">Cliente Premium</span>
                    </div>
                    <div className="text-gray-300 text-lg">
                      <span className="font-bold text-white">{cliente.nombre}</span> (@{cliente.username})
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Información rápida del cliente */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📧</div>
                  <div className="text-sm font-medium text-white truncate">{cliente.email}</div>
                  <div className="text-xs text-gray-300">Email</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📞</div>
                  <div className="text-sm font-medium text-white">{cliente.telefono}</div>
                  <div className="text-xs text-gray-300">Teléfono</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📅</div>
                  <div className="text-sm font-medium text-white">
                    {new Date(cliente.fecha_registro).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-300">Registro</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="text-sm font-medium text-white">{pedidosCliente.length}</div>
                  <div className="text-xs text-gray-300">Pedidos</div>
                </div>
              </div>
            </div>

            {/* Panel de puntos destacado */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-center shadow-2xl border border-purple-400/30">
                <div className="text-4xl mb-4">⭐</div>
                <div className="text-sm text-purple-100 mb-2">Puntos de Lealtad</div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {cliente.puntos}
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-sm text-purple-100">
                    Total gastado: €{estadisticasCliente.totalGastado?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                {/* Botón de acción rápida */}
                <button
                  onClick={() => {
                    const puntosAgregar = prompt('¿Cuántos puntos quieres agregar?');
                    if (puntosAgregar && !isNaN(Number(puntosAgregar))) {
                      baseDatos.agregarPuntos(cliente.id_cliente, Number(puntosAgregar));
                      cargarDatosCliente();
                    }
                  }}
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
                >
                  ➕ Agregar Puntos
                </button>
              </div>
            </div>
          </div>

          {/* Acciones rápidas mejoradas */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => {
                window.open(`mailto:${cliente.email}?subject=BarrasoBurger - Contacto&body=Hola ${cliente.nombre},%0D%0A%0D%0A`, '_blank');
              }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📧</div>
              <div className="text-lg font-bold text-white mb-1">Enviar Email</div>
              <div className="text-sm text-gray-300">Contactar al cliente directamente</div>
            </button>
            
            <button
              onClick={() => {
                window.open(`tel:${cliente.telefono}`, '_blank');
              }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📞</div>
              <div className="text-lg font-bold text-white mb-1">Llamar Cliente</div>
              <div className="text-sm text-gray-300">Contacto telefónico directo</div>
            </button>
            
            <button
              onClick={() => onCambiarPantalla('admin')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔙</div>
              <div className="text-lg font-bold text-white mb-1">Volver al Panel</div>
              <div className="text-sm text-gray-300">Panel de administración</div>
            </button>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Botón de regreso */}
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla('admin')}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver al Panel Admin
            </button>
          </div>

          {/* Información del cliente y estadísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Información personal */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">👤</span>
                Información Personal
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo:</label>
                  <p className="text-gray-800 font-medium">{cliente.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Código Único:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono font-bold">
                      {cliente.codigo_unico}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cliente.codigo_unico);
                        alert('Código copiado al portapapeles');
                      }}
                      className="text-purple-600 hover:text-purple-700 text-xs"
                      title="Copiar código"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Usuario:</label>
                  <p className="text-gray-800 font-medium">@{cliente.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">DNI:</label>
                  <p className="text-gray-800 font-medium">{cliente.dni || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email:</label>
                  <p className="text-gray-800 font-medium">{cliente.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono:</label>
                  <p className="text-gray-800 font-medium">{cliente.telefono}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Registro:</label>
                  <p className="text-gray-800 font-medium">
                    {new Date(cliente.fecha_registro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas de compras */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Estadísticas de Compras
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    €{estadisticasCliente.totalGastado?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Gastado</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {estadisticasCliente.totalPedidos}
                  </div>
                  <div className="text-sm text-gray-600">Pedidos Realizados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    €{estadisticasCliente.promedioGasto?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Promedio por Pedido</div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                Información Adicional
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Puntos de Lealtad:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">{cliente.puntos}</span>
                    <span className="text-sm text-gray-600">puntos</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Producto Favorito:</label>
                  <p className="text-gray-800 font-medium">{estadisticasCliente.productoFavorito}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Último Pedido:</label>
                  <p className="text-gray-800 font-medium">
                    {estadisticasCliente.ultimoPedido 
                      ? new Date(estadisticasCliente.ultimoPedido).toLocaleDateString('es-ES')
                      : 'Ninguno'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado:</label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Cliente Activo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de pedidos */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">📦</span>
                  Historial de Pedidos ({pedidosCliente.length})
                </h3>
                <button
                  onClick={cargarDatosCliente}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm"
                >
                  🔄 Actualizar
                </button>
              </div>
            </div>

            {pedidosCliente.length === 0 ? (
              // Sin pedidos
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  Sin Pedidos Realizados
                </h4>
                <p className="text-gray-600">
                  Este cliente aún no ha realizado ningún pedido
                </p>
              </div>
            ) : (
              // Lista de pedidos
              <div className="divide-y divide-gray-200">
                {pedidosCliente.map((pedido) => {
                  const estadoPedido = obtenerEstadoPedido(pedido.fecha);
                  
                  return (
                    <div key={pedido.id_pedido} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-800">
                              Pedido #{pedido.id_pedido}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoPedido.color}`}>
                              {estadoPedido.estado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            📅 {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            🛍️ {pedido.productos.length} productos
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            €{pedido.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            +{Math.floor(pedido.total)} pts ganados
                          </div>
                        </div>
                      </div>
                      
                      {/* Productos del pedido */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                          <span className="text-lg mr-2">🍔</span>
                          Productos del Pedido:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pedido.productos.map((producto) => (
                            <div key={producto.id_detalle} className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-800">
                                  {producto.cantidad}x {producto.producto}
                                </span>
                                <div className="text-xs text-gray-500">
                                  €{producto.precio_unitario.toFixed(2)} c/u
                                </div>
                              </div>
                              <span className="font-bold text-orange-600">
                                €{(producto.precio_unitario * producto.cantidad).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Productos más pedidos */}
          {Object.keys(estadisticasCliente.productosContador || {}).length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Productos Más Pedidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(estadisticasCliente.productosContador || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 6)
                  .map(([producto, cantidad], index) => (
                    <div key={producto} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{producto}</div>
                          <div className="text-sm text-gray-500">
                            {index === 0 && '🥇'} 
                            {index === 1 && '🥈'} 
                            {index === 2 && '🥉'} 
                            {index > 2 && `#${index + 1}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">{cantidad as number}</div>
                          <div className="text-xs text-gray-500">veces pedido</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Acciones administrativas */}
          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-2">🔧</span>
              Acciones Administrativas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Agregar puntos */}
              <button
                onClick={() => {
                  const puntosAgregar = prompt('¿Cuántos puntos quieres agregar?');
                  if (puntosAgregar && !isNaN(Number(puntosAgregar))) {
                    baseDatos.agregarPuntos(cliente.id_cliente, Number(puntosAgregar));
                    cargarDatosCliente();
                  }
                }}
                className="bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">➕</span>
                Agregar Puntos
              </button>

              {/* Regenerar código único */}
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres regenerar el código único? El código anterior dejará de funcionar.')) {
                    const nuevoCodigo = baseDatos.regenerarCodigoUnico(cliente.id_cliente);
                    if (nuevoCodigo) {
                      alert(`Nuevo código generado: ${nuevoCodigo}`);
                      cargarDatosCliente();
                    }
                  }
                }}
                className="bg-purple-600 text-white p-4 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">🔄</span>
                Regenerar Código
              </button>

              {/* Enviar email */}
              <button
                onClick={() => {
                  window.open(`mailto:${cliente.email}?subject=BarrasoBurger - Tu Código Único&body=Hola ${cliente.nombre},%0D%0A%0D%0ATu código único para ganar puntos en el restaurante es: ${cliente.codigo_unico}%0D%0A%0D%0AMuestra este código al empleado cuando hagas un pedido en el local.%0D%0A%0D%0ASaludos,%0D%0AEquipo BarrasoBurger`, '_blank');
                }}
                className="bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📧</span>
                Enviar Código por Email
              </button>

              {/* Llamar por teléfono */}
              <button
                onClick={() => {
                  window.open(`tel:${cliente.telefono}`, '_blank');
                }}
                className="bg-orange-600 text-white p-4 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📞</span>
                Llamar Cliente
              </button>
            </div>
          </div>

          {/* Resumen de actividad reciente */}
          {pedidosCliente.length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                Actividad Reciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gráfico de gastos por mes (simulado) */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Gastos por Mes</h4>
                  <div className="space-y-2">
                    {['Enero', 'Febrero', 'Marzo'].map((mes, index) => {
                      const gasto = Math.random() * 100 + 20; // Datos simulados
                      return (
                        <div key={mes} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{mes}:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full"
                                style={{ width: `${(gasto / 120) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              €{gasto.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frecuencia de pedidos */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Frecuencia de Pedidos</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Esta semana:</span>
                      <span className="font-bold text-green-600">
                        {pedidosCliente.filter(p => {
                          const fecha = new Date(p.fecha);
                          const ahora = new Date();
                          const diferencia = ahora.getTime() - fecha.getTime();
                          return diferencia <= 7 * 24 * 60 * 60 * 1000;
                        }).length} pedidos
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Este mes:</span>
                      <span className="font-bold text-blue-600">
                        {pedidosCliente.filter(p => {
                          const fecha = new Date(p.fecha);
                          const ahora = new Date();
                          return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
                        }).length} pedidos
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total histórico:</span>
                      <span className="font-bold text-orange-600">
                        {pedidosCliente.length} pedidos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
