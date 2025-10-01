import React from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { SeccionMenu } from '../componentes/SeccionMenu';
import { ElementoMenu } from '../tipos/ElementoMenu';
import { ElementoCarrito } from '../App';
import { useIdioma } from '../contextos/ContextoIdioma';

// Interfaz para las props del componente
interface PropsPantallaMenu {
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas' | 'carrito') => void;
  onVerDetalleProducto: (producto: ElementoMenu) => void;
  onAgregarAlCarrito: (producto: ElementoMenu, cantidad?: number, personalizacion?: any) => void;
  carrito: ElementoCarrito[];
  totalCarrito: number;
}

// Componente de la pantalla del menú
export function PantallaMenu({ 
  onCambiarPantalla, 
  onVerDetalleProducto, 
  onAgregarAlCarrito, 
  carrito, 
  totalCarrito 
}: PropsPantallaMenu) {
  // Hook de idioma
  const { t } = useIdioma();
  return (
    // Contenedor principal de la pantalla del menú
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner de bienvenida al menú */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-down">
            {t('menu.completo')}
          </h1>
          <p className="text-xl animate-fade-in-up">
            {t('menu.descripcionCompleta')}
          </p>
        </div>
      </section>
      
      {/* Sección completa del menú con categorías */}
      <SeccionMenu 
        onVerDetalleProducto={onVerDetalleProducto}
        onAgregarAlCarrito={onAgregarAlCarrito}
        onCambiarPantalla={onCambiarPantalla}
        carrito={carrito}
        totalCarrito={totalCarrito}
      />

      {/* Botón flotante del carrito (solo visible si hay elementos) */}
      {totalCarrito > 0 && (
        <div className="fixed bottom-8 right-8 z-40">
          <button 
            onClick={() => onCambiarPantalla('carrito')}
            className="bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:bg-orange-700 transition-all duration-300 hover:scale-110"
          >
            {/* Icono del carrito */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"/>
            </svg>
            
            {/* Contador de elementos en el carrito */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {totalCarrito}
            </div>
          </button>
        </div>
      )}
      
      {/* Sección de información adicional */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('menu.calidadBocado')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('menu.calidadDesc')}
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">18+</div>
                  <div className="text-sm text-gray-600">{t('menu.opcionesMenu')}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">100%</div>
                  <div className="text-sm text-gray-600">{t('menu.ingredientesFrescos')}</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Chef preparando hamburguesas"
                className="w-full h-auto rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
