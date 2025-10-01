import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Reseña } from '../servicios/BaseDatos';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsPantallaReseñas {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas') => void;
}

// Interfaz para nueva reseña
interface NuevaReseña {
  calificacion: number;
  comentario: string;
  producto_reseñado: string;
}

// Componente de la pantalla de reseñas
export function PantallaReseñas({ onCambiarPantalla }: PropsPantallaReseñas) {
  // Hook de autenticación
  const { usuarioActual, clienteActual, estaAutenticado, esCliente, esAdmin } = useAuth();
  
  // Hook de idioma
  const { t } = useIdioma();
  
  // Estados para las reseñas
  const [reseñas, setReseñas] = useState<(Reseña & { nombreCliente: string; avatarCliente: string })[]>([]);
  const [estadisticasReseñas, setEstadisticasReseñas] = useState<any>({});
  
  // Estado para controlar el filtro de calificaciones
  const [filtroCalificacion, setFiltroCalificacion] = useState<number | null>(null);
  
  // Estado para el formulario de nueva reseña
  const [nuevaReseña, setNuevaReseña] = useState<NuevaReseña>({
    calificacion: 5,
    comentario: '',
    producto_reseñado: ''
  });
  
  // Estado para controlar si se envió una reseña
  const [reseñaEnviada, setReseñaEnviada] = useState(false);

  // Cargar reseñas al montar el componente
  useEffect(() => {
    cargarReseñas();
  }, []);

  // Función para cargar todas las reseñas
  const cargarReseñas = () => {
    const todasLasReseñas = baseDatos.obtenerTodasLasReseñas();
    setReseñas(todasLasReseñas);
    
    const estadisticas = baseDatos.obtenerEstadisticasReseñas();
    setEstadisticasReseñas(estadisticas);
  };

  // Lista de productos para el selector
  const productosDisponibles = [
    'BarrasoBurger Clásica',
    'Bacon Deluxe',
    'Aguacate Ranch',
    'BBQ Especial',
    'Vegetariana Suprema',
    'Picante Jalapeño',
    'Papas Fritas Crujientes',
    'Aros de Cebolla Dorados',
    'Papas de Camote',
    'Nuggets de Pollo',
    'Ensalada César',
    'Palitos de Mozzarella',
    'Coca-Cola',
    'Sprite',
    'Té Helado',
    'Malteada de Vainilla',
    'Jugo de Naranja Natural',
    'Café Americano'
  ];

  // Función para filtrar reseñas por calificación
  const reseñasFiltradas = filtroCalificacion 
    ? reseñas.filter(reseña => reseña.calificacion === filtroCalificacion)
    : reseñas;

  // Función para renderizar estrellas
  const renderizarEstrellas = (calificacion: number, tamaño: 'sm' | 'md' | 'lg' = 'md') => {
    const tamaños = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-2xl'
    };

    return (
      <div className={`flex ${tamaños[tamaño]}`}>
        {[1, 2, 3, 4, 5].map((estrella) => (
          <span
            key={estrella}
            className={estrella <= calificacion ? 'text-yellow-400' : 'text-gray-300'}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  // Función para manejar cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaReseña(prev => ({
      ...prev,
      [name]: name === 'calificacion' ? parseInt(value) : value
    }));
  };

  // Función para enviar nueva reseña
  const enviarReseña = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estaAutenticado || !esCliente || !clienteActual) {
      alert('Debes iniciar sesión como cliente para dejar una reseña');
      onCambiarPantalla('login');
      return;
    }

    try {
      // Crear la reseña en la base de datos
      baseDatos.crearReseña(
        clienteActual.id_cliente,
        nuevaReseña.calificacion,
        nuevaReseña.comentario,
        nuevaReseña.producto_reseñado || undefined
      );
      
      // Recargar reseñas
      cargarReseñas();
      
      setReseñaEnviada(true);
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setReseñaEnviada(false);
        setNuevaReseña({
          calificacion: 5,
          comentario: '',
          producto_reseñado: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      alert('Error al enviar la reseña. Inténtalo de nuevo.');
    }
  };

  // Función para verificar reseña (solo admin)
  const verificarReseña = (id_reseña: number) => {
    if (esAdmin) {
      baseDatos.verificarReseña(id_reseña);
      cargarReseñas();
    }
  };

  // Función para eliminar reseña (solo admin o el autor)
  const eliminarReseña = (reseña: Reseña & { nombreCliente: string; avatarCliente: string }) => {
    const puedeEliminar = esAdmin || (esCliente && clienteActual && clienteActual.id_cliente === reseña.id_cliente);
    
    if (puedeEliminar && confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      baseDatos.eliminarReseña(reseña.id_reseña);
      cargarReseñas();
    }
  };

  return (
    // Contenedor principal de la pantalla de reseñas
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de bienvenida a reseñas */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
            Reseñas de Clientes
          </h1>
          <p className="text-xl animate-fade-in-up">
            Descubre lo que nuestros clientes dicen sobre su experiencia en BarrasoBurger
          </p>
        </div>
      </section>
      
      {/* Sección de estadísticas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Resumen de calificaciones */}
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-600 mb-4">
                {estadisticasReseñas.promedioCalificacion?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mb-4">
                {renderizarEstrellas(Math.round(estadisticasReseñas.promedioCalificacion || 0), 'lg')}
              </div>
              <p className="text-gray-600">
                Basado en {estadisticasReseñas.totalReseñas || 0} reseñas
              </p>
            </div>
            
            {/* Distribución de calificaciones */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Distribución de Calificaciones
              </h3>
              {(estadisticasReseñas.distribucionCalificaciones || []).map(({ estrella, cantidad, porcentaje }: any) => (
                <div key={estrella} className="flex items-center mb-3">
                  <span className="w-12 text-sm font-medium text-gray-700">
                    {estrella} ⭐
                  </span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-600">
                    {cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección principal de reseñas */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Lista de reseñas */}
            <div className="lg:col-span-2">
              {/* Filtros */}
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => setFiltroCalificacion(null)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    filtroCalificacion === null
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Todas
                </button>
                {[5, 4, 3, 2, 1].map(estrella => (
                  <button
                    key={estrella}
                    onClick={() => setFiltroCalificacion(estrella)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-1 ${
                      filtroCalificacion === estrella
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    {estrella} ⭐
                  </button>
                ))}
              </div>
              
              {/* Reseñas */}
              <div className="space-y-6">
                {reseñasFiltradas.map((reseña) => (
                  <div key={reseña.id_reseña} className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{reseña.avatarCliente}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-800">{reseña.nombreCliente}</h3>
                            {reseña.verificado && (
                              <span className="text-green-500 text-sm">✓ Verificado</span>
                            )}
                            {reseña.producto_reseñado && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                {reseña.producto_reseñado}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {new Date(reseña.fecha).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            {/* Acciones para admin */}
                            {esAdmin && (
                              <div className="flex gap-1">
                                {!reseña.verificado && (
                                  <button
                                    onClick={() => verificarReseña(reseña.id_reseña)}
                                    className="text-green-600 hover:text-green-700 text-xs"
                                    title="Verificar reseña"
                                  >
                                    ✓
                                  </button>
                                )}
                                <button
                                  onClick={() => eliminarReseña(reseña)}
                                  className="text-red-600 hover:text-red-700 text-xs"
                                  title="Eliminar reseña"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                            {/* Acción para el autor de la reseña */}
                            {esCliente && clienteActual && clienteActual.id_cliente === reseña.id_cliente && (
                              <button
                                onClick={() => eliminarReseña(reseña)}
                                className="text-red-600 hover:text-red-700 text-xs"
                                title="Eliminar mi reseña"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Estrellas de valoración */}
                        <div className="flex items-center mb-3">
                          <div className="flex text-lg">
                            {[1, 2, 3, 4, 5].map((estrella) => (
                              <span
                                key={estrella}
                                className={estrella <= reseña.calificacion ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {reseña.calificacion}/5
                          </span>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed">
                          {reseña.comentario}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Formulario para nueva reseña */}
            <div>
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Deja tu Reseña
                </h2>
                
                {/* Verificar si está autenticado */}
                {!estaAutenticado || !esCliente ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔐</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Inicia Sesión para Dejar una Reseña
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Solo los clientes registrados pueden dejar reseñas
                    </p>
                    <button
                      onClick={() => onCambiarPantalla('login')}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Información del cliente */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">👤</div>
                        <div>
                          <div className="font-medium text-blue-800">{clienteActual?.nombre}</div>
                          <div className="text-sm text-blue-600">Cliente verificado</div>
                        </div>
                      </div>
                    </div>

                    {/* Mensaje de confirmación */}
                    {reseñaEnviada && (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        <strong>¡Reseña enviada!</strong><br />
                        Gracias por compartir tu experiencia. Tu reseña aparecerá en la lista.
                      </div>
                    )}
                    
                    <form onSubmit={enviarReseña} className="space-y-4">
                      <div>
                        <label htmlFor="producto_reseñado" className="block text-sm font-medium text-gray-700 mb-1">
                          Producto Reseñado (Opcional)
                        </label>
                        <select
                          id="producto_reseñado"
                          name="producto_reseñado"
                          value={nuevaReseña.producto_reseñado}
                          onChange={manejarCambio}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Reseña general del restaurante</option>
                          <optgroup label="Hamburguesas">
                            {productosDisponibles.slice(0, 6).map(producto => (
                              <option key={producto} value={producto}>{producto}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Acompañamientos">
                            {productosDisponibles.slice(6, 12).map(producto => (
                              <option key={producto} value={producto}>{producto}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Bebidas">
                            {productosDisponibles.slice(12).map(producto => (
                              <option key={producto} value={producto}>{producto}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="calificacion" className="block text-sm font-medium text-gray-700 mb-1">
                          Calificación *
                        </label>
                        <select
                          id="calificacion"
                          name="calificacion"
                          required
                          value={nuevaReseña.calificacion}
                          onChange={manejarCambio}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value={5}>5 ⭐ - Excelente</option>
                          <option value={4}>4 ⭐ - Muy Bueno</option>
                          <option value={3}>3 ⭐ - Bueno</option>
                          <option value={2}>2 ⭐ - Regular</option>
                          <option value={1}>1 ⭐ - Malo</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
                          Comentario *
                        </label>
                        <textarea
                          id="comentario"
                          name="comentario"
                          required
                          rows={4}
                          value={nuevaReseña.comentario}
                          onChange={manejarCambio}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Cuéntanos sobre tu experiencia..."
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={reseñaEnviada}
                        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reseñaEnviada ? 'Reseña Enviada ✓' : 'Enviar Reseña'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
