import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaPerfil {
  onCambiarPantalla: (pantalla: any) => void;
}

// Interfaz para los datos del perfil del cliente
interface DatosPerfil {
  nombre: string;
  apellido1: string;
  apellido2: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  // Datos de domicilio
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  pais: string;
  // Preferencias
  recibirOfertas: boolean;
  recibirNotificaciones: boolean;
  // Información adicional
  alergias: string;
  preferenciasAlimentarias: string;
}

// Componente de la pantalla de perfil
export function PantallaPerfil({ onCambiarPantalla }: PropsPantallaPerfil) {
  // Hook de autenticación
  const { usuarioActual, clienteActual, estaAutenticado, esCliente } = useAuth();
  
  // Estados para los datos del perfil
  const [datosPerfil, setDatosPerfil] = useState<DatosPerfil>({
    nombre: '',
    apellido1: '',
    apellido2: '',
    dni: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    provincia: '',
    pais: 'España',
    recibirOfertas: true,
    recibirNotificaciones: true,
    alergias: '',
    preferenciasAlimentarias: ''
  });
  
  // Estados para la interfaz
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [pestañaActiva, setPestañaActiva] = useState<'personal' | 'domicilio' | 'preferencias'>('personal');

  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    if (estaAutenticado && esCliente && clienteActual) {
      cargarDatosPerfil();
    }
  }, [estaAutenticado, esCliente, clienteActual]);

  // Función para cargar datos del perfil
  const cargarDatosPerfil = () => {
    if (clienteActual) {
      // Usar los campos separados si están disponibles, sino separar el nombre completo
      const nombre = clienteActual.apellido1 ? clienteActual.nombre.split(' ')[0] : clienteActual.nombre.split(' ')[0] || '';
      const apellido1 = clienteActual.apellido1 || clienteActual.nombre.split(' ')[1] || '';
      const apellido2 = clienteActual.apellido2 || clienteActual.nombre.split(' ').slice(2).join(' ') || '';
      
      // Cargar datos básicos del cliente
      setDatosPerfil(prev => ({
        ...prev,
        nombre: nombre,
        apellido1: apellido1,
        apellido2: apellido2,
        dni: clienteActual.dni || '', // Cargar DNI de la base de datos
        email: clienteActual.email,
        telefono: clienteActual.telefono,
        // Los demás datos se cargarían de la base de datos en una implementación real
        // Por ahora usamos valores por defecto
        fechaNacimiento: '1990-01-01',
        direccion: 'Calle Principal 123',
        ciudad: 'Madrid',
        codigoPostal: '28001',
        provincia: 'Madrid',
        pais: 'España',
        recibirOfertas: true,
        recibirNotificaciones: true,
        alergias: '',
        preferenciasAlimentarias: ''
      }));
    }
  };

  // Función para manejar cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setDatosPerfil(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setDatosPerfil(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para guardar cambios
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');

    try {
      if (clienteActual) {
        // Crear el nombre completo para mantener compatibilidad
        const nombreCompleto = `${datosPerfil.nombre} ${datosPerfil.apellido1} ${datosPerfil.apellido2}`.trim();
        
        // Actualizar datos en la base de datos
        const datosActualizados = {
          nombre: nombreCompleto,
          apellido1: datosPerfil.apellido1,
          apellido2: datosPerfil.apellido2,
          dni: datosPerfil.dni,
          email: datosPerfil.email,
          telefono: datosPerfil.telefono
        };
        
        const exito = baseDatos.actualizarCliente(clienteActual.id_cliente, datosActualizados);
        
        if (exito) {
          setMensaje('Perfil actualizado exitosamente');
          setModoEdicion(false);
          
          // Recargar datos del contexto de autenticación
          // En una implementación real, esto actualizaría el contexto
          
          // Ocultar mensaje después de 3 segundos
          setTimeout(() => {
            setMensaje('');
          }, 3000);
        } else {
          setMensaje('Error al actualizar el perfil');
        }
      }
    } catch (error) {
      setMensaje('Error al actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  // Función para cancelar edición
  const cancelarEdicion = () => {
    setModoEdicion(false);
    cargarDatosPerfil(); // Recargar datos originales
  };

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

  return (
    // Contenedor principal de la pantalla de perfil
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner del perfil mejorado */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-center lg:justify-between">
            
            {/* Información del perfil */}
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-6 mb-6 justify-center lg:justify-start">
                {/* Avatar del usuario */}
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    Mi Perfil
                  </h1>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full backdrop-blur-sm">
                      <span className="text-indigo-200 font-medium">Configuración</span>
                    </div>
                    <div className="text-indigo-100 text-lg">
                      <span className="font-bold text-white">{clienteActual.nombre}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xl text-indigo-100 max-w-2xl">
                Gestiona tu información personal, datos de domicilio y preferencias para una experiencia personalizada
              </p>
            </div>

            {/* Información de la cuenta (solo en desktop) */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">👤</div>
                <div className="text-lg font-bold text-white mb-1">{clienteActual.nombre}</div>
                <div className="text-sm text-indigo-200">@{usuarioActual?.username}</div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-sm text-indigo-100">
                    Miembro desde {new Date(clienteActual.fecha_registro).toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Botón de regreso */}
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla('mi-cuenta')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver a Mi Cuenta
            </button>
          </div>

          {/* Mensaje de confirmación o error */}
          {mensaje && (
            <div className={`mb-6 p-4 rounded-lg ${
              mensaje.includes('exitosamente') 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {mensaje}
            </div>
          )}

          {/* Navegación por pestañas */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-full p-2 shadow-lg">
              <button
                onClick={() => setPestañaActiva('personal')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'personal'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                👤 Datos Personales
              </button>
              <button
                onClick={() => setPestañaActiva('domicilio')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'domicilio'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                🏠 Domicilio
              </button>
              <button
                onClick={() => setPestañaActiva('preferencias')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  pestañaActiva === 'preferencias'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                ⚙️ Preferencias
              </button>
            </div>
          </div>

          {/* Formulario de perfil */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {pestañaActiva === 'personal' && 'Información Personal'}
                  {pestañaActiva === 'domicilio' && 'Información de Domicilio'}
                  {pestañaActiva === 'preferencias' && 'Preferencias y Configuración'}
                </h2>
                {!modoEdicion ? (
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelarEdicion}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarCambios}
                      disabled={guardando}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={guardarCambios} className="p-6">
              
              {/* Pestaña de Datos Personales */}
              {pestañaActiva === 'personal' && (
                <div className="space-y-6">
                  {/* Nombre y apellidos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          required
                          value={datosPerfil.nombre}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu nombre"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.nombre || 'No especificado'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700 mb-2">
                        Primer Apellido *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          id="apellido1"
                          name="apellido1"
                          required
                          value={datosPerfil.apellido1}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Primer apellido"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.apellido1 || 'No especificado'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="apellido2" className="block text-sm font-medium text-gray-700 mb-2">
                        Segundo Apellido *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          id="apellido2"
                          name="apellido2"
                          required
                          value={datosPerfil.apellido2}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Segundo apellido"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.apellido2 || 'No especificado'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DNI y Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                        DNI (Opcional)
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          id="dni"
                          name="dni"
                          value={datosPerfil.dni}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="12345678X"
                          maxLength={9}
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.dni || 'No especificado'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={datosPerfil.email}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="tu@email.com"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.email || 'No especificado'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          required
                          value={datosPerfil.telefono}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="644 123 456"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.telefono || 'No especificado'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento
                      </label>
                      {modoEdicion ? (
                        <input
                          type="date"
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          value={datosPerfil.fechaNacimiento}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.fechaNacimiento 
                            ? new Date(datosPerfil.fechaNacimiento).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'No especificada'
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Código único del cliente */}
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                      <span className="text-lg mr-2">🎯</span>
                      Tu Código Único para el Restaurante
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Muestra este código al empleado para ganar puntos</div>
                        <div className="text-3xl font-bold font-mono tracking-wider text-purple-600 mb-2">
                          {clienteActual.codigo_unico}
                        </div>
                        <div className="text-xs text-gray-500">
                          Código único de identificación en el restaurante
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de la cuenta */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                      <span className="text-lg mr-2">ℹ️</span>
                      Información de la Cuenta
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Usuario:</span>
                        <span className="text-blue-800 ml-2">@{usuarioActual?.username}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Fecha de registro:</span>
                        <span className="text-blue-800 ml-2">
                          {new Date(clienteActual.fecha_registro).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Puntos de lealtad:</span>
                        <span className="text-blue-800 ml-2">{clienteActual.puntos} puntos</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Estado:</span>
                        <span className="text-green-600 ml-2 font-medium">Cliente Activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Domicilio */}
              {pestañaActiva === 'domicilio' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección Completa *
                    </label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        required
                        value={datosPerfil.direccion}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Calle, número, piso, puerta"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                        {datosPerfil.direccion || 'No especificada'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          id="ciudad"
                          name="ciudad"
                          required
                          value={datosPerfil.ciudad}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu ciudad"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.ciudad || 'No especificada'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          id="codigoPostal"
                          name="codigoPostal"
                          required
                          value={datosPerfil.codigoPostal}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="28001"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.codigoPostal || 'No especificado'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="provincia" className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia *
                      </label>
                      {modoEdicion ? (
                        <select
                          id="provincia"
                          name="provincia"
                          required
                          value={datosPerfil.provincia}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar provincia</option>
                          <option value="Madrid">Madrid</option>
                          <option value="Barcelona">Barcelona</option>
                          <option value="Valencia">Valencia</option>
                          <option value="Sevilla">Sevilla</option>
                          <option value="Bilbao">Bilbao</option>
                          <option value="Málaga">Málaga</option>
                          <option value="Zaragoza">Zaragoza</option>
                          <option value="Otra">Otra</option>
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.provincia || 'No especificada'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-2">
                        País *
                      </label>
                      {modoEdicion ? (
                        <select
                          id="pais"
                          name="pais"
                          required
                          value={datosPerfil.pais}
                          onChange={manejarCambio}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="España">España</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Francia">Francia</option>
                          <option value="Italia">Italia</option>
                          <option value="Otro">Otro</option>
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[48px] flex items-center">
                          {datosPerfil.pais || 'No especificado'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de entrega */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center">
                      <span className="text-lg mr-2">🚚</span>
                      Información de Entrega
                    </h4>
                    <p className="text-green-700 text-sm">
                      Esta dirección se usará como dirección por defecto para tus pedidos. 
                      Siempre podrás cambiarla durante el proceso de compra.
                    </p>
                  </div>
                </div>
              )}

              {/* Pestaña de Preferencias */}
              {pestañaActiva === 'preferencias' && (
                <div className="space-y-6">
                  
                  {/* Preferencias de comunicación */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">📧</span>
                      Preferencias de Comunicación
                    </h4>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="recibirOfertas"
                          checked={datosPerfil.recibirOfertas}
                          onChange={manejarCambio}
                          disabled={!modoEdicion}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-gray-800 font-medium">Recibir ofertas y promociones</span>
                          <p className="text-sm text-gray-500">Te enviaremos ofertas especiales y descuentos exclusivos</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="recibirNotificaciones"
                          checked={datosPerfil.recibirNotificaciones}
                          onChange={manejarCambio}
                          disabled={!modoEdicion}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-gray-800 font-medium">Notificaciones de pedidos</span>
                          <p className="text-sm text-gray-500">Recibe actualizaciones sobre el estado de tus pedidos</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Información dietética */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">🥗</span>
                      Información Dietética
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-2">
                          Alergias Alimentarias
                        </label>
                        {modoEdicion ? (
                          <textarea
                            id="alergias"
                            name="alergias"
                            rows={3}
                            value={datosPerfil.alergias}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Especifica cualquier alergia alimentaria (gluten, lácteos, frutos secos, etc.)"
                          />
                        ) : (
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[80px]">
                            {datosPerfil.alergias || 'No especificadas'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="preferenciasAlimentarias" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferencias Alimentarias
                        </label>
                        {modoEdicion ? (
                          <textarea
                            id="preferenciasAlimentarias"
                            name="preferenciasAlimentarias"
                            rows={3}
                            value={datosPerfil.preferenciasAlimentarias}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Vegetariano, vegano, sin gluten, etc."
                          />
                        ) : (
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[80px]">
                            {datosPerfil.preferenciasAlimentarias || 'No especificadas'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información de seguridad */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                      <span className="text-lg mr-2">🔒</span>
                      Seguridad de la Cuenta
                    </h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      Para cambiar tu contraseña o eliminar tu cuenta, contacta con nuestro soporte.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.open('mailto:soporte@barrasoburger.com?subject=Cambio de Contraseña&body=Hola, me gustaría cambiar mi contraseña de la cuenta.', '_blank');
                        }}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Cambiar Contraseña
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.open('mailto:soporte@barrasoburger.com?subject=Soporte Técnico&body=Hola, necesito ayuda con mi cuenta.', '_blank');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        Contactar Soporte
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => onCambiarPantalla('mi-cuenta')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Ver Historial de Pedidos</h3>
              <p className="text-gray-600 text-sm">Revisa todos tus pedidos anteriores y repite tus favoritos</p>
            </button>

            <button
              onClick={() => onCambiarPantalla('lealtad')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Programa de Lealtad</h3>
              <p className="text-gray-600 text-sm">Tienes {clienteActual.puntos} puntos disponibles para canjear</p>
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📱</span>
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Restaurante BarrasoBurger</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📍 Calle de las Hamburguesas 123</p>
                  <p>🏢 Centro Comercial Plaza Mayor</p>
                  <p>🌆 Madrid, España 28001</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Contacto</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📞 (555) 123-4567</p>
                  <p>📧 info@barrasoburger.com</p>
                  <p>🕒 Lun-Dom: 11:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
