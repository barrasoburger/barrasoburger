import React, { useState } from 'react';
import { useAuth } from '../contextos/ContextoAuth';
import { useIdioma } from '../contextos/ContextoIdioma';
import { baseDatos } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsEncabezadoPrincipal {
  onCambiarPantalla: (pantalla: any) => void;
}

// Componente del encabezado principal con logo, navegación y selector de idioma
export function EncabezadoPrincipal({ onCambiarPantalla }: PropsEncabezadoPrincipal) {
  // Estado para controlar si el menú móvil está abierto o cerrado
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
  // Estado para controlar si el selector de idioma está abierto
  const [selectorIdiomaAbierto, setSelectorIdiomaAbierto] = useState(false);
  
  // Estado para controlar el menú de usuario
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  // Hook de autenticación
  const { usuarioActual, clienteActual, estaAutenticado, esAdmin, esEmpleado, esCliente, cerrarSesion } = useAuth();
  
  // Hook de idioma
  const { idiomaActual, cambiarIdioma, t } = useIdioma();

  // Función para manejar la navegación y cerrar menús
  const manejarNavegacion = (pantalla: any) => {
    onCambiarPantalla(pantalla);
    setMenuMovilAbierto(false);
    setMenuUsuarioAbierto(false);
  };

  // Función para manejar el cierre de sesión
  const manejarCerrarSesion = () => {
    cerrarSesion();
    setMenuUsuarioAbierto(false);
    onCambiarPantalla('login');
  };

  return (
    // Header fijo en la parte superior con fondo semi-transparente
    <header className="sticky top-0 z-50 bg-orange-50/95 backdrop-blur-sm border-b border-orange-200">
      {/* Contenedor principal del header con padding y flexbox */}
      <div className="flex items-center justify-between px-10 py-5">
        
        {/* Sección del logo y nombre de la marca */}
        <div className="flex items-center gap-3 text-gray-800">
          {/* Contenedor del logo con tamaño fijo */}
          <div className="w-12 h-12">
            {/* Logo oficial de BarrasoBurger */}
            <img 
              src="https://c.animaapp.com/mfw94os5XM7vEN/img/logohamburgeseria_1.png" 
              alt="Logo BarrasoBurger" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Nombre de la marca con tipografía grande y negrita */}
          <h2 className="text-gray-800 text-3xl font-bold tracking-tight">BarrasoBurger</h2>
        </div>

        {/* Navegación principal - solo visible en pantallas medianas y grandes */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Enlaces básicos */}
          <button 
            className="text-gray-700 text-base font-medium hover:text-orange-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-orange-50"
            onClick={() => manejarNavegacion('inicio')}
          >
            {t('header.inicio')}
          </button>
          <button 
            className="text-gray-700 text-base font-medium hover:text-orange-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-orange-50"
            onClick={() => manejarNavegacion('menu')}
          >
            {t('header.menu')}
          </button>
          <button 
            className="text-gray-700 text-base font-medium hover:text-orange-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-orange-50"
            onClick={() => manejarNavegacion('reservas')}
          >
            {t('header.reservas')}
          </button>
          
          {/* Separador visual */}
          <div className="h-6 w-px bg-gray-300"></div>
          
          {/* Mostrar opciones diferentes según el rol del usuario */}
          {esAdmin ? (
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-green-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-green-50 border border-green-200 hover:border-green-300"
                onClick={() => manejarNavegacion('gestion-productos')}
              >
                <span className="text-base">🍔</span>
                <span>Productos</span>
              </button>
              <button 
                className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
                onClick={() => manejarNavegacion('gestion-pedidos')}
              >
                <span className="text-base">📋</span>
                <span>Pedidos</span>
              </button>
              <button 
                className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-purple-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-purple-50 border border-purple-200 hover:border-purple-300"
                onClick={() => manejarNavegacion('comandas-empleado')}
              >
                <span className="text-base">🍽️</span>
                <span>Comandas</span>
              </button>
            </div>
          ) : esEmpleado ? (
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
                onClick={() => manejarNavegacion('gestion-pedidos')}
              >
                <span className="text-base">📋</span>
                <span>Pedidos</span>
              </button>
              <button 
                className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-purple-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-purple-50 border border-purple-200 hover:border-purple-300"
                onClick={() => manejarNavegacion('comandas-empleado')}
              >
                <span className="text-base">🍽️</span>
                <span>Comandas</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                className="text-gray-700 text-base font-medium hover:text-orange-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-orange-50"
                onClick={() => manejarNavegacion('lealtad')}
              >
                {t('header.lealtad')}
              </button>
              <button 
                className="text-gray-700 text-base font-medium hover:text-orange-600 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-orange-50"
                onClick={() => manejarNavegacion('reseñas')}
              >
                {t('header.reseñas')}
              </button>
            </div>
          )}
        </nav>

        {/* Sección del usuario y configuraciones */}
        <div className="flex items-center gap-4">
          
          {/* Menú de usuario si está autenticado */}
          {estaAutenticado ? (
            <div className="relative">
              <button 
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-orange-600 transition-colors text-lg"
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              >
                <span className="text-2xl">👤</span>
                <span>{(() => {
                  const { clienteActual, esCliente } = useAuth();
                  return esCliente && clienteActual ? clienteActual.nombre : usuarioActual?.username;
                })()}</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>
              
              {/* Dropdown del menú de usuario */}
              {menuUsuarioAbierto && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-orange-200 z-10">
                  {/* Header del menú */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="text-sm font-bold text-gray-800">
                      {esCliente && clienteActual ? clienteActual.nombre : usuarioActual?.username}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {esCliente && clienteActual ? `@${usuarioActual?.username}` : usuarioActual?.rol}
                    </div>
                  </div>
                  
                  {/* Opciones del menú */}
                  <div className="py-2">
                    {esAdmin && (
                      <>
                        <button 
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-600 hover:text-white transition-colors"
                          onClick={() => manejarNavegacion('admin')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>🔧</span>
                              <span>{t('header.panelAdmin')}</span>
                            </span>
                            <div className="flex items-center gap-1 flex-nowrap">
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                Admin
                              </span>
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {(() => {
                                  const stats = baseDatos.obtenerEstadisticas();
                                  return stats.totalUsuarios;
                                })()} usuarios
                              </span>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-600 hover:text-white transition-colors"
                          onClick={() => manejarNavegacion('gestion-productos')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>🍔</span>
                              <span>Gestionar Productos</span>
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                              Admin
                            </span>
                          </div>
                        </button>
                      </>
                    )}
                    
                    {/* Gestión de pedidos para admin y empleados */}
                    {(esAdmin || esEmpleado) && (
                      <>
                        <button 
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition-colors"
                          onClick={() => manejarNavegacion('gestion-pedidos')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>📋</span>
                              <span>Gestionar Pedidos</span>
                            </span>
                            <div className="flex items-center gap-1 flex-nowrap">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {(() => {
                                  const stats = baseDatos.obtenerEstadisticasPedidos();
                                  return stats.pedidosHoy || 0;
                                })()} hoy
                              </span>
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {(() => {
                                  const stats = baseDatos.obtenerEstadisticasPedidos();
                                  return (stats.pedidosPorEstado?.pendiente || 0) + (stats.pedidosPorEstado?.confirmado || 0) + (stats.pedidosPorEstado?.preparando || 0);
                                })()} activos
                              </span>
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {esAdmin ? 'Admin' : 'Staff'}
                              </span>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-600 hover:text-white transition-colors"
                          onClick={() => manejarNavegacion('comandas-empleado')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>🍽️</span>
                              <span>Tomar Comandas</span>
                            </span>
                            <div className="flex items-center gap-1 flex-nowrap">
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                Restaurante
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {esAdmin ? 'Admin' : 'Staff'}
                              </span>
                            </div>
                          </div>
                        </button>
                      </>
                    )}
                    
                    {esCliente && clienteActual && (
                      <>
                        <button 
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-600 hover:text-white transition-colors"
                          onClick={() => manejarNavegacion('mi-cuenta')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>📋</span>
                              <span>{t('header.historialPedidos')}</span>
                            </span>
                            <div className="flex items-center gap-1 flex-nowrap">
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {(() => {
                                  const pedidos = baseDatos.obtenerPedidosCliente(clienteActual.id_cliente);
                                  return pedidos.length;
                                })()} pedidos
                              </span>
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                {clienteActual.puntos} pts
                              </span>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-600 hover:text-white transition-colors"
                          onClick={() => manejarNavegacion('perfil')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>👤</span>
                              <span>{t('header.miPerfil')}</span>
                            </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {clienteActual.dni ? 'Completo' : 'Incompleto'}
                      </span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Footer del menú */}
                  <div className="border-t border-gray-200">
                    <button 
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-b-lg transition-colors"
                      onClick={manejarCerrarSesion}
                    >
                      <span className="flex items-center gap-2">
                        <span>🚪</span>
                        <span>{t('header.cerrarSesion')}</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Botón de login si no está autenticado
            <button
              onClick={() => manejarNavegacion('login')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              {t('header.iniciarSesion')}
            </button>
          )}

          {/* Contenedor del selector de idioma con dropdown */}
          <div className="relative">
            {/* Botón del selector de idioma */}
            <button 
              className="flex items-center gap-2 text-gray-700 font-medium hover:text-orange-600 transition-colors text-lg"
              onClick={() => setSelectorIdiomaAbierto(!selectorIdiomaAbierto)}
            >
              <span className="font-bold">{idiomaActual.toUpperCase()}</span>
              <span className="text-sm">🌐</span>
              {/* Icono de flecha hacia abajo */}
              <svg 
                className={`w-4 h-4 transition-transform ${selectorIdiomaAbierto ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
            </button>
            
            {/* Dropdown del selector de idioma - solo visible cuando está abierto */}
            {selectorIdiomaAbierto && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-orange-200 z-10">
                {/* Opción Español */}
                <button 
                  className={`block w-full text-left px-4 py-3 text-base transition-colors rounded-t-md ${
                    idiomaActual === 'es' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-700 hover:bg-orange-600 hover:text-white'
                  }`}
                  onClick={() => {
                    cambiarIdioma('es');
                    setSelectorIdiomaAbierto(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>🇪🇸</span>
                    <span>Español</span>
                  </div>
                </button>
                {/* Opción Inglés */}
                <button 
                  className={`block w-full text-left px-4 py-3 text-base transition-colors rounded-b-md ${
                    idiomaActual === 'en' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-700 hover:bg-orange-600 hover:text-white'
                  }`}
                  onClick={() => {
                    cambiarIdioma('en');
                    setSelectorIdiomaAbierto(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>🇺🇸</span>
                    <span>English</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Botón del menú móvil - solo visible en pantallas pequeñas */}
          <button 
            className="md:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          >
            {/* Icono de hamburguesa para menú móvil */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil - solo visible cuando está abierto y en pantallas pequeñas */}
      {menuMovilAbierto && (
        <div className="md:hidden bg-white border-t border-orange-200 px-4 py-4">
          {/* Enlaces de navegación móvil */}
          <button 
            className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left"
            onClick={() => manejarNavegacion('inicio')}
          >
            Inicio
          </button>
          <button 
            className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left"
            onClick={() => manejarNavegacion('menu')}
          >
            Menú
          </button>
          <button 
            className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left"
            onClick={() => manejarNavegacion('reservas')}
          >
            Reservas
          </button>
          
          {/* Mostrar opciones diferentes según el rol del usuario en móvil */}
          {esAdmin ? (
            <>
              <button 
                className="block py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('gestion-productos')}
              >
                🍔 Gestión Productos
              </button>
              <button 
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('gestion-pedidos')}
              >
                📋 Gestionar Pedidos
              </button>
              <button 
                className="block py-2 text-gray-700 hover:text-purple-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('comandas-empleado')}
              >
                🍽️ Tomar Comandas
              </button>
            </>
          ) : esEmpleado ? (
            <>
              <button 
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('gestion-pedidos')}
              >
                📋 Gestionar Pedidos
              </button>
              <button 
                className="block py-2 text-gray-700 hover:text-purple-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('comandas-empleado')}
              >
                🍽️ Tomar Comandas
              </button>
            </>
          ) : (
            <>
              <button 
                className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('lealtad')}
              >
                Lealtad
              </button>
              <button 
                className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left"
                onClick={() => manejarNavegacion('reseñas')}
              >
                Reseñas
              </button>
            </>
          )}
          
          {/* Opciones de usuario en móvil */}
          {estaAutenticado ? (
            <>
              {esAdmin && (
                <>
                  <button 
                    className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left px-4"
                    onClick={() => manejarNavegacion('admin')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>🔧</span>
                        <span>Panel Admin</span>
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        Admin
                      </span>
                    </div>
                  </button>
                  
                  <button 
                    className="block py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left px-4"
                    onClick={() => manejarNavegacion('gestion-productos')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>🍔</span>
                        <span>Gestionar Productos</span>
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        Admin
                      </span>
                    </div>
                  </button>
                </>
              )}
              
              {/* Gestión de pedidos para empleados y admin */}
              {(esAdmin || esEmpleado) && (
                <>
                  <button 
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors w-full text-left px-4"
                    onClick={() => manejarNavegacion('gestion-pedidos')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>📋</span>
                        <span>Gestionar Pedidos</span>
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        Staff
                      </span>
                    </div>
                  </button>
                  
                  <button 
                    className="block py-2 text-gray-700 hover:text-purple-600 transition-colors w-full text-left px-4"
                    onClick={() => manejarNavegacion('comandas-empleado')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>🍽️</span>
                        <span>Tomar Comandas</span>
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        Restaurante
                      </span>
                    </div>
                  </button>
                </>
              )}
              
              {esCliente && clienteActual && (
                <>
                  <button 
                    className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left px-4"
                    onClick={() => manejarNavegacion('mi-cuenta')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>📋</span>
                        <span>Historial Pedidos</span>
                      </span>
                      <div className="flex items-center gap-1 flex-nowrap">
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                          {(() => {
                            const pedidos = baseDatos.obtenerPedidosCliente(clienteActual.id_cliente);
                            return pedidos.length;
                          })()} pedidos
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                          {clienteActual.puntos} pts
                        </span>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    className="block py-2 text-gray-700 hover:text-orange-600 transition-colors w-full text-left px-4"
                    onClick={() => manejarNavegacion('perfil')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Mi Perfil</span>
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {clienteActual.dni ? 'Completo' : 'Incompleto'}
                      </span>
                    </div>
                  </button>
                </>
              )}
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button 
                  className="block py-2 text-red-600 hover:text-red-700 transition-colors w-full text-left px-4"
                  onClick={manejarCerrarSesion}
                >
                  <span className="flex items-center gap-2">
                    <span>🚪</span>
                    <span>Cerrar Sesión</span>
                  </span>
                </button>
              </div>
            </>
          ) : (
            <button 
              className="block py-2 text-orange-600 hover:text-orange-700 transition-colors w-full text-left px-4"
              onClick={() => manejarNavegacion('login')}
            >
              <span className="flex items-center gap-2">
                <span>🔑</span>
                <span>Iniciar Sesión</span>
              </span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
