import React from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { SeccionHero } from '../componentes/SeccionHero';
import { SeccionDestacados } from '../componentes/SeccionDestacados';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsPantallaInicio {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas') => void;
}

// Componente de la pantalla de inicio
export function PantallaInicio({ onCambiarPantalla }: PropsPantallaInicio) {
  // Hook de idioma
  const { t } = useIdioma();
  return (
    // Contenedor principal de la pantalla de inicio
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Sección principal con imagen de fondo y llamadas a la acción */}
      <SeccionHero onCambiarPantalla={onCambiarPantalla} />
      
      {/* Sección de hamburguesas destacadas del chef */}
      <SeccionDestacados onCambiarPantalla={onCambiarPantalla} />
      
      {/* Sección de llamada a la acción para ver el menú completo */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            {t('inicio.listoSabor') || '¿Listo para más sabor?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('inicio.exploraMenu') || 'Explora nuestro menú completo con hamburguesas, acompañamientos y bebidas'}
          </p>
          <button
            onClick={() => onCambiarPantalla('menu')}
            className="bg-orange-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-orange-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {t('inicio.verMenuCompleto') || 'Ver Menú Completo'}
          </button>
        </div>
      </section>
    </div>
  );
}
