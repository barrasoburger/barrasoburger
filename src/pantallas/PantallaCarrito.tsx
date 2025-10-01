import React, { useState } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { ElementoCarrito } from '../App';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsPantallaCarrito {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas' | 'pago') => void;
  carrito: ElementoCarrito[];
  onActualizarCantidad: (indiceCarrito: number, nuevaCantidad: number) => void;
  onVaciarCarrito: () => void;
  onEditarProducto: (indiceCarrito: number) => void;
  precioTotal: number;
}

// Interfaz para los datos del formulario de pago
interface DatosPago {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  comentarios: string;
}

// Componente de la pantalla del carrito
export function PantallaCarrito({ 
  onCambiarPantalla, 
  carrito, 
  onActualizarCantidad, 
  onVaciarCarrito, 
  onEditarProducto,
  precioTotal 
}: PropsPantallaCarrito) {
  // Hook de idioma
  const { t } = useIdioma();

  // Función para incrementar cantidad
  const incrementarCantidad = (indiceCarrito: number, cantidadActual: number) => {
    onActualizarCantidad(indiceCarrito, cantidadActual + 1);
  };

  // Función para decrementar cantidad
  const decrementarCantidad = (indiceCarrito: number, cantidadActual: number) => {
    if (cantidadActual > 1) {
      onActualizarCantidad(indiceCarrito, cantidadActual - 1);
    }
  };

  // Función para eliminar producto del carrito
  const eliminarProducto = (indiceCarrito: number) => {
    onActualizarCantidad(indiceCarrito, 0);
  };

  // Función para obtener el nombre del punto de cocción
  const obtenerNombrePuntoCoccion = (puntoId: string) => {
    const puntos = {
      'poco-hecho': 'Poco Hecho',
      'medio': 'Al Punto',
      'bien-cocido': 'Muy Hecho'
    };
    return puntos[puntoId as keyof typeof puntos] || puntoId;
  };

  // Función para obtener el nombre del acompañamiento
  const obtenerNombreAcompañamiento = (acompañamientoId: string) => {
    const acompañamientos = {
      'papas-fritas': 'Papas Fritas Clásicas',
      'papas-camote': 'Papas de Camote',
      'aros-cebolla': 'Aros de Cebolla',
      'ensalada-cesar': 'Ensalada César',
      'nuggets': 'Nuggets de Pollo (4 pzs)'
    };
    return acompañamientos[acompañamientoId as keyof typeof acompañamientos] || acompañamientoId;
  };

  // Función para obtener el nombre de la bebida
  const obtenerNombreBebida = (bebidaId: string) => {
    if (bebidaId === 'sin-bebida') return 'Sin Bebida';
    
    const bebidas = {
      'coca-cola': 'Coca-Cola',
      'sprite': 'Sprite',
      'te-helado': 'Té Helado',
      'malteada-de-vainilla': 'Malteada de Vainilla',
      'jugo-de-naranja-natural': 'Jugo de Naranja Natural',
      'cafe-americano': 'Café Americano'
    };
    return bebidas[bebidaId as keyof typeof bebidas] || bebidaId;
  };

  // Función para obtener el nombre del ingrediente extra
  const obtenerNombreIngredienteExtra = (ingredienteId: string) => {
    const ingredientes = {
      'bacon': 'Bacon Extra',
      'queso-extra': 'Queso Extra',
      'aguacate': 'Aguacate',
      'cebolla-caramelizada': 'Cebolla Caramelizada',
      'jalapeños': 'Jalapeños',
      'champiñones': 'Champiñones Salteados',
      'tomate-extra': 'Tomate Extra',
      'pepinillos': 'Pepinillos Extra'
    };
    return ingredientes[ingredienteId as keyof typeof ingredientes] || ingredienteId;
  };

  // Calcular impuestos (ejemplo: 10%)
  const impuestos = precioTotal * 0.1;
  const totalConImpuestos = precioTotal + impuestos;

  return (
    // Contenedor principal de la pantalla del carrito
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner del carrito */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
            {t('carrito.titulo')}
          </h1>
          <p className="text-xl animate-fade-in-up">
            {t('carrito.subtitulo')}
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Botón de regreso */}
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla('menu')}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Continuar Comprando
            </button>
          </div>

          {/* Verificar si el carrito está vacío */}
          {carrito.length === 0 ? (
            // Carrito vacío
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {t('carrito.vacio')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('carrito.vacioDesc')}
              </p>
              <button
                onClick={() => onCambiarPantalla('menu')}
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors duration-300"
              >
                {t('carrito.verMenu')}
              </button>
            </div>
          ) : (
            // Carrito con productos
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Lista de productos */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {t('carrito.productos')} ({carrito.length})
                  </h2>
                  <button
                    onClick={onVaciarCarrito}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    {t('carrito.vaciarCarrito')}
                  </button>
                </div>

                {/* Productos en el carrito */}
                {carrito.map((item, index) => (
                  <div key={`${item.producto.id}-${index}`} className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-start gap-4">
                      {/* Imagen del producto */}
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      
                      {/* Información del producto */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.producto.nombre}
                            {item.personalizacion && (
                              <span className="text-sm font-normal text-orange-600 ml-2">
                                (Personalizada)
                              </span>
                            )}
                          </h3>
                          
                          {/* Botón de editar para hamburguesas personalizadas */}
                          {item.producto.categoria === 'hamburguesas' && (
                            <button
                              onClick={() => onEditarProducto(index)}
                              className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                              Editar
                            </button>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">
                          {item.producto.descripcion}
                        </p>
                        
                        {/* Mostrar detalles de personalización para hamburguesas */}
                        {item.personalizacion && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Personalización:</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🔥</span>
                                <strong>Punto de cocción:</strong> {obtenerNombrePuntoCoccion(item.personalizacion.puntoCoccion)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🍽️</span>
                                <strong>Acompañamiento:</strong> {obtenerNombreAcompañamiento(item.personalizacion.acompañamiento)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🥤</span>
                                <strong>Bebida:</strong> {obtenerNombreBebida(item.personalizacion.bebida)}
                              </div>
                              {item.personalizacion.ingredientesExtra.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">➕</span>
                                  <div>
                                    <strong>Ingredientes extra:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.personalizacion.ingredientesExtra.map((ingredienteId, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                          {obtenerNombreIngredienteExtra(ingredienteId)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {item.personalizacion.ingredientesRemovidos.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">❌</span>
                                  <div>
                                    <strong>Sin:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.personalizacion.ingredientesRemovidos.map((ingrediente, idx) => (
                                        <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                          {ingrediente}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {item.personalizacion.precioExtra > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">💰</span>
                                  <strong>Extras:</strong> +€{item.personalizacion.precioExtra.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Controles de cantidad */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">{t('carrito.cantidad')}:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => decrementarCantidad(index, item.cantidad)}
                                className="px-3 py-1 text-gray-600 hover:text-orange-600 transition-colors"
                              >
                                -
                              </button>
                              <span className="px-4 py-1 font-bold min-w-[50px] text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => incrementarCantidad(index, item.cantidad)}
                                className="px-3 py-1 text-gray-600 hover:text-orange-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          {/* Precio y botón eliminar */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xl font-bold text-orange-600">
                                €{((item.precioPersonalizado || parseFloat(item.producto.precio.replace('€', ''))) * item.cantidad).toFixed(2)}
                              </span>
                              {item.personalizacion && item.personalizacion.precioExtra > 0 && (
                                <div className="text-xs text-gray-500">
                                  (€{(item.precioPersonalizado || parseFloat(item.producto.precio.replace('€', ''))).toFixed(2)} c/u)
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => eliminarProducto(index)}
                              className="text-red-600 hover:text-red-700 transition-colors p-1"
                              title="Eliminar producto"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del pedido */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Resumen del Pedido
                  </h3>
                  
                  {/* Desglose de precios */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('carrito.subtotal')}:</span>
                      <span className="font-medium">€{precioTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('carrito.impuestos')}:</span>
                      <span className="font-medium">€{impuestos.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('carrito.envio')}:</span>
                      <span className="font-medium text-green-600">{t('carrito.gratis')}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t('carrito.total')}:</span>
                      <span className="text-orange-600">€{totalConImpuestos.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botón de proceder al pago */}
                  <button
                    onClick={() => onCambiarPantalla('pago')}
                    className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    {t('carrito.procederPago')}
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
