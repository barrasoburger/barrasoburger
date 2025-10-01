import React, { useState } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { ElementoCarrito } from '../App';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaPago {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas' | 'carrito') => void;
  carrito: ElementoCarrito[];
  precioTotal: number;
  onVaciarCarrito: () => void;
}

// Interfaz para los datos del formulario de pago
interface DatosPago {
  nombre: string;
  apellido1: string;
  apellido2: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  metodoPago: 'bizum' | 'tarjeta' | 'paypal';
  // Datos específicos para tarjeta
  numeroTarjeta: string;
  fechaExpiracion: string;
  cvv: string;
  nombreTarjeta: string;
  // Datos específicos para Bizum
  telefonoBizum: string;
  comentarios: string;
}

// Componente de la pantalla de pago
export function PantallaPago({ 
  onCambiarPantalla, 
  carrito, 
  precioTotal, 
  onVaciarCarrito 
}: PropsPantallaPago) {
  // Estado para los datos del formulario de pago
  const [datosPago, setDatosPago] = useState<DatosPago>({
    nombre: '',
    apellido1: '',
    apellido2: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    metodoPago: 'bizum',
    numeroTarjeta: '',
    fechaExpiracion: '',
    cvv: '',
    nombreTarjeta: '',
    telefonoBizum: '',
    comentarios: ''
  });
  
  // Estado para controlar si el pedido fue enviado
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  
  // Estado para mostrar información de pago
  const [mostrarInfoPago, setMostrarInfoPago] = useState(false);

  // Función para manejar cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatosPago(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para procesar el pago
  const procesarPago = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Pedido procesado:', { carrito, datosPago, total: precioTotal });
    setMostrarInfoPago(true);
  };

  // Calcular impuestos y total
  const impuestos = precioTotal * 0.1;
  const totalConImpuestos = precioTotal + impuestos;

  // Función para generar enlaces de pago directo
  const generarEnlacePago = (metodoPago: string) => {
    const concepto = `BarrasoBurger Pedido ${Date.now()}`;
    const importe = totalConImpuestos.toFixed(2);
    
    switch (metodoPago) {
      case 'bizum':
        // Enlace para abrir la aplicación Bizum
        return `bizum://send?phone=644548321&amount=${importe}&concept=${encodeURIComponent(concepto)}`;
      
      case 'tarjeta':
        // Enlace para abrir la aplicación bancaria con datos de transferencia
        return `banking://transfer?iban=ES1115860001410795271011&amount=${importe}&concept=${encodeURIComponent(concepto)}`;
      
      case 'paypal':
        // Enlace para abrir PayPal con el pago
        return `https://www.paypal.com/paypalme/javierbarraso20/${importe}EUR`;
      
      default:
        return '#';
    }
  };

  // Función para procesar el pago directo
  const procesarPagoDirecto = (metodoPago: string) => {
    const enlace = generarEnlacePago(metodoPago);
    
    // Intentar abrir la aplicación correspondiente
    window.open(enlace, '_blank');
    
    // Crear el pedido en la base de datos si el usuario está autenticado
    const { usuarioActual, clienteActual, esCliente } = useAuth();
    
    if (esCliente && clienteActual) {
      // Crear productos para la base de datos
      const productosParaBD = carrito.map(item => ({
        producto: item.producto.nombre + (item.personalizacion ? ' (Personalizada)' : ''),
        cantidad: item.cantidad,
        precio_unitario: item.precioPersonalizado || parseFloat(item.producto.precio.replace('€', ''))
      }));
      
      // Crear el pedido con información adicional
      baseDatos.crearPedido(
        clienteActual.id_cliente, 
        totalConImpuestos, 
        productosParaBD,
        datosPago.direccion || 'Dirección no especificada',
        datosPago.telefono || clienteActual.telefono,
        metodoPago === 'bizum' ? 'Bizum' : metodoPago === 'tarjeta' ? 'Transferencia Bancaria' : 'PayPal'
      );
    }
    
    // Mostrar mensaje de confirmación
    setPedidoEnviado(true);
    
    // Simular procesamiento y limpiar carrito después de 5 segundos
    setTimeout(() => {
      onVaciarCarrito();
      setPedidoEnviado(false);
      onCambiarPantalla('inicio');
    }, 5000);
  };

  return (
    // Contenedor principal de la pantalla de pago
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de pago */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
            Finalizar Pedido
          </h1>
          <p className="text-xl animate-fade-in-up">
            Completa tu información para procesar el pago
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Botón de regreso */}
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla('carrito')}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver al Carrito
            </button>
          </div>

          {/* Verificar si el pedido fue enviado */}
          {pedidoEnviado ? (
            // Confirmación de pedido enviado
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-6xl mb-6">✅</div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  ¡Pedido Confirmado!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Tu pedido ha sido procesado exitosamente. Te contactaremos pronto para confirmar la entrega.
                </p>
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <p className="text-green-800 font-medium">
                    Número de pedido: #{Date.now()}
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Recibirás un email de confirmación en breve
                  </p>
                  
                  {/* Mostrar puntos ganados si está autenticado */}
                  {(() => {
                    const { esCliente, clienteActual } = useAuth();
                    return esCliente && clienteActual && (
                      <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                        <p className="text-orange-800 font-medium flex items-center">
                          <span className="text-lg mr-2">⭐</span>
                          ¡Has ganado {Math.floor(totalConImpuestos)} puntos de lealtad!
                        </p>
                        <p className="text-orange-700 text-sm">
                          Puntos totales: {clienteActual.puntos + Math.floor(totalConImpuestos)}
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <button
                  onClick={() => onCambiarPantalla('inicio')}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          ) : (
            // Formulario de pago
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Formulario */}
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-800 mb-8">
                    Información de Pago
                  </h2>
                  
                  <form onSubmit={procesarPago} className="space-y-6">
                    
                    {/* Información personal */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Datos Personales
                      </h3>
                      
                      {/* Nombre y apellidos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            required
                            value={datosPago.nombre}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700 mb-2">
                            Primer Apellido *
                          </label>
                          <input
                            type="text"
                            id="apellido1"
                            name="apellido1"
                            required
                            value={datosPago.apellido1}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Primer apellido"
                          />
                        </div>
                        <div>
                          <label htmlFor="apellido2" className="block text-sm font-medium text-gray-700 mb-2">
                            Segundo Apellido *
                          </label>
                          <input
                            type="text"
                            id="apellido2"
                            name="apellido2"
                            required
                            value={datosPago.apellido2}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Segundo apellido"
                          />
                        </div>
                      </div>

                      {/* DNI y Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                            DNI (Opcional)
                          </label>
                          <input
                            type="text"
                            id="dni"
                            name="dni"
                            value={datosPago.dni}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="12345678X"
                            maxLength={9}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Opcional, pero útil para identificar el pedido
                          </p>
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={datosPago.email}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono *
                          </label>
                          <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            required
                            value={datosPago.telefono}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="644 123 456"
                          />
                        </div>
                        <div>
                          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección de Entrega *
                          </label>
                          <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            required
                            value={datosPago.direccion}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Calle, número, ciudad"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Comentarios adicionales */}
                    <div>
                      <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                        Comentarios Adicionales
                      </label>
                      <textarea
                        id="comentarios"
                        name="comentarios"
                        rows={3}
                        value={datosPago.comentarios}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Instrucciones especiales, referencias de entrega, etc."
                      />
                    </div>

                    {/* Botones de pago directo */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        Selecciona tu Método de Pago
                      </h3>
                      
                      {/* Botón Bizum */}
                      <button
                        type="button"
                        onClick={() => procesarPagoDirecto('bizum')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <span className="text-2xl">📱</span>
                        <div className="text-left">
                          <div>Pagar con Bizum</div>
                          <div className="text-sm opacity-90">€{totalConImpuestos.toFixed(2)} - Pago instantáneo</div>
                        </div>
                      </button>

                      {/* Botón Transferencia Bancaria */}
                      <button
                        type="button"
                        onClick={() => procesarPagoDirecto('tarjeta')}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <span className="text-2xl">🏦</span>
                        <div className="text-left">
                          <div>Transferencia Bancaria</div>
                          <div className="text-sm opacity-90">€{totalConImpuestos.toFixed(2)} - Abrir app bancaria</div>
                        </div>
                      </button>

                      {/* Botón PayPal */}
                      <button
                        type="button"
                        onClick={() => procesarPagoDirecto('paypal')}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <span className="text-2xl">💳</span>
                        <div className="text-left">
                          <div>Pagar con PayPal</div>
                          <div className="text-sm opacity-90">€{totalConImpuestos.toFixed(2)} - Pago seguro</div>
                        </div>
                      </button>
                    </div>

                    {/* Información de seguridad */}
                    <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl">
                      <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                        <span className="text-2xl mr-2">🔒</span>
                        Pago 100% Seguro
                      </h4>
                      <ul className="text-green-700 space-y-2 text-sm">
                        <li>• Al hacer click, se abrirá tu aplicación de pago</li>
                        <li>• Los datos se rellenan automáticamente</li>
                        <li>• Solo confirma el pago en tu aplicación</li>
                        <li>• Recibirás confirmación inmediata</li>
                      </ul>
                    </div>
                  </form>
                </div>
              </div>

              {/* Resumen del pedido */}
              <div>
                <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Resumen del Pedido
                  </h3>
                  
                  {/* Lista de productos */}
                  <div className="space-y-4 mb-6">
                    {carrito.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {item.cantidad}x {item.producto.nombre}
                          </h4>
                          {item.personalizacion && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.personalizacion.puntoCoccion !== 'medio' && (
                                <span>• {item.personalizacion.puntoCoccion.replace('-', ' ')}</span>
                              )}
                              {item.personalizacion.ingredientesExtra.length > 0 && (
                                <span> • Extras</span>
                              )}
                              {item.personalizacion.bebida !== 'sin-bebida' && (
                                <span> • Con bebida</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-orange-600">
                          €{((item.precioPersonalizado || parseFloat(item.producto.precio.replace('€', ''))) * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Desglose de precios */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">€{precioTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impuestos (10%):</span>
                      <span className="font-medium">€{impuestos.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío:</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total a Pagar:</span>
                      <span className="text-orange-600">€{totalConImpuestos.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Información de seguridad */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <span className="text-green-800 font-bold text-sm">Pago Seguro</span>
                    </div>
                    <p className="text-green-700 text-xs">
                      Todos los métodos de pago son seguros y están protegidos
                    </p>
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
