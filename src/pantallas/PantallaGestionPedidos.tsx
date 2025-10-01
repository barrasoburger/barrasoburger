import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Pedido } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaGestionPedidos {
  onCambiarPantalla: (pantalla: any) => void;
}

// Componente de la pantalla de gestión de pedidos
export function PantallaGestionPedidos({ onCambiarPantalla }: PropsPantallaGestionPedidos) {
  // Hook de autenticación
  const { usuarioActual, esAdmin, esEmpleado } = useAuth();
  
  // Estados para los datos
  const [pedidos, setPedidos] = useState<(Pedido & { nombreCliente: string })[]>([]);
  const [estadisticasPedidos, setEstadisticasPedidos] = useState<any>({});
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<'hoy' | 'ayer' | 'semana' | 'todos'>('hoy');
  
  // Estados para edición de pedidos
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [tiempoEstimado, setTiempoEstimado] = useState<string>('');
  const [notasCocina, setNotasCocina] = useState<string>('');

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
    
    // Configurar actualización automática cada 30 segundos
    const intervalo = setInterval(cargarDatos, 30000);
    
    // Escuchar eventos de nuevos pedidos y actualizaciones
    const manejarNuevoPedido = () => {
      console.log('Nuevo pedido recibido, actualizando lista...');
      cargarDatos();
    };
    
    const manejarActualizacionEstado = () => {
      console.log('Estado de pedido actualizado, actualizando lista...');
      cargarDatos();
    };

    window.addEventListener('nuevoPedido', manejarNuevoPedido);
    window.addEventListener('estadoPedidoActualizado', manejarActualizacionEstado);
    
    return () => {
      clearInterval(intervalo);
      window.removeEventListener('nuevoPedido', manejarNuevoPedido);
      window.removeEventListener('estadoPedidoActualizado', manejarActualizacionEstado);
    };
  }, []);

  // Función para cargar todos los datos
  const cargarDatos = () => {
    const todosPedidos = baseDatos.obtenerPedidosPorEstado('todos');
    setPedidos(todosPedidos);
    
    const estadisticas = baseDatos.obtenerEstadisticasPedidos();
    setEstadisticasPedidos(estadisticas);
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (estado: string) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'preparando': 'bg-orange-100 text-orange-800',
      'listo': 'bg-green-100 text-green-800',
      'en_camino': 'bg-purple-100 text-purple-800',
      'entregado': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener el icono del estado
  const obtenerIconoEstado = (estado: string) => {
    const iconos = {
      'pendiente': '⏳',
      'confirmado': '✅',
      'preparando': '👨‍🍳',
      'listo': '🍽️',
      'en_camino': '🚚',
      'entregado': '📦',
      'cancelado': '❌'
    };
    return iconos[estado as keyof typeof iconos] || '❓';
  };

  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estado: string) => {
    const nombres = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'preparando': 'Preparando',
      'listo': 'Listo para Entrega',
      'en_camino': 'En Camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return nombres[estado as keyof typeof nombres] || estado;
  };

  // Función para actualizar estado del pedido
  const actualizarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pedidoEditando) {
      const exito = baseDatos.actualizarEstadoPedido(
        pedidoEditando.id_pedido,
        nuevoEstado as any,
        tiempoEstimado,
        notasCocina
      );
      
      if (exito) {
        alert('Estado del pedido actualizado exitosamente');
        setPedidoEditando(null);
        setNuevoEstado('');
        setTiempoEstimado('');
        setNotasCocina('');
        cargarDatos();
      }
    }
  };

  // Función para editar pedido
  const editarPedido = (pedido: Pedido & { nombreCliente: string }) => {
    setPedidoEditando(pedido);
    setNuevoEstado(pedido.estado);
    setTiempoEstimado(pedido.tiempo_estimado || '');
    setNotasCocina(pedido.notas_cocina || '');
  };

  // Función para filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro por estado
    const coincideEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    
    // Filtro por fecha
    let coincideFecha = true;
    const fechaPedido = new Date(pedido.fecha);
    const ahora = new Date();
    
    switch (filtroFecha) {
      case 'hoy':
        coincideFecha = fechaPedido.toDateString() === ahora.toDateString();
        break;
      case 'ayer':
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        coincideFecha = fechaPedido.toDateString() === ayer.toDateString();
        break;
      case 'semana':
        const semanaAtras = new Date(ahora);
        semanaAtras.setDate(semanaAtras.getDate() - 7);
        coincideFecha = fechaPedido >= semanaAtras;
        break;
      case 'todos':
        coincideFecha = true;
        break;
    }
    
    return coincideEstado && coincideFecha;
  });

  // Verificar permisos
  if (!esAdmin && !esEmpleado) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo administradores y empleados pueden gestionar pedidos</p>
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
    // Contenedor principal
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📋 Gestión de Pedidos</h1>
              <p className="text-xl text-blue-100">
                Panel de control para gestionar pedidos en tiempo real
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full backdrop-blur-sm">
                  <span className="text-blue-200 font-medium">
                    {esAdmin ? '👑 Administrador' : '👨‍💼 Empleado'}
                  </span>
                </div>
                <div className="text-blue-100">
                  Bienvenido, <span className="font-bold text-white">{usuarioActual?.username}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-200">
                {estadisticasPedidos.pedidosHoy || 0}
              </div>
              <div className="text-sm text-blue-100">Pedidos Hoy</div>
              <div className="text-xs text-blue-200 mt-1">
                {(estadisticasPedidos.pedidosPorEstado?.pendiente || 0) + 
                 (estadisticasPedidos.pedidosPorEstado?.confirmado || 0) + 
                 (estadisticasPedidos.pedidosPorEstado?.preparando || 0)} pedidos activos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Estadísticas de pedidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-xl font-bold text-yellow-600">{estadisticasPedidos.pedidosPorEstado?.pendiente || 0}</div>
              <div className="text-xs text-gray-600">Pendientes</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-xl font-bold text-blue-600">{estadisticasPedidos.pedidosPorEstado?.confirmado || 0}</div>
              <div className="text-xs text-gray-600">Confirmados</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">👨‍🍳</div>
              <div className="text-xl font-bold text-orange-600">{estadisticasPedidos.pedidosPorEstado?.preparando || 0}</div>
              <div className="text-xs text-gray-600">Preparando</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">🍽️</div>
              <div className="text-xl font-bold text-green-600">{estadisticasPedidos.pedidosPorEstado?.listo || 0}</div>
              <div className="text-xs text-gray-600">Listos</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">🚚</div>
              <div className="text-xl font-bold text-purple-600">{estadisticasPedidos.pedidosPorEstado?.en_camino || 0}</div>
              <div className="text-xs text-gray-600">En Camino</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-xl font-bold text-gray-600">{estadisticasPedidos.pedidosPorEstado?.entregado || 0}</div>
              <div className="text-xs text-gray-600">Entregados</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-xl font-bold text-green-600">€{estadisticasPedidos.ingresoHoy?.toFixed(0) || '0'}</div>
              <div className="text-xs text-gray-600">Ingresos Hoy</div>
            </div>
          </div>

          {/* Controles y filtros */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Lista de Pedidos</h2>
                <p className="text-gray-600">
                  {esAdmin 
                    ? 'Gestiona y actualiza el estado de todos los pedidos (Acceso completo)'
                    : 'Gestiona pedidos y actualiza estados (Acceso de empleado)'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cargarDatos}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>🔄</span>
                  Actualizar
                </button>
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                  🟢 Actualización automática cada 30s
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  esAdmin 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {esAdmin ? '👑 Admin' : '👨‍💼 Empleado'}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">⏳ Pendientes</option>
                  <option value="confirmado">✅ Confirmados</option>
                  <option value="preparando">👨‍🍳 Preparando</option>
                  <option value="listo">🍽️ Listos</option>
                  <option value="en_camino">🚚 En Camino</option>
                  <option value="entregado">📦 Entregados</option>
                  <option value="cancelado">❌ Cancelados</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por fecha:</label>
                <select
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hoy">📅 Hoy</option>
                  <option value="ayer">📅 Ayer</option>
                  <option value="semana">📅 Última semana</option>
                  <option value="todos">📅 Todos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de debugging */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
            <h4 className="font-bold text-blue-800 mb-2">Información de Pedidos:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Total de pedidos:</strong> {pedidos.length}
              </div>
              <div>
                <strong>Filtro actual:</strong> {filtroEstado} / {filtroFecha}
              </div>
              <div>
                <strong>Pedidos filtrados:</strong> {pedidosFiltrados.length}
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-700">
              Estados disponibles: {pedidos.map(p => p.estado).join(', ')}
            </div>
          </div>

          {/* Lista de pedidos */}
          <div className="space-y-4">
            {pedidosFiltrados.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-lg text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No hay pedidos</h3>
                <p className="text-gray-600">No se encontraron pedidos con los filtros seleccionados</p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Filtro estado: {filtroEstado}</p>
                  <p>Filtro fecha: {filtroFecha}</p>
                  <p>Total pedidos en BD: {pedidos.length}</p>
                </div>
              </div>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <div key={pedido.id_pedido} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Información del pedido */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            Pedido #{pedido.id_pedido}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            Cliente: <strong>{pedido.nombreCliente}</strong>
                          </p>
                          <p className="text-sm text-gray-500">
                            📅 {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            €{pedido.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pedido.metodo_pago}
                          </div>
                        </div>
                      </div>

                      {/* Productos del pedido */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                        <div className="space-y-1">
                          {pedido.productos.map((producto) => (
                            <div key={producto.id_detalle} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {producto.cantidad}x {producto.producto}
                              </span>
                              <span className="font-medium text-gray-800">
                                €{(producto.precio_unitario * producto.cantidad).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Información de entrega */}
                      {pedido.direccion_entrega && (
                        <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-1">📍 Dirección de Entrega:</h5>
                          <p className="text-blue-700 text-sm">{pedido.direccion_entrega}</p>
                          <p className="text-blue-600 text-sm">📞 {pedido.telefono_contacto}</p>
                        </div>
                      )}

                      {/* Notas de cocina */}
                      {pedido.notas_cocina && (
                        <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                          <h5 className="font-medium text-yellow-800 mb-1">📝 Notas de Cocina:</h5>
                          <p className="text-yellow-700 text-sm">{pedido.notas_cocina}</p>
                        </div>
                      )}
                    </div>

                    {/* Estado y acciones */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-col h-full">
                        {/* Estado actual */}
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-800 mb-3">Estado Actual:</h4>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${obtenerColorEstado(pedido.estado)}`}>
                              <span>{obtenerIconoEstado(pedido.estado)}</span>
                              {obtenerNombreEstado(pedido.estado)}
                            </span>
                            {pedido.tiempo_estimado && (
                              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                ⏱️ {pedido.tiempo_estimado}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Última actualización: {new Date(pedido.fecha_actualizacion).toLocaleString('es-ES')}
                          </p>
                        </div>

                        {/* Acciones rápidas */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {pedido.estado === 'pendiente' && (
                            <button
                              onClick={() => {
                                baseDatos.actualizarEstadoPedido(pedido.id_pedido, 'confirmado', '45-60 min');
                                cargarDatos();
                              }}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                            >
                              ✅ Confirmar
                            </button>
                          )}
                          {pedido.estado === 'confirmado' && (
                            <button
                              onClick={() => {
                                baseDatos.actualizarEstadoPedido(pedido.id_pedido, 'preparando', '30-40 min');
                                cargarDatos();
                              }}
                              className="bg-orange-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm"
                            >
                              👨‍🍳 Preparar
                            </button>
                          )}
                          {pedido.estado === 'preparando' && (
                            <button
                              onClick={() => {
                                baseDatos.actualizarEstadoPedido(pedido.id_pedido, 'listo', '5-10 min');
                                cargarDatos();
                              }}
                              className="bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                            >
                              🍽️ Listo
                            </button>
                          )}
                          {pedido.estado === 'listo' && (
                            <button
                              onClick={() => {
                                baseDatos.actualizarEstadoPedido(pedido.id_pedido, 'en_camino', '15-25 min');
                                cargarDatos();
                              }}
                              className="bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                            >
                              🚚 Enviar
                            </button>
                          )}
                          {pedido.estado === 'en_camino' && (
                            <button
                              onClick={() => {
                                baseDatos.actualizarEstadoPedido(pedido.id_pedido, 'entregado');
                                cargarDatos();
                              }}
                              className="bg-gray-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                            >
                              📦 Entregar
                            </button>
                          )}
                          
                          {/* Botón de editar siempre disponible */}
                          <button
                            onClick={() => editarPedido(pedido)}
                            className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                          >
                            ✏️ Editar
                          </button>
                          
                          {/* Botón de cancelar (solo admin o si no está entregado) */}
                          {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                            <button
                              onClick={() => {
                                if (!esAdmin && !confirm('Como empleado, ¿estás seguro de que quieres cancelar este pedido? Esta acción será registrada.')) {
                                  return;
                                }
                                if (esAdmin || confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
                                  baseDatos.actualizarEstadoPedido(pedido.id_pedido, 'cancelado');
                                  cargarDatos();
                                }
                              }}
                              className="bg-red-100 text-red-800 px-3 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                            >
                              ❌ Cancelar
                            </button>
                          )}
                        </div>

                        {/* Información adicional */}
                        <div className="mt-auto">
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>🆔 ID: {pedido.id_pedido}</div>
                            <div>👤 Cliente ID: {pedido.id_cliente}</div>
                            <div>🛍️ {pedido.productos.length} productos</div>
                            {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                              <div className="text-green-600 font-medium">
                                🕒 Tiempo restante: {pedido.tiempo_estimado}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal para editar pedido */}
          {pedidoEditando && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">
                        ✏️ Editar Pedido #{pedidoEditando.id_pedido}
                      </h3>
                      <p className="text-blue-100 mt-1">
                        Cliente: {pedidos.find(p => p.id_pedido === pedidoEditando.id_pedido)?.nombreCliente}
                      </p>
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          esAdmin 
                            ? 'bg-red-500/20 text-red-200 border border-red-400/30' 
                            : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                        }`}>
                          {esAdmin ? '👑 Acceso Admin' : '👨‍💼 Acceso Empleado'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPedidoEditando(null)}
                      className="text-blue-200 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={actualizarEstado} className="p-6 space-y-6">
                  {/* Estado del pedido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Pedido *
                    </label>
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="confirmado">✅ Confirmado</option>
                      <option value="preparando">👨‍🍳 Preparando</option>
                      <option value="listo">🍽️ Listo para Entrega</option>
                      <option value="en_camino">🚚 En Camino</option>
                      <option value="entregado">📦 Entregado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </div>

                  {/* Tiempo estimado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo Estimado
                    </label>
                    <input
                      type="text"
                      value={tiempoEstimado}
                      onChange={(e) => setTiempoEstimado(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 25-30 min, 5-10 min"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo estimado para el siguiente paso o entrega
                    </p>
                  </div>

                  {/* Notas de cocina */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas de Cocina
                    </label>
                    <textarea
                      value={notasCocina}
                      onChange={(e) => setNotasCocina(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Instrucciones especiales, modificaciones, etc."
                    />
                  </div>

                  {/* Información del pedido */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Información del Pedido:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Total:</strong> €{pedidoEditando.total.toFixed(2)}
                      </div>
                      <div>
                        <strong>Productos:</strong> {pedidoEditando.productos.length}
                      </div>
                      <div>
                        <strong>Método de pago:</strong> {pedidoEditando.metodo_pago || 'No especificado'}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {pedidoEditando.telefono_contacto || 'No especificado'}
                      </div>
                    </div>
                    {pedidoEditando.direccion_entrega && (
                      <div className="mt-2">
                        <strong>Dirección:</strong> {pedidoEditando.direccion_entrega}
                      </div>
                    )}
                    
                    {/* Información de permisos */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          esAdmin 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {esAdmin ? '👑 Admin' : '👨‍💼 Empleado'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {esAdmin 
                            ? 'Acceso completo a todas las funciones'
                            : 'Puede gestionar estados y tiempos de pedidos'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setPedidoEditando(null)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                      💾 Actualizar Pedido
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
