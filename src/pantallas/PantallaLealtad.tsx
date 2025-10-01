import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Pedido } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaLealtad {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas') => void;
  onRepetirPedido?: (pedido: Pedido) => void;
}

// Interfaz para los datos del usuario del programa de lealtad
interface DatosUsuario {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
}

// Componente de la pantalla del programa de lealtad
export function PantallaLealtad({ onCambiarPantalla, onRepetirPedido }: PropsPantallaLealtad) {
  // Hook de autenticación
  const { usuarioActual, clienteActual, estaAutenticado, esCliente } = useAuth();
  
  // Estados para los datos del cliente
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([]);
  const [historialPuntos, setHistorialPuntos] = useState<any[]>([]);
  
  // Estado para los datos del formulario de registro (para usuarios no autenticados)
  const [datosUsuario, setDatosUsuario] = useState<DatosUsuario>({
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: ''
  });

  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    if (estaAutenticado && esCliente && clienteActual) {
      cargarDatosCliente();
    }
  }, [estaAutenticado, esCliente, clienteActual]);

  // Función para cargar datos del cliente
  const cargarDatosCliente = () => {
    if (clienteActual) {
      // Obtener pedidos del cliente
      const pedidos = baseDatos.obtenerPedidosCliente(clienteActual.id_cliente);
      setPedidosCliente(pedidos);
      
      // Crear historial de puntos basado en los pedidos
      const historial = pedidos.map(pedido => ({
        fecha: pedido.fecha,
        descripcion: `Compra - Pedido #${pedido.id_pedido}`,
        puntos: Math.floor(pedido.total), // 1 punto por cada euro gastado
        tipo: 'ganado'
      })).reverse(); // Mostrar los más recientes primero
      
      setHistorialPuntos(historial);
    }
  };


  // Función para manejar cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar el registro (para usuarios no autenticados)
  const manejarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirigir a la pantalla de login para registrarse
    onCambiarPantalla('login');
  };

  // Función para canjear beneficio
  const canjearBeneficio = (puntosRequeridos: number, nombreBeneficio: string) => {
    if (clienteActual && clienteActual.puntos >= puntosRequeridos) {
      if (confirm(`¿Quieres canjear ${puntosRequeridos} puntos por ${nombreBeneficio}?`)) {
        // Restar puntos del cliente
        baseDatos.agregarPuntos(clienteActual.id_cliente, -puntosRequeridos);
        
        // Agregar al historial
        const nuevoHistorial = {
          fecha: new Date().toISOString(),
          descripcion: `Canje - ${nombreBeneficio}`,
          puntos: -puntosRequeridos,
          tipo: 'canjeado'
        };
        
        setHistorialPuntos(prev => [nuevoHistorial, ...prev]);
        
        // Recargar datos
        cargarDatosCliente();
        
        alert(`¡Beneficio canjeado exitosamente! ${nombreBeneficio} ha sido agregado a tu cuenta.`);
      }
    }
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
      alert(`¡Pedido #${pedido.id_pedido} agregado al carrito! Todos los productos han sido añadidos.`);
      // Ir al carrito para que vea los productos agregados
      onCambiarPantalla('carrito');
    }
  };

  // Beneficios del programa de lealtad
  const beneficios = [
    {
      icono: '🎁',
      titulo: 'Hamburguesa Gratis',
      descripcion: 'Por cada 10 hamburguesas compradas, la siguiente es gratis',
      puntos: 1000
    },
    {
      icono: '🍟',
      titulo: 'Acompañamiento Gratis',
      descripcion: 'Papas fritas o aros de cebolla sin costo adicional',
      puntos: 500
    },
    {
      icono: '🥤',
      titulo: 'Bebida Gratis',
      descripcion: 'Cualquier bebida de nuestro menú completamente gratis',
      puntos: 300
    },
    {
      icono: '🎂',
      titulo: 'Descuento de Cumpleaños',
      descripcion: '50% de descuento en tu hamburguesa favorita',
      puntos: 0
    },
    {
      icono: '⭐',
      titulo: 'Acceso VIP',
      descripcion: 'Reservas prioritarias y ofertas exclusivas',
      puntos: 2000
    },
    {
      icono: '🎊',
      titulo: 'Combo Especial',
      descripcion: 'Combo completo con 30% de descuento',
      puntos: 800
    }
  ];

  return (
    // Contenedor principal de la pantalla de lealtad
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de bienvenida al programa de lealtad */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
            Programa de Lealtad
          </h1>
          <p className="text-xl animate-fade-in-up">
            Únete a nuestro programa y disfruta de beneficios exclusivos con cada visita
          </p>
        </div>
      </section>
      
      {/* Sección principal del programa de lealtad */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Información del programa */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              ¿Cómo Funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">1️⃣</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Regístrate</h3>
                <p className="text-gray-600">Únete gratis a nuestro programa de lealtad</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">2️⃣</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Acumula Puntos</h3>
                <p className="text-gray-600">Gana puntos con cada compra que realices</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">3️⃣</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Canjea Premios</h3>
                <p className="text-gray-600">Usa tus puntos para obtener beneficios increíbles</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-16">
            
            {/* Panel de usuario o formulario de registro */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
              {estaAutenticado && esCliente && clienteActual ? (
                // Panel de usuario registrado y autenticado
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">
                    ¡Bienvenido, {clienteActual.nombre}!
                  </h2>
                  
                  {/* Puntos actuales */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{clienteActual.puntos}</div>
                      <div className="text-lg">Puntos Disponibles</div>
                    </div>
                  </div>
                  
                  {/* Progreso hacia el siguiente beneficio */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso hacia Hamburguesa Gratis
                      </span>
                      <span className="text-sm text-gray-500">
                        {clienteActual.puntos}/1000 puntos
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((clienteActual.puntos / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Información de cómo ganar puntos */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <span className="text-lg mr-2">💡</span>
                      ¿Cómo ganar puntos?
                    </h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• <strong>1 punto por cada €1 gastado</strong> en pedidos</li>
                      <li>• Puntos se agregan automáticamente después del pago</li>
                      <li>• Revisa tu historial de puntos abajo</li>
                    </ul>
                  </div>
                  
                  {/* Historial de puntos */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Historial de Puntos
                    </h3>
                    {historialPuntos.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {historialPuntos.slice(0, 10).map((entrada, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-800">{entrada.descripcion}</div>
                              <div className="text-sm text-gray-500">{obtenerTiempoRelativo(entrada.fecha)}</div>
                            </div>
                            <div className={`font-bold ${entrada.puntos > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {entrada.puntos > 0 ? '+' : ''}{entrada.puntos} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📝</div>
                        <p>Aún no tienes historial de puntos</p>
                        <p className="text-sm">¡Haz tu primer pedido para empezar a ganar puntos!</p>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas del cliente */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{pedidosCliente.length}</div>
                      <div className="text-sm text-gray-600">Pedidos Realizados</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        €{pedidosCliente.reduce((total, pedido) => total + pedido.total, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Total Gastado</div>
                    </div>
                  </div>

                  {/* Botón para ver pedidos detallados */}
                  {pedidosCliente.length > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          const elemento = document.getElementById('historial-pedidos');
                          if (elemento) {
                            elemento.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                        </svg>
                        Ver Historial Completo de Pedidos
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Mensaje para usuarios no autenticados
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                  <div className="text-6xl mb-6">🔐</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Inicia Sesión para Ver tus Puntos
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Accede a tu cuenta para ver tus puntos de lealtad, historial de compras y canjear beneficios exclusivos.
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => onCambiarPantalla('login')}
                      className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors duration-300"
                    >
                      Iniciar Sesión
                    </button>
                    
                    <p className="text-sm text-gray-500">
                      ¿No tienes cuenta? Regístrate en la pantalla de login para comenzar a ganar puntos
                    </p>
                  </div>

                  {/* Información sobre el programa */}
                  <div className="mt-8 bg-orange-50 p-6 rounded-lg">
                    <h4 className="font-bold text-orange-800 mb-3">¿Qué obtienes al registrarte?</h4>
                    <ul className="text-orange-700 text-sm space-y-2 text-left">
                      <li>• <strong>1 punto por cada €1 gastado</strong></li>
                      <li>• Beneficios exclusivos y descuentos</li>
                      <li>• Hamburguesas y bebidas gratis</li>
                      <li>• Ofertas especiales en tu cumpleaños</li>
                      <li>• Acceso prioritario a nuevos productos</li>
                    </ul>
                  </div>
                </div>
              )}
              </div>
              
              {/* Beneficios disponibles */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                  Beneficios Disponibles
                </h2>
                
                <div className="space-y-4">
                  {beneficios.map((beneficio, index) => (
                    <div
                      key={index}
                      className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-300 ${
                        estaAutenticado && esCliente && clienteActual && clienteActual.puntos >= beneficio.puntos && beneficio.puntos > 0
                          ? 'border-2 border-green-500 hover:shadow-xl'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{beneficio.icono}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {beneficio.titulo}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {beneficio.descripcion}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-orange-600 font-bold">
                              {beneficio.puntos === 0 ? 'Gratis en tu cumpleaños' : `${beneficio.puntos} puntos`}
                            </span>
                            
                            {/* Mostrar botones solo si está autenticado */}
                            {estaAutenticado && esCliente && clienteActual ? (
                              <>
                                {/* Si tiene suficientes puntos y no es beneficio de cumpleaños */}
                                {clienteActual.puntos >= beneficio.puntos && beneficio.puntos > 0 && (
                                  <button 
                                    onClick={() => canjearBeneficio(beneficio.puntos, beneficio.titulo)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                                  >
                                    Canjear
                                  </button>
                                )}
                                
                                {/* Si no tiene suficientes puntos */}
                                {clienteActual.puntos < beneficio.puntos && beneficio.puntos > 0 && (
                                  <span className="text-gray-400 text-sm">
                                    Necesitas {beneficio.puntos - clienteActual.puntos} puntos más
                                  </span>
                                )}
                                
                                {/* Beneficio de cumpleaños */}
                                {beneficio.puntos === 0 && (
                                  <span className="text-green-600 text-sm font-medium">
                                    Disponible en tu cumpleaños
                                  </span>
                                )}
                              </>
                            ) : (
                              // Si no está autenticado
                              <button
                                onClick={() => onCambiarPantalla('login')}
                                className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors text-sm"
                              >
                                Inicia Sesión
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Historial de pedidos para clientes autenticados */}
            {estaAutenticado && esCliente && clienteActual && pedidosCliente.length > 0 && (
              <div id="historial-pedidos" className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="text-2xl mr-2">📦</span>
                    Mis Pedidos ({pedidosCliente.length})
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Revisa todos los pedidos que has realizado y los puntos que has ganado
                  </p>
                </div>

                {/* Lista de pedidos del cliente */}
                <div className="divide-y divide-gray-200">
                  {pedidosCliente.slice().reverse().map((pedido) => {
                    // Función para obtener el estado del pedido (ahora usa el estado real)
                    const obtenerEstadoPedido = (pedido: Pedido) => {
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
                        estado: nombres[pedido.estado as keyof typeof nombres] || pedido.estado,
                        color: estadoInfo.color,
                        icono: estadoInfo.icono
                      };
                    };

                    const estadoPedido = obtenerEstadoPedido(pedido);
                    
                    return (
                      <div key={pedido.id_pedido} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">
                                Pedido #{pedido.id_pedido}
                              </h3>
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
                            <div className="text-sm text-green-600 font-medium">
                              +{Math.floor(pedido.total)} pts ganados
                            </div>
                          </div>
                        </div>
                        
                        {/* Productos del pedido */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                            <span className="text-lg mr-2">🍔</span>
                            Productos del Pedido:
                          </h4>
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

                        {/* Información adicional del pedido */}
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500">
                              ⏱️ Tiempo estimado: {pedido.tiempo_estimado || '45-60 min'}
                            </span>
                            <span className="text-gray-500">
                              🚚 Envío: Gratis
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-green-600 font-medium">
                              ⭐ {Math.floor(pedido.total)} puntos ganados
                            </span>
                            <button
                              onClick={() => repetirPedido(pedido)}
                              className="bg-orange-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-orange-700 transition-colors text-xs flex items-center gap-1"
                            >
                              🔄 Repetir
                            </button>
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
                                  {new Date(pedido.fecha_actualizacion || pedido.fecha).toLocaleTimeString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de pedidos */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {pedidosCliente.length}
                      </div>
                      <div className="text-sm text-gray-600">Total de Pedidos</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        €{pedidosCliente.reduce((total, pedido) => total + pedido.total, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Total Gastado</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {pedidosCliente.length > 0 
                          ? (pedidosCliente.reduce((total, pedido) => total + pedido.total, 0) / pedidosCliente.length).toFixed(2)
                          : '0.00'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Promedio por Pedido</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Productos más pedidos por el cliente */}
            {estaAutenticado && esCliente && clienteActual && pedidosCliente.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                  <span className="text-2xl mr-2">🏆</span>
                  Tus Productos Favoritos
                </h2>
                
                {(() => {
                  // Calcular productos más pedidos
                  const productosContador: { [key: string]: number } = {};
                  pedidosCliente.forEach(pedido => {
                    pedido.productos.forEach(producto => {
                      productosContador[producto.producto] = (productosContador[producto.producto] || 0) + producto.cantidad;
                    });
                  });

                  const productosOrdenados = Object.entries(productosContador)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productosOrdenados.map(([producto, cantidad], index) => (
                        <div key={producto} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800">{producto}</div>
                              <div className="text-sm text-gray-500">
                                {index === 0 && '🥇 Tu favorito'} 
                                {index === 1 && '🥈 Segundo lugar'} 
                                {index === 2 && '🥉 Tercer lugar'} 
                                {index > 2 && `#${index + 1} en tu ranking`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-orange-600">{cantidad}</div>
                              <div className="text-xs text-gray-500">veces pedido</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
