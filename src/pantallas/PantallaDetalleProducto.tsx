import React, { useState } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { ElementoMenu } from '../tipos/ElementoMenu';

// Interfaz para las props del componente
interface PropsPantallaDetalleProducto {
  producto: ElementoMenu;
  onCambiarPantalla: (pantalla: 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas' | 'carrito') => void;
  onAgregarAlCarrito: (producto: ElementoMenu, cantidad: number, personalizacion?: PersonalizacionHamburguesa) => void;
}

// Interfaz para la personalización de hamburguesas
interface PersonalizacionHamburguesa {
  puntoCoccion: string;
  ingredientesExtra: string[];
  ingredientesRemovidos: string[];
  acompañamiento: string;
  bebida: string;
  precioExtra: number;
}

// Componente de la pantalla de detalle del producto
export function PantallaDetalleProducto({ 
  producto, 
  onCambiarPantalla, 
  onAgregarAlCarrito 
}: PropsPantallaDetalleProducto) {
  // Estado para controlar la cantidad a agregar al carrito
  const [cantidad, setCantidad] = useState(1);
  
  // Estado para mostrar confirmación de agregado al carrito
  const [agregadoAlCarrito, setAgregadoAlCarrito] = useState(false);

  // Estado para la personalización (solo para hamburguesas)
  const [personalizacion, setPersonalizacion] = useState<PersonalizacionHamburguesa>({
    puntoCoccion: 'medio',
    ingredientesExtra: [],
    ingredientesRemovidos: [],
    acompañamiento: 'papas-fritas',
    bebida: 'coca-cola',
    precioExtra: 0
  });


  // Opciones de punto de cocción
  const puntosCoccion = [
    { id: 'poco-hecho', nombre: 'Poco Hecho', descripcion: 'Jugoso y rosado en el centro', emoji: '🥩' },
    { id: 'medio', nombre: 'Al Punto', descripcion: 'Equilibrio perfecto entre jugoso y cocido', emoji: '🍖' },
    { id: 'bien-cocido', nombre: 'Muy Hecho', descripcion: 'Completamente cocido, sin rosado', emoji: '🥓' }
  ];

  // Ingredientes extra disponibles
  const ingredientesExtra = [
    { id: 'bacon', nombre: 'Bacon Extra', precio: 2.50, emoji: '🥓' },
    { id: 'queso-extra', nombre: 'Queso Extra', precio: 1.50, emoji: '🧀' },
    { id: 'aguacate', nombre: 'Aguacate', precio: 2.00, emoji: '🥑' },
    { id: 'cebolla-caramelizada', nombre: 'Cebolla Caramelizada', precio: 1.00, emoji: '🧅' },
    { id: 'jalapeños', nombre: 'Jalapeños', precio: 0.75, emoji: '🌶️' },
    { id: 'champiñones', nombre: 'Champiñones Salteados', precio: 1.25, emoji: '🍄' },
    { id: 'tomate-extra', nombre: 'Tomate Extra', precio: 0.50, emoji: '🍅' },
    { id: 'pepinillos', nombre: 'Pepinillos Extra', precio: 0.50, emoji: '🥒' }
  ];

  // Acompañamientos disponibles
  const acompañamientos = [
    { id: 'papas-fritas', nombre: 'Papas Fritas Clásicas', precio: 0, emoji: '🍟' },
    { id: 'papas-camote', nombre: 'Papas de Camote', precio: 1.00, emoji: '🍠' },
    { id: 'aros-cebolla', nombre: 'Aros de Cebolla', precio: 1.50, emoji: '🧅' },
    { id: 'ensalada-cesar', nombre: 'Ensalada César', precio: 2.00, emoji: '🥗' },
    { id: 'nuggets', nombre: 'Nuggets de Pollo (4 pzs)', precio: 2.50, emoji: '🍗' }
  ];

  // Obtener bebidas dinámicamente del menú
  const obtenerBebidasDelMenu = () => {
    // Importar el array de elementos del menú desde SeccionMenu
    const elementosMenu = [
      {
        id: 13,
        nombre: 'Coca-Cola',
        precio: '€2.79',
        categoria: 'bebidas'
      },
      {
        id: 14,
        nombre: 'Sprite',
        precio: '€2.79',
        categoria: 'bebidas'
      },
      {
        id: 15,
        nombre: 'Té Helado',
        precio: '€3.29',
        categoria: 'bebidas'
      },
      {
        id: 16,
        nombre: 'Malteada de Vainilla',
        precio: '€4.79',
        categoria: 'bebidas'
      },
      {
        id: 17,
        nombre: 'Jugo de Naranja Natural',
        precio: '€3.79',
        categoria: 'bebidas'
      },
      {
        id: 18,
        nombre: 'Café Americano',
        precio: '€2.29',
        categoria: 'bebidas'
      }
    ];

    return elementosMenu
      .filter(elemento => elemento.categoria === 'bebidas')
      .map(bebida => ({
        id: bebida.nombre.toLowerCase().replace(/\s+/g, '-').replace(/ñ/g, 'n'),
        nombre: bebida.nombre,
        precio: parseFloat(bebida.precio.replace('€', '')),
        emoji: obtenerEmojiBebida(bebida.nombre)
      }));
  };

  // Función para obtener emoji según el tipo de bebida
  const obtenerEmojiBebida = (nombreBebida: string) => {
    const emojis: { [key: string]: string } = {
      'coca-cola': '🥤',
      'sprite': '🥤',
      'té helado': '🧊',
      'malteada de vainilla': '🥛',
      'jugo de naranja natural': '🍊',
      'café americano': '☕'
    };
    return emojis[nombreBebida.toLowerCase()] || '🥤';
  };

  // Bebidas disponibles (se actualizan automáticamente del menú)
  const bebidasDisponibles = obtenerBebidasDelMenu();

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

  // Función para cambiar bebida
  const manejarCambioBebida = (bebidaId: string) => {
    const bebidaAnterior = bebidasDisponibles.find(b => b.id === personalizacion.bebida);
    const bebidaNueva = bebidasDisponibles.find(b => b.id === bebidaId);
    
    // Calcular diferencia de precio (sin bebida = 0)
    const precioAnterior = bebidaId === 'sin-bebida' ? 0 : (bebidaAnterior?.precio || 0);
    const precioNuevo = bebidaId === 'sin-bebida' ? 0 : (bebidaNueva?.precio || 0);
    const diferenciaPrecio = precioNuevo - precioAnterior;

    setPersonalizacion(prev => ({
      ...prev,
      bebida: bebidaId,
      precioExtra: prev.precioExtra + diferenciaPrecio
    }));
  };

  // Función para manejar el agregado al carrito
  const manejarAgregarAlCarrito = () => {
    if (producto.categoria === 'hamburguesas') {
      // Para hamburguesas, pasar la personalización
      onAgregarAlCarrito(producto, cantidad, personalizacion);
    } else {
      // Para otros productos, agregar sin personalización
      onAgregarAlCarrito(producto, cantidad);
    }
    
    setAgregadoAlCarrito(true);
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      setAgregadoAlCarrito(false);
    }, 2000);
  };

  // Función para renderizar estrellas de valoración
  const renderizarEstrellas = (valoracion: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <span
            key={estrella}
            className={estrella <= valoracion ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  // Función para incrementar la cantidad
  const incrementarCantidad = () => {
    setCantidad(prev => prev + 1);
  };

  // Función para decrementar la cantidad
  const decrementarCantidad = () => {
    setCantidad(prev => prev > 1 ? prev - 1 : 1);
  };

  return (
    // Contenedor principal de la pantalla de detalle
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado con navegación */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Botón de regreso */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => onCambiarPantalla('menu')}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Volver al Menú
        </button>
      </div>

      {/* Contenido principal */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Imagen del producto */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Información nutricional */}
            {producto.calorias && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Información Nutricional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{producto.calorias}</div>
                    <div className="text-sm text-gray-600">Calorías</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{producto.tiempoPreparacion}</div>
                    <div className="text-sm text-gray-600">Tiempo</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Encabezado del producto */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                  {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                </span>
                {producto.disponible && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Disponible
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {producto.nombre}
              </h1>
              
              {/* Valoración y reseñas */}
              {producto.valoracion && (
                <div className="flex items-center gap-4 mb-4">
                  {renderizarEstrellas(producto.valoracion)}
                  <span className="text-lg font-semibold text-gray-700">
                    {producto.valoracion}
                  </span>
                  <span className="text-gray-500">
                    ({producto.numeroReseñas} reseñas)
                  </span>
                </div>
              )}
              
              {/* Precio */}
              <div className="text-4xl font-bold text-orange-600 mb-6">
                {producto.precio}
              </div>
            </div>

            {/* Descripción detallada */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Descripción
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {producto.descripcionDetallada || producto.descripcion}
              </p>
            </div>

            {/* Ingredientes */}
            {producto.ingredientes && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Ingredientes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {producto.ingredientes.map((ingrediente, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {ingrediente}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Alérgenos */}
            {producto.alergenos && producto.alergenos.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  Información de Alérgenos
                </h3>
                <p className="text-yellow-700 mb-2">
                  Este producto contiene o puede contener:
                </p>
                <div className="flex flex-wrap gap-2">
                  {producto.alergenos.map((alergeno, index) => (
                    <span
                      key={index}
                      className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {alergeno}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personalización para hamburguesas */}
            {producto.categoria === 'hamburguesas' && (
              <>
                {/* Punto de cocción */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🔥</span>
                    Punto de Cocción
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {puntosCoccion.map((punto) => (
                      <div
                        key={punto.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          personalizacion.puntoCoccion === punto.id
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                        onClick={() => manejarCambioPunto(punto.id)}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{punto.emoji}</div>
                          <h4 className="font-bold text-gray-800 mb-1">{punto.nombre}</h4>
                          <p className="text-sm text-gray-600">{punto.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredientes base - remover */}
                {producto.ingredientes && producto.ingredientes.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📝</span>
                      Ingredientes Base
                    </h3>
                    <p className="text-gray-600 mb-4">Desmarca los ingredientes que no desees en tu hamburguesa</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {producto.ingredientes.map((ingrediente, index) => (
                        <label
                          key={index}
                          className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            !personalizacion.ingredientesRemovidos.includes(ingrediente)
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!personalizacion.ingredientesRemovidos.includes(ingrediente)}
                            onChange={() => toggleIngredienteBase(ingrediente)}
                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className={`font-medium ${
                            !personalizacion.ingredientesRemovidos.includes(ingrediente)
                              ? 'text-green-700'
                              : 'text-red-700 line-through'
                          }`}>
                            {ingrediente}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredientes extra */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">➕</span>
                    Ingredientes Extra
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ingredientesExtra.map((ingrediente) => (
                      <label
                        key={ingrediente.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          personalizacion.ingredientesExtra.includes(ingrediente.id)
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={personalizacion.ingredientesExtra.includes(ingrediente.id)}
                            onChange={() => toggleIngredienteExtra(ingrediente.id, ingrediente.precio)}
                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{ingrediente.emoji}</span>
                              <span className="text-gray-700 font-medium">{ingrediente.nombre}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-orange-600 font-bold">+€{ingrediente.precio.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Acompañamiento */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🍽️</span>
                    Elige tu Acompañamiento
                  </h3>
                  <div className="space-y-3">
                    {acompañamientos.map((acompañamiento) => (
                      <label
                        key={acompañamiento.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
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
                            className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{acompañamiento.emoji}</span>
                            <span className="text-gray-700 font-medium">{acompañamiento.nombre}</span>
                          </div>
                        </div>
                        <span className={`font-bold ${acompañamiento.precio === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {acompañamiento.precio === 0 ? 'Incluido' : `+€${acompañamiento.precio.toFixed(2)}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selección de Bebida */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🥤</span>
                    Elige tu Bebida
                  </h3>
                  <p className="text-gray-600 mb-4">Completa tu combo con una deliciosa bebida</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bebidasDisponibles.map((bebida) => (
                      <label
                        key={bebida.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          personalizacion.bebida === bebida.id
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="bebida"
                            checked={personalizacion.bebida === bebida.id}
                            onChange={() => manejarCambioBebida(bebida.id)}
                            className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{bebida.emoji}</span>
                            <span className="text-gray-700 font-medium">{bebida.nombre}</span>
                          </div>
                        </div>
                        <span className="text-orange-600 font-bold">
                          +€{bebida.precio.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Opción sin bebida */}
                  <label
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md mt-3 ${
                      personalizacion.bebida === 'sin-bebida'
                        ? 'border-gray-600 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="bebida"
                        checked={personalizacion.bebida === 'sin-bebida'}
                        onChange={() => manejarCambioBebida('sin-bebida')}
                        className="w-5 h-5 text-gray-600 border-gray-300 focus:ring-gray-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚫</span>
                        <span className="text-gray-700 font-medium">Sin Bebida</span>
                      </div>
                    </div>
                    <span className="text-gray-600 font-bold">
                      €0.00
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Selector de cantidad y botón de agregar */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🛒</span>
                Agregar al Carrito
              </h3>
              
              {/* Selector de cantidad */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Cantidad:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={decrementarCantidad}
                    className="px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-bold text-xl min-w-[80px] text-center bg-gray-50">
                    {cantidad}
                  </span>
                  <button
                    onClick={incrementarCantidad}
                    className="px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Resumen de personalización para hamburguesas */}
              {producto.categoria === 'hamburguesas' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">Resumen de tu Combo:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <strong>Punto de cocción:</strong> {puntosCoccion.find(p => p.id === personalizacion.puntoCoccion)?.nombre}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍽️</span>
                      <strong>Acompañamiento:</strong> {acompañamientos.find(a => a.id === personalizacion.acompañamiento)?.nombre}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🥤</span>
                      <strong>Bebida:</strong> {
                        personalizacion.bebida === 'sin-bebida' 
                          ? 'Sin Bebida' 
                          : bebidasDisponibles.find(b => b.id === personalizacion.bebida)?.nombre || 'No seleccionada'
                      }
                    </div>
                    {personalizacion.ingredientesExtra.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">➕</span>
                        <div>
                          <strong>Extras:</strong> {personalizacion.ingredientesExtra.map(id => ingredientesExtra.find(i => i.id === id)?.nombre).join(', ')}
                        </div>
                      </div>
                    )}
                    {personalizacion.ingredientesRemovidos.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">❌</span>
                        <div>
                          <strong>Sin:</strong> {personalizacion.ingredientesRemovidos.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Precio total */}
              <div className="flex justify-between items-center mb-6 p-4 bg-orange-50 rounded-lg">
                <div>
                  <span className="text-lg font-medium text-gray-700">Precio base:</span>
                  <div className="text-sm text-gray-600">€{parseFloat(producto.precio.replace('€', '')).toFixed(2)}</div>
                  {producto.categoria === 'hamburguesas' && personalizacion.precioExtra > 0 && (
                    <div className="text-sm text-orange-600">Extras: +€{personalizacion.precioExtra.toFixed(2)}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-orange-600">
                    €{((parseFloat(producto.precio.replace('€', '')) + (producto.categoria === 'hamburguesas' ? personalizacion.precioExtra : 0)) * cantidad).toFixed(2)}
                  </span>
                  {cantidad > 1 && (
                    <div className="text-sm text-gray-600">
                      €{(parseFloat(producto.precio.replace('€', '')) + (producto.categoria === 'hamburguesas' ? personalizacion.precioExtra : 0)).toFixed(2)} x {cantidad}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensaje de confirmación */}
              {agregadoAlCarrito && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <strong>¡Agregado al carrito!</strong> {cantidad} x {producto.nombre}
                  {producto.categoria === 'hamburguesas' && (
                    <div className="text-sm mt-1">Con tus personalizaciones seleccionadas</div>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-4">
                <button
                  onClick={manejarAgregarAlCarrito}
                  className="flex-1 bg-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"/>
                  </svg>
                  Agregar al Carrito
                </button>
                
                <button
                  onClick={() => onCambiarPantalla('carrito')}
                  className="bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors duration-300"
                >
                  Ver Carrito
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de productos relacionados */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            También te puede interesar
          </h2>
          <div className="text-center">
            <button
              onClick={() => onCambiarPantalla('menu')}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors duration-300"
            >
              Ver más productos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
