import React, { useState } from 'react';
import { useAuth } from '../contextos/ContextoAuth';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsPantallaLogin {
  onCambiarPantalla: (pantalla: any) => void;
}

// Componente de la pantalla de login
export function PantallaLogin({ onCambiarPantalla }: PropsPantallaLogin) {
  // Estados para el formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  // Estados para el formulario de registro
  const [datosRegistro, setDatosRegistro] = useState({
    username: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
    dni: '',
    telefono: '',
    email: ''
  });

  // Hook de autenticación
  const { iniciarSesion, registrarse, estaAutenticado, usuarioActual } = useAuth();
  
  // Hook de idioma
  const { t } = useIdioma();

  // Función para iniciar sesión automática con cuenta de prueba
  const iniciarSesionAutomatica = async (username: string, password: string) => {
    setCargando(true);
    setError('');

    try {
      const exito = await iniciarSesion(username, password);
      
      if (exito) {
        onCambiarPantalla('inicio');
      } else {
        setError('Error al iniciar sesión automática');
      }
    } catch (error) {
      setError('Error al iniciar sesión automática');
    } finally {
      setCargando(false);
    }
  };

  // Función para manejar el login
  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const exito = await iniciarSesion(username, password);
      
      if (exito) {
        // Redirigir según el rol del usuario
        onCambiarPantalla('inicio');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  // Función para manejar el registro
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (datosRegistro.password !== datosRegistro.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    try {
      console.log('Intentando registrar usuario:', {
        username: datosRegistro.username,
        nombre: `${datosRegistro.nombre} ${datosRegistro.apellido1} ${datosRegistro.apellido2}`,
        telefono: datosRegistro.telefono,
        email: datosRegistro.email,
        dni: datosRegistro.dni
      });

      const exito = await registrarse(
        datosRegistro.username,
        datosRegistro.password,
        `${datosRegistro.nombre} ${datosRegistro.apellido1} ${datosRegistro.apellido2}`,
        datosRegistro.telefono,
        datosRegistro.email,
        datosRegistro.dni
      );
      
      if (exito) {
        console.log('Registro exitoso, redirigiendo...');
        onCambiarPantalla('inicio');
      } else {
        console.error('Error en el registro');
        setError('El nombre de usuario ya existe o hubo un error en el registro');
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      setError('Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  // Función para manejar cambios en el formulario de registro
  const manejarCambioRegistro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosRegistro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    // Contenedor principal de la pantalla de login
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-red-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        
        {/* Logo y título mejorado */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <img 
              src="https://c.animaapp.com/mfw94os5XM7vEN/img/logohamburgeseria_1.png" 
              alt="BarrasoBurger Logo" 
              className="w-24 h-24 mx-auto relative z-10 drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">BarrasoBurger</h1>
          <p className="text-orange-100 text-lg">
            {mostrarRegistro ? `✨ ${t('login.crearCuenta')}` : `🍔 ${t('login.bienvenido')}`}
          </p>
        </div>

        {/* Formulario mejorado */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 max-w-full">
          
          {/* Pestañas mejoradas */}
          <div className="flex mb-8 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-1.5 shadow-inner">
            <button
              onClick={() => setMostrarRegistro(false)}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                !mostrarRegistro
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
              }`}
            >
              <span className="text-lg">🔑</span>
              {t('login.iniciarSesion')}
            </button>
            <button
              onClick={() => setMostrarRegistro(true)}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                mostrarRegistro
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
              }`}
            >
              <span className="text-lg">✨</span>
              {t('login.registrarse')}
            </button>
          </div>

          {/* Mensaje de error mejorado */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-md">
              <div className="flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!mostrarRegistro ? (
            // Formulario de login mejorado
            <form onSubmit={manejarLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="relative">
                  <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    {t('login.usuario')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800 font-medium"
                      placeholder="Tu nombre de usuario"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-400">🔤</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔒</span>
                    {t('login.contraseña')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800 font-medium"
                      placeholder="Tu contraseña"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-400">🔐</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
              >
                {cargando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🚀</span>
                    {t('login.iniciarSesion')}
                  </>
                )}
              </button>
            </form>
          ) : (
            // Formulario de registro mejorado
            <form onSubmit={manejarRegistro} className="space-y-5">
              {/* Nombre y apellidos */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  {t('login.informacionPersonal')}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.nombre')} *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={datosRegistro.nombre}
                      onChange={manejarCambioRegistro}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="apellido1" className="block text-sm font-bold text-gray-700 mb-2">
                        {t('login.primerApellido')} *
                      </label>
                      <input
                        type="text"
                        id="apellido1"
                        name="apellido1"
                        value={datosRegistro.apellido1}
                        onChange={manejarCambioRegistro}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                        placeholder="Primer apellido"
                      />
                    </div>
                    <div>
                      <label htmlFor="apellido2" className="block text-sm font-bold text-gray-700 mb-2">
                        {t('login.segundoApellido')} *
                      </label>
                      <input
                        type="text"
                        id="apellido2"
                        name="apellido2"
                        value={datosRegistro.apellido2}
                        onChange={manejarCambioRegistro}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                        placeholder="Segundo apellido"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Usuario y DNI */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">🔑</span>
                  {t('login.datosAcceso')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.usuario')} *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={datosRegistro.username}
                      onChange={manejarCambioRegistro}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Nombre de usuario"
                    />
                  </div>
                  <div>
                    <label htmlFor="dni" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.dni')}
                    </label>
                    <input
                      type="text"
                      id="dni"
                      name="dni"
                      value={datosRegistro.dni}
                      onChange={manejarCambioRegistro}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="12345678X"
                      maxLength={9}
                    />
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  {t('login.informacionContacto')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={datosRegistro.email}
                      onChange={manejarCambioRegistro}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.telefono')} *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={datosRegistro.telefono}
                      onChange={manejarCambioRegistro}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="644 123 456"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseñas */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">🔐</span>
                  {t('login.seguridad')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.contraseña')} *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={datosRegistro.password}
                      onChange={manejarCambioRegistro}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmarPassword" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('login.confirmarPassword')} *
                    </label>
                    <input
                      type="password"
                      id="confirmarPassword"
                      name="confirmarPassword"
                      value={datosRegistro.confirmarPassword}
                      onChange={manejarCambioRegistro}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
              >
                {cargando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🎉</span>
                    {t('login.crearCuentaBtn')}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Información de cuentas de prueba mejorada */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="font-bold text-blue-800 mb-6 text-center flex items-center justify-center gap-2">
              <span className="text-xl">🧪</span>
              {t('login.cuentasPrueba')}
            </h4>
            
            {/* Grid de tarjetas en línea horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              
              {/* Tarjeta Admin - Clickeable */}
              <button
                onClick={() => {
                  console.log('Iniciando sesión como admin...');
                  iniciarSesionAutomatica('admin', 'admin123');
                }}
                disabled={cargando}
                className="bg-white p-4 rounded-xl border-2 border-blue-200 hover:border-red-400 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👑</span>
                </div>
                <div className="font-bold text-red-600 text-base mb-1">{t('login.administrador')}</div>
                <div className="text-gray-600 text-sm mb-2">admin / admin123</div>
                <div className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full">
                  ✨ {t('login.accesoCompleto')}
                </div>
              </button>

              {/* Tarjeta Empleado - Clickeable */}
              <button
                onClick={() => {
                  console.log('Iniciando sesión como empleado...');
                  iniciarSesionAutomatica('empleado1', 'emp123');
                }}
                disabled={cargando}
                className="bg-white p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👨‍💼</span>
                </div>
                <div className="font-bold text-blue-600 text-base mb-1">{t('login.empleado')}</div>
                <div className="text-gray-600 text-sm mb-2">empleado1 / emp123</div>
                <div className="text-xs text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-full">
                  🔧 {t('login.gestionOperativa')}
                </div>
              </button>

              {/* Tarjeta Cliente - Clickeable */}
              <button
                onClick={() => {
                  console.log('Iniciando sesión como cliente...');
                  iniciarSesionAutomatica('cliente1', 'cli123');
                }}
                disabled={cargando}
                className="bg-white p-4 rounded-xl border-2 border-blue-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🛍️</span>
                </div>
                <div className="font-bold text-green-600 text-base mb-1">{t('login.cliente')}</div>
                <div className="text-gray-600 text-sm mb-2">cliente1 / cli123</div>
                <div className="text-xs text-green-500 font-medium bg-green-50 px-3 py-1 rounded-full">
                  🍔 María González
                </div>
                <div className="text-xs text-gray-500 mt-1">1250 puntos</div>
              </button>
            </div>
            
            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-100 rounded-xl">
              <p className="text-blue-800 text-sm text-center flex items-center justify-center gap-2">
                <span className="text-lg">💡</span>
                <span className="font-medium">{t('login.clickTarjeta')}</span>
              </p>
            </div>

            {/* Información de debugging */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-gray-600 text-xs text-center">
                Estado actual: {estaAutenticado ? `Autenticado como ${usuarioActual?.username} (${usuarioActual?.rol})` : 'No autenticado'}
              </p>
            </div>
          </div>

          {/* Botón para continuar sin cuenta mejorado */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onCambiarPantalla('inicio')}
              className="text-orange-600 hover:text-orange-700 font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 mx-auto bg-white/50 px-6 py-3 rounded-full backdrop-blur-sm border border-orange-200 hover:bg-white/80"
            >
              <span className="text-lg">🏠</span>
              {t('login.continuarSinCuenta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
