import React, { useState } from 'react';
import { ElementoMenu } from '../tipos/ElementoMenu';

// Interfaz para las props del componente
interface PropsModalPersonalizacion {
  producto: ElementoMenu;
  isOpen: boolean;
  onClose: () => void;
  onAgregarAlCarrito: (producto: ElementoMenu, cantidad: number, personalizacion: PersonalizacionHamburguesa) => void;
}

// Interfaz para la personalización de hamburguesas
export interface PersonalizacionHamburguesa {
  puntoCoccion: string;
  ingredientesExtra: string[];
  ingredientesRemovidos: string[];
  acompañamiento: string;
  precioExtra: number;
}

// Componente modal para personalizar hamburguesas
export function ModalPersonalizacion({ 
  producto, 
  isOpen, 
  onClose, 
  onAgregarAlCarrito 
}: PropsModalPersonalizacion) {
  // Estado para la cantidad
  const [cantidad, setCantidad] = useState(1);
  
  // Estado para la personalización
  const [personalizacion, setPersonalizacion] = useState<PersonalizacionHamburguesa>({
    puntoCoccion: 'medio',
    ingredientesExtra: [],
    ingredientesRemovidos: [],
    acompañamiento: 'papas-fritas',
    precioExtra: 0
  });

  // Opciones de punto de cocción
  const puntosCoccion = [
    { id: 'poco-hecho', nombre: 'Poco Hecho', descripcion: 'Jugoso y rosado en el centro' },
    { id: 'medio', nombre: 'Al Punto', descripcion: 'Equilibrio perfecto entre jugoso y cocido' },
    { id: 'bien-cocido', nombre: 'Muy Hecho', descripcion: 'Completamente cocido, sin rosado' }
  ];

  // Ingredientes extra disponibles
  const ingredientesExtra = [
    { id: 'bacon', nombre: 'Bacon Extra', precio: 2.50 },
    { id: 'queso-extra', nombre: 'Queso Extra', precio: 1.50 },
    { id: 'aguacate', nombre: 'Aguacate', precio: 2.00 },
    { id: 'cebolla-caramelizada', nombre: 'Cebolla Caramelizada', precio: 1.00 },
    { id: 'jalapeños', nombre: 'Jalapeños', precio: 0.75 },
    { id: 'champiñones', nombre: 'Champiñones Salteados', precio: 1.25 },
    { id: 'tomate-extra', nombre: 'Tomate Extra', precio: 0.50 },
    { id: 'pepinillos', nombre: 'Pepinillos Extra', precio: 0.50 }
  ];

  // Acompañamientos disponibles
  const acompañamientos = [
    { id: 'papas-fritas', nombre: 'Papas Fritas Clásicas', precio: 0 },
    { id: 'papas-camote', nombre: 'Papas de Camote', precio: 1.00 },
    { id: 'aros-cebolla', nombre: 'Aros de Cebolla', precio: 1.50 },
    { id: 'ensalada-cesar', nombre: 'Ensalada César', precio: 2.00 },
    { id: 'nuggets', nombre: 'Nuggets de Pollo (4 pzs)', precio: 2.50 }
  ];

  // Ingredientes base que se pueden remover (solo para hamburguesas)
  const ingredientesBase = producto.ingredientes || [];

  // Función para manejar cambio de punto de cocción
  const manejarCambioPunto = (punto: string) => {
    setPersonalizacion(prev => ({
      ...prev,
      puntoCoccion: punto
    }));
  };

  // Función para agregar/quitar ingrediente extra
  const toggleIngredienteExtra = (ingredienteId: string, precio: number) => {
    setPersonalizacion(prev => {
      const yaEstaAgregado = prev.ingredientesExtra.includes(ingredienteId);
      const nuevosIngredientes = yaEstaAgregado
        ? prev.ingredientesExtra.filter(id => id !== ingredienteId)
        : [...prev.ingredientesExtra, ingredienteId];
      
      const nuevoPrecioExtra = yaEstaAgregado
        ? prev.precioExtra - precio
        : prev.precioExtra + precio;

      return {
        ...prev,
        ingredientesExtra: nuevosIngredientes,
        precioExtra: nuevoPrecioExtra
      };
    });
  };

  // Función para remover/agregar ingrediente base
  const toggleIngredienteBase = (ingrediente: string) => {
    setPersonalizacion(prev => {
      const yaEstaRemovido = prev.ingredientesRemovidos.includes(ingrediente);
      const nuevosRemovidos = yaEstaRemovido
        ? prev.ingredientesRemovidos.filter(ing => ing !== ingrediente)
        : [...prev.ingredientesRemovidos, ingrediente];

      return {
        ...prev,
        ingredientesRemovidos: nuevosRemovidos
      };
    });
  };

  // Función para cambiar acompañamiento
  const manejarCambioAcompañamiento = (acompañamientoId: string) => {
    const acompañamientoAnterior = acompañamientos.find(a => a.id === personalizacion.acompañamiento);
    const acompañamientoNuevo = acompañamientos.find(a => a.id === acompañamientoId);
    
    const diferenciaPrecio = (acompañamientoNuevo?.precio || 0) - (acompañamientoAnterior?.precio || 0);

    setPersonalizacion(prev => ({
      ...prev,
      acompañamiento: acompañamientoId,
      precioExtra: prev.precioExtra + diferenciaPrecio
    }));
  };

  // Función para incrementar cantidad
  const incrementarCantidad = () => {
    setCantidad(prev => prev + 1);
  };

  // Función para decrementar cantidad
  const decrementarCantidad = () => {
    setCantidad(prev => prev > 1 ? prev - 1 : 1);
  };

  // Función para agregar al carrito
  const manejarAgregarAlCarrito = () => {
    onAgregarAlCarrito(producto, cantidad, personalizacion);
    onClose();
    // Resetear estados
    setCantidad(1);
    setPersonalizacion({
      puntoCoccion: 'medio',
      ingredientesExtra: [],
      ingredientesRemovidos: [],
      acompañamiento: 'papas-fritas',
      precioExtra: 0
    });
  };

  // Calcular precio total
  const precioBase = producto.precio;
  const precioTotal = (precioBase + personalizacion.precioExtra) * cantidad;

  console.log('Modal render - isOpen:', isOpen, 'producto:', producto?.nombre);
  
  if (!isOpen) {
    console.log('Modal no se muestra porque isOpen es false');
    return null;
  }

  console.log('Modal se está renderizando');

  return (
    // Overlay del modal
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
      onClick={(e) => {
        console.log('Click en overlay');
        onClose();
      }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Contenedor del modal */}
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => {
          console.log('Click en contenedor del modal');
          e.stopPropagation();
        }}
      >
        {/* Header del modal */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Personaliza tu {producto.nombre}</h2>
              <p className="text-gray-600 mt-1">Elige tus preferencias para una experiencia única</p>
            </div>
            <button
              onClick={(e) => {
                console.log('Botón cerrar clickeado');
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-8">
          
          {/* Solo mostrar opciones de carne si es una hamburguesa */}
          {producto.categoria === 'hamburguesas' && (
            <>
              {/* Punto de cocción */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Punto de Cocción</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {puntosCoccion.map((punto) => (
                    <div
                      key={punto.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        personalizacion.puntoCoccion === punto.id
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => manejarCambioPunto(punto.id)}
                    >
                      <h4 className="font-bold text-gray-800">{punto.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{punto.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredientes base - remover */}
              {ingredientesBase.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Ingredientes Base</h3>
                  <p className="text-gray-600 mb-4">Desmarca los ingredientes que no desees</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ingredientesBase.map((ingrediente, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!personalizacion.ingredientesRemovidos.includes(ingrediente)}
                          onChange={() => toggleIngredienteBase(ingrediente)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-gray-700">{ingrediente}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredientes extra */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ingredientes Extra</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ingredientesExtra.map((ingrediente) => (
                    <label
                      key={ingrediente.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={personalizacion.ingredientesExtra.includes(ingrediente.id)}
                          onChange={() => toggleIngredienteExtra(ingrediente.id, ingrediente.precio)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-gray-700">{ingrediente.nombre}</span>
                      </div>
                      <span className="text-orange-600 font-bold">+€{ingrediente.precio.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Acompañamiento */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Elige tu Acompañamiento</h3>
            <div className="space-y-3">
              {acompañamientos.map((acompañamiento) => (
                <label
                  key={acompañamiento.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    personalizacion.acompañamiento === acompañamiento.id
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="acompañamiento"
                      checked={personalizacion.acompañamiento === acompañamiento.id}
                      onChange={() => manejarCambioAcompañamiento(acompañamiento.id)}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-gray-700 font-medium">{acompañamiento.nombre}</span>
                  </div>
                  <span className={`font-bold ${acompañamiento.precio === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {acompañamiento.precio === 0 ? 'Incluido' : `+€${acompañamiento.precio.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Selector de cantidad */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Cantidad</h3>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={decrementarCantidad}
                  className="px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-lg min-w-[60px] text-center">
                  {cantidad}
                </span>
                <button
                  onClick={incrementarCantidad}
                  className="px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-gray-600">Precio base: €{precioBase.toFixed(2)}</div>
              {personalizacion.precioExtra > 0 && (
                <div className="text-sm text-orange-600">Extras: +€{personalizacion.precioExtra.toFixed(2)}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                Total: €{precioTotal.toFixed(2)}
              </div>
              {cantidad > 1 && (
                <div className="text-sm text-gray-600">
                  €{(precioBase + personalizacion.precioExtra).toFixed(2)} x {cantidad}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={(e) => {
                console.log('Botón cancelar clickeado');
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={(e) => {
                console.log('Botón agregar al carrito clickeado');
                e.preventDefault();
                e.stopPropagation();
                manejarAgregarAlCarrito();
              }}
              className="flex-2 bg-orange-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"/>
              </svg>
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
