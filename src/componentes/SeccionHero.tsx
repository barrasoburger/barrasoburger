import React, { useState, useEffect } from 'react';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsSeccionHero {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas') => void;
}

// Componente de la sección principal (hero) con carrusel de imágenes
export function SeccionHero({ onCambiarPantalla }: PropsSeccionHero) {
  // Hook de idioma
  const { t } = useIdioma();
  // Estado para controlar qué imagen del carrusel está activa
  const [imagenActiva, setImagenActiva] = useState(0);

  // Array de URLs de imágenes para el carrusel de fondo
  const imagenesCarrusel = [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1999&q=80',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=2065&q=80'
  ];

  // Efecto para cambiar automáticamente las imágenes del carrusel cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      // Cambiar a la siguiente imagen, volviendo a la primera después de la última
      setImagenActiva((prevImagen) => (prevImagen + 1) % imagenesCarrusel.length);
    }, 5000); // 5000ms = 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, [imagenesCarrusel.length]);

  return (
    // Sección principal con altura de 70% del viewport y posición relativa para el carrusel
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden text-white">
      
      {/* Contenedor del carrusel de imágenes de fondo */}
      <div className="absolute inset-0">
        {imagenesCarrusel.map((imagen, indice) => (
          // Cada imagen del carrusel con transición de opacidad
          <div
            key={indice}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              indice === imagenActiva ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              // Imagen de fondo con gradiente oscuro superpuesto para mejorar legibilidad del texto
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${imagen})`
            }}
          />
        ))}
      </div>

      {/* Contenido principal superpuesto sobre las imágenes */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
        {/* Título principal con animación de entrada */}
        <h1 
          className="text-5xl md:text-8xl font-black tracking-tighter mb-4 animate-fade-in-down"
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
        >
          {t('hero.titulo')}
        </h1>
        
        {/* Subtítulo descriptivo con animación de entrada retrasada */}
        <p className="mt-4 max-w-2xl text-lg md:text-2xl text-gray-200 mb-10 animate-fade-in-up">
          {t('hero.subtitulo')}
        </p>
        
        {/* Contenedor de botones de llamada a la acción */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Botón principal para hacer pedido */}
          <button 
            className="grupo-boton flex items-center justify-center gap-3 min-w-[220px] h-20 px-12 bg-orange-600 text-white text-2xl font-bold rounded-full shadow-lg hover:bg-orange-700 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            onClick={() => onCambiarPantalla('menu')}
          >
            {/* Emoji de hamburguesa con animación en hover */}
            <span className="icono-boton text-3xl">🍔</span>
            <span>{t('hero.hacerPedido')}</span>
          </button>
          
          {/* Botón secundario para reservar mesa */}
          <button 
            className="grupo-boton flex items-center justify-center gap-3 min-w-[220px] h-20 px-12 bg-white text-gray-800 text-2xl font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            onClick={() => onCambiarPantalla('reservas')}
          >
            {/* Emoji de calendario con animación en hover */}
            <span className="icono-boton text-3xl">📅</span>
            <span>{t('hero.reservarMesa')}</span>
          </button>
        </div>
      </div>

      {/* Indicadores del carrusel en la parte inferior */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {imagenesCarrusel.map((_, indice) => (
          // Punto indicador para cada imagen del carrusel
          <button
            key={indice}
            className={`w-3 h-3 rounded-full transition-colors ${
              indice === imagenActiva ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setImagenActiva(indice)}
          />
        ))}
      </div>
    </section>
  );
}
