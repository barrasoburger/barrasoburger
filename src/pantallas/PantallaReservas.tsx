import React, { useState } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';

// Interfaz para las props del componente
interface PropsPantallaReservas {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas') => void;
}

// Interfaz para los datos del formulario de reserva
interface DatosReserva {
  nombre: string;
  apellido1: string;
  apellido2: string;
  dni: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  personas: string;
  comentarios: string;
}

// Componente de la pantalla de reservas
export function PantallaReservas({ onCambiarPantalla }: PropsPantallaReservas) {
  // Estado para manejar los datos del formulario
  const [datosReserva, setDatosReserva] = useState<DatosReserva>({
    nombre: '',
    apellido1: '',
    apellido2: '',
    dni: '',
    telefono: '',
    email: '',
    fecha: '',
    hora: '',
    personas: '2',
    comentarios: ''
  });

  // Estado para controlar si el formulario fue enviado
  const [reservaEnviada, setReservaEnviada] = useState(false);

  // Función para manejar cambios en los campos del formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatosReserva(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar el envío del formulario
  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se procesaría la reserva
    console.log('Reserva enviada:', datosReserva);
    setReservaEnviada(true);
    
    // Resetear formulario después de 3 segundos
    setTimeout(() => {
      setReservaEnviada(false);
      setDatosReserva({
        nombre: '',
        apellido1: '',
        apellido2: '',
        dni: '',
        telefono: '',
        email: '',
        fecha: '',
        hora: '',
        personas: '2',
        comentarios: ''
      });
    }, 3000);
  };

  return (
    // Contenedor principal de la pantalla de reservas
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de bienvenida a reservas */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
            Reserva tu Mesa
          </h1>
          <p className="text-xl animate-fade-in-up">
            Asegura tu lugar en BarrasoBurger y disfruta de una experiencia gastronómica única
          </p>
        </div>
      </section>
      
      {/* Sección principal de reservas */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Información del restaurante */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Información del Restaurante
              </h2>
              
              {/* Horarios de atención */}
              <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">🕒</span>
                  Horarios de Atención
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Lunes - Jueves:</span>
                    <span className="font-medium">11:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Viernes - Sábado:</span>
                    <span className="font-medium">11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo:</span>
                    <span className="font-medium">12:00 PM - 8:00 PM</span>
                  </div>
                </div>
              </div>
              
              {/* Ubicación */}
              <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  Ubicación
                </h3>
                <p className="text-gray-600 mb-4">
                  Calle de las Hamburguesas 123<br />
                  Centro Comercial Plaza Mayor<br />
                  Ciudad, Estado 12345
                </p>
                <p className="text-gray-600">
                  <strong>Teléfono:</strong> (555) 123-4567<br />
                  <strong>Email:</strong> reservas@barrasoburger.com
                </p>
              </div>
              
              {/* Políticas de reserva */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  Políticas de Reserva
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Las reservas se confirman por teléfono o email</li>
                  <li>• Tiempo de gracia: 15 minutos</li>
                  <li>• Para grupos de 8+ personas, contactar directamente</li>
                  <li>• Cancelaciones con 2 horas de anticipación</li>
                </ul>
              </div>
            </div>
            
            {/* Formulario de reserva */}
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                  Formulario de Reserva
                </h2>
                
                {/* Mensaje de confirmación */}
                {reservaEnviada && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <strong>¡Reserva enviada exitosamente!</strong><br />
                    Te contactaremos pronto para confirmar tu reserva.
                  </div>
                )}
                
                <form onSubmit={manejarEnvio} className="space-y-6">
                  {/* Nombre y apellidos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        value={datosReserva.nombre}
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
                        value={datosReserva.apellido1}
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
                        value={datosReserva.apellido2}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Segundo apellido"
                      />
                    </div>
                  </div>

                  {/* DNI (opcional) */}
                  <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                      DNI (Opcional)
                    </label>
                    <input
                      type="text"
                      id="dni"
                      name="dni"
                      value={datosReserva.dni}
                      onChange={manejarCambio}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="12345678X"
                      maxLength={9}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      El DNI es opcional pero nos ayuda a identificar mejor tu reserva
                    </p>
                  </div>
                  
                  {/* Teléfono y Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        value={datosReserva.telefono}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="(555) 123-4567"
                      />
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
                        value={datosReserva.email}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  
                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        required
                        value={datosReserva.fecha}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-2">
                        Hora *
                      </label>
                      <select
                        id="hora"
                        name="hora"
                        required
                        value={datosReserva.hora}
                        onChange={manejarCambio}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Seleccionar hora</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="14:30">2:30 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="15:30">3:30 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="16:30">4:30 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="17:30">5:30 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="18:30">6:30 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="19:30">7:30 PM</option>
                        <option value="20:00">8:00 PM</option>
                        <option value="20:30">8:30 PM</option>
                        <option value="21:00">9:00 PM</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Número de personas */}
                  <div>
                    <label htmlFor="personas" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Personas *
                    </label>
                    <select
                      id="personas"
                      name="personas"
                      required
                      value={datosReserva.personas}
                      onChange={manejarCambio}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="1">1 persona</option>
                      <option value="2">2 personas</option>
                      <option value="3">3 personas</option>
                      <option value="4">4 personas</option>
                      <option value="5">5 personas</option>
                      <option value="6">6 personas</option>
                      <option value="7">7 personas</option>
                      <option value="8">8+ personas (contactar directamente)</option>
                    </select>
                  </div>
                  
                  {/* Comentarios adicionales */}
                  <div>
                    <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                      Comentarios Adicionales
                    </label>
                    <textarea
                      id="comentarios"
                      name="comentarios"
                      rows={4}
                      value={datosReserva.comentarios}
                      onChange={manejarCambio}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ocasión especial, alergias alimentarias, preferencias de mesa, etc."
                    />
                  </div>
                  
                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={reservaEnviada}
                    className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reservaEnviada ? 'Reserva Enviada ✓' : 'Enviar Reserva'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
