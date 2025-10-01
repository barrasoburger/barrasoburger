import React from 'react';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsSeccionDestacados {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas') => void;
}

// Componente para la sección de hamburguesas destacadas del chef
export function SeccionDestacados({ onCambiarPantalla }: PropsSeccionDestacados) {
  // Hook de idioma
  const { t } = useIdioma();
  return (
    // Sección con padding vertical y fondo de color crema
    <section className="py-20 px-4 bg-orange-50">
      {/* Contenedor principal con ancho máximo y centrado */}
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado de la sección */}
        <div className="text-center mb-16">
          {/* Título principal de la sección */}
          <h2 className="text-gray-800 text-5xl font-bold leading-tight tracking-tight mb-4 animate-fade-in">
            {t('destacados.titulo')}
          </h2>
          {/* Subtítulo descriptivo */}
          <p className="text-center text-gray-600 text-xl animate-fade-in-delayed">
            {t('destacados.subtitulo')}
          </p>
        </div>

        {/* Grid principal con dos columnas: imagen y contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          {/* Columna de la imagen */}
          <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 ease-in-out animate-fade-in-delayed">
            {/* Imagen de la hamburguesa destacada */}
            <img 
              alt="Hamburguesa del Mes - La Volcán de Queso" 
              className="w-full h-auto object-cover"
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1999&q=80"
              loading="lazy"
            />
          </div>

          {/* Columna del contenido descriptivo */}
          <div className="animate-fade-in-delayed-more">
            {/* Etiqueta de categoría */}
            <span className="text-orange-700 font-bold text-lg">
              {t('destacados.hamburgesaMes')}
            </span>
            
            {/* Nombre de la hamburguesa destacada */}
            <h3 className="text-gray-800 text-4xl font-extrabold mt-2 mb-4">
              {t('destacados.volcanQueso')}
            </h3>
            
            {/* Descripción detallada de la hamburguesa */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {t('destacados.descripcion')}
            </p>
            
            {/* Botón de llamada a la acción */}
            <button 
              className="mt-6 px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
              onClick={() => onCambiarPantalla('menu')}
            >
              {t('destacados.probarAhora')}
            </button>
          </div>
        </div>

        {/* Sección adicional con estadísticas o características */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          {/* Característica 1: Ingredientes frescos */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Icono de ingredientes frescos */}
            <div className="text-4xl mb-4">🥬</div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{t('destacados.ingredientesFrescos')}</h4>
            <p className="text-gray-600">{t('destacados.ingredientesDesc')}</p>
          </div>

          {/* Característica 2: Carne premium */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Icono de carne premium */}
            <div className="text-4xl mb-4">🥩</div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{t('destacados.carnePremium')}</h4>
            <p className="text-gray-600">{t('destacados.carneDesc')}</p>
          </div>

          {/* Característica 3: Preparación artesanal */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Icono de preparación artesanal */}
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{t('destacados.preparacionArtesanal')}</h4>
            <p className="text-gray-600">{t('destacados.preparacionDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
