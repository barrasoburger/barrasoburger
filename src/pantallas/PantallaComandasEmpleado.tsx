import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, Pedido, ProductoMenu, Cliente } from '../servicios/BaseDatos';
import { ElementoMenu } from '../tipos/ElementoMenu'; // Importar ElementoMenu
import { ModalPersonalizacion, PersonalizacionHamburguesa } from '../componentes/ModalPersonalizacion'; // Importar ModalPersonalizacion y PersonalizacionHamburguesa

// Interfaz para las props del componente
interface PropsPantallaComandasEmpleado {
  onCambiarPantalla: (pantalla: any) => void;
}

// Interfaz para un elemento de comanda en el carrito interno
interface ElementoComanda {
  producto: ElementoMenu;
  cantidad: number;
  personalizacion?: PersonalizacionHamburguesa;
  precioPersonalizado?: number;
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

// Componente de la pantalla de comandas para empleados
export function PantallaComandasEmpleado({ onCambiarPantalla }: PropsPantallaComandasEmpleado) {
  // Hook de autenticación
  const { usuarioActual, esAdmin, esEmpleado } = useAuth();
  
  // Estados para el menú y la comanda actual
  const [productosMenu, setProductosMenu] = useState<ProductoMenu[]>([]);
  const [comandaActual, setComandaActual] = useState<ElementoComanda[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<'hamburguesas' | 'acompañamientos' | 'bebidas'>('hamburguesas');
  
  // Estados para el cliente de la comanda
  const [codigoCliente, setCodigoCliente] = useState('');
  const [clienteComanda, setClienteComanda] = useState<(Cliente & { username: string }) | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState('');

  // Estados para el modal de personalización
  const [modalPersonalizacionAbierto, setModalPersonalizacionAbierto] = useState(false);
  const [productoParaPersonalizar, setProductoParaPersonalizar] = useState<ElementoMenu | null>(null);

  // Cargar productos del menú al montar el componente
  useEffect(() => {
    cargarProductosMenu();
    
    // Escuchar eventos de actualización de productos
    const manejarProductosActualizados = () => {
      console.log('Productos actualizados, recargando menú...');
      cargarProductosMenu();
    };
    window.addEventListener('productosActualizados', manejarProductosActualizados);
    
    return () => {
      window.removeEventListener('productosActualizados', manejarProductosActualizados);
    };
  }, []);

  // Función para cargar productos del menú
  const cargarProductosMenu = () => {
    const productosDisponibles = baseDatos.obtenerTodosLosProductos().filter(p => p.disponible);
    setProductosMenu(productosDisponibles);
  };

  // Filtrar productos por categoría activa
  const productosFiltrados = productosMenu.filter(
    (producto) => producto.categoria === categoriaActiva
  );

  // Función para buscar cliente por código único o username
  const buscarCliente = () => {
    setBuscandoCliente(true);
    setErrorCliente('');
    setClienteComanda(null);

    if (!codigoCliente.trim()) {
      setErrorCliente('Por favor, introduce un código o nombre de usuario.');
      setBuscandoCliente(false);
      return;
    }

    const clienteEncontrado = baseDatos.buscarClientePorCodigo(codigoCliente.trim());
    
    if (clienteEncontrado) {
      setClienteComanda(clienteEncontrado);
      setErrorCliente('');
    } else {
      setErrorCliente('Cliente no encontrado. Verifica el código o nombre de usuario.');
    }
    setBuscandoCliente(false);
  };

  // Función para agregar producto a la comanda
  const agregarAComanda = (producto: ElementoMenu, cantidad: number = 1, personalizacion?: PersonalizacionHamburguesa) => {
    setComandaActual(prevComanda => {
      const precioBase = producto.precio;
      const precioPersonalizado = personalizacion ? precioBase + personalizacion.precioExtra : precioBase;

      // Para hamburguesas personalizadas, siempre crear una nueva entrada
      if (personalizacion) {
        return [...prevComanda, { 
          producto, 
          cantidad, 
          personalizacion,
          precioPersonalizado 
        }];
      }
      
      // Para productos sin personalización, buscar si ya existe
      const elementoExistente = prevComanda.find(item => 
        item.producto.id === producto.id && !item.personalizacion
      );
      
      if (elementoExistente) {
        // Si el producto ya existe, aumentar la cantidad
        return prevComanda.map(item =>
          item.producto.id === producto.id && !item.personalizacion
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo a la comanda
        return [...prevComanda, { producto, cantidad }];
      }
    });
  };

  // Función para actualizar cantidad en la comanda
  const actualizarCantidadComanda = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setComandaActual(prevComanda => prevComanda.filter((_, i) => i !== index));
    } else {
      setComandaActual(prevComanda => 
        prevComanda.map((item, i) => 
          i === index ? { ...item, cantidad: nuevaCantidad } : item
        )
      );
    }
  };

  // Función para eliminar producto de la comanda
  const eliminarDeComanda = (index: number) => {
    setComandaActual(prevComanda => prevComanda.filter((_, i) => i !== index));
  };

  // Calcular total de la comanda
  const totalComanda = comandaActual.reduce((total, item) => {
    const precio = item.precioPersonalizado || item.producto.precio;
    return total + (precio * item.cantidad);
  }, 0);

  // Función para finalizar comanda (crear pedido)
  const finalizarComanda = () => {
    if (comandaActual.length === 0) {
      alert('La comanda está vacía. Agrega productos antes de finalizar.');
      return;
    }

    if (!clienteComanda) {
      if (!confirm('¿Deseas finalizar la comanda sin asociarla a un cliente? Los puntos de lealtad no se aplicarán.')) {
        return;
      }
    }

    const productosParaPedido = comandaActual.map(item => ({
      producto: item.producto.nombre + (item.personalizacion ? ' (Personalizada)' : ''),
      cantidad: item.cantidad,
      precio_unitario: item.precioPersonalizado || item.producto.precio
    }));

    try {
      const nuevoPedido = baseDatos.crearPedido(
        clienteComanda?.id_cliente || 0, // Si no hay cliente, usar ID 0 o un ID de "invitado"
        totalComanda,
        productosParaPedido,
        'Recogida en local', // Por defecto para comandas de empleado
        clienteComanda?.telefono || 'N/A',
        'Pago en local'
      );
      
      alert(`Comanda finalizada. Pedido #${nuevoPedido.id_pedido} creado. Total: €${totalComanda.toFixed(2)}`);
      
      // Si hay cliente, actualizar sus puntos en el contexto
      if (clienteComanda) {
        baseDatos.agregarPuntos(clienteComanda.id_cliente, Math.floor(totalComanda));
        // Recargar datos del cliente para reflejar los puntos actualizados
        setClienteComanda(baseDatos.buscarClientePorCodigo(clienteComanda.codigo_unico));
      }

      // Resetear comanda y cliente
      setComandaActual([]);
      setClienteComanda(null);
      setCodigoCliente('');
      setErrorCliente('');
    } catch (error) {
      console.error('Error al finalizar comanda:', error);
      alert('Error al finalizar la comanda. Inténtalo de nuevo.');
    }
  };

  // Función para abrir el modal de personalización
  const abrirModalPersonalizacion = (producto: ElementoMenu) => {
    setProductoParaPersonalizar(producto);
    setModalPersonalizacionAbierto(true);
  };

  // Función para cerrar el modal de personalización
  const cerrarModalPersonalizacion = () => {
    setModalPersonalizacionAbierto(false);
    setProductoParaPersonalizar(null);
  };

  // Función para agregar al carrito desde el modal
  const agregarAComandaDesdeModal = (producto: ElementoMenu, cantidad: number, personalizacion: PersonalizacionHamburguesa) => {
    agregarAComanda(producto, cantidad, personalizacion);
    cerrarModalPersonalizacion();
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

  // Verificar permisos
  if (!esAdmin && !esEmpleado) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo administradores y empleados pueden tomar comandas</p>
          <button
            onClick={() => onCambiarPantalla('inicio')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    // Contenedor principal
    <div className="min-h-screen bg-orange-50">
      {/* Encabezado */}
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      {/* Banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🍽️ Tomar Comandas</h1>
              <p className="text-xl text-purple-100">
                Gestiona pedidos en el restaurante y asigna puntos de lealtad
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full backdrop-blur-sm">
                  <span className="text-purple-200 font-medium">
                    {esAdmin ? '👑 Administrador' : '👨‍💼 Empleado'}
                  </span>
                </div>
                <div className="text-purple-100">
                  Bienvenido, <span className="font-bold text-white">{usuarioActual?.username}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-200">
                €{totalComanda.toFixed(2)}
              </div>
              <div className="text-sm text-purple-100">Total Comanda</div>
              <div className="text-xs text-purple-200 mt-1">
                {comandaActual.length} productos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Botón de regreso */}
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla('inicio')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver al Inicio
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Panel de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Menú de Productos</h2>
                
                {/* Navegación de categorías */}
                <div className="flex justify-center mb-8">
                  <div className="flex bg-gray-100 rounded-full p-1 shadow-inner">
                    <button
                      onClick={() => setCategoriaActiva('hamburguesas')}
                      className={`px-5 py-2 rounded-full font-bold transition-all duration-300 ${
                        categoriaActiva === 'hamburguesas'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                      }`}
                    >
                      🍔 Hamburguesas
                    </button>
                    <button
                      onClick={() => setCategoriaActiva('acompañamientos')}
                      className={`px-5 py-2 rounded-full font-bold transition-all duration-300 ${
                        categoriaActiva === 'acompañamientos'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                      }`}
                    >
                      🍟 Acompañamientos
                    </button>
                    <button
                      onClick={() => setCategoriaActiva('bebidas')}
                      className={`px-5 py-2 rounded-full font-bold transition-all duration-300 ${
                        categoriaActiva === 'bebidas'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                      }`}
                    >
                      🥤 Bebidas
                    </button>
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
                  {productosFiltrados.map((producto) => (
                    <div 
                      key={producto.id_producto} 
                      className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => producto.categoria === 'hamburguesas' ? abrirModalPersonalizacion(producto as ElementoMenu) : agregarAComanda(producto as ElementoMenu)}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">{producto.nombre}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{producto.descripcion}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xl font-bold text-purple-600">€{producto.precio.toFixed(2)}</span>
                            <button className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors">
                              {producto.categoria === 'hamburguesas' ? 'Personalizar' : 'Añadir'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de comanda y cliente */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Comanda Actual</h2>
                
                {/* Selector de cliente */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    Cliente de la Comanda
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={codigoCliente}
                      onChange={(e) => setCodigoCliente(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Código o usuario del cliente"
                      disabled={buscandoCliente}
                    />
                    <button
                      onClick={buscarCliente}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      disabled={buscandoCliente}
                    >
                      {buscandoCliente ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                  {errorCliente && <p className="text-red-600 text-sm mt-2">{errorCliente}</p>}
                  {clienteComanda ? (
                    <div className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{clienteComanda.nombre}</p>
                        <p className="text-sm text-gray-600">@{clienteComanda.username} | Puntos: {clienteComanda.puntos}</p>
                      </div>
                      <button
                        onClick={() => {
                          setClienteComanda(null);
                          setCodigoCliente('');
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        ❌ Quitar
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">Comanda sin cliente asociado. No se asignarán puntos.</p>
                  )}
                </div>

                {/* Lista de productos en la comanda */}
                <div className="max-h-80 overflow-y-auto pr-2 mb-6">
                  {comandaActual.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>La comanda está vacía</p>
                      <p className="text-sm">Agrega productos del menú</p>
                    </div>
                  ) : (
                    comandaActual.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.producto.imagen}
                            alt={item.producto.nombre}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{item.producto.nombre}</h3>
                            {item.personalizacion && (
                              <div className="text-xs text-purple-600">
                                (Personalizada)
                              </div>
                            )}
                            <p className="text-sm text-gray-600">€{(item.precioPersonalizado || item.producto.precio).toFixed(2)} c/u</p>
                            
                            {/* Detalles de personalización */}
                            {item.personalizacion && (
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p>🔥 Cocción: {obtenerNombrePuntoCoccion(item.personalizacion.puntoCoccion)}</p>
                                <p>🍽️ Acompañamiento: {obtenerNombreAcompañamiento(item.personalizacion.acompañamiento)}</p>
                                <p>🥤 Bebida: {obtenerNombreBebida(item.personalizacion.bebida)}</p>
                                {item.personalizacion.ingredientesExtra.length > 0 && (
                                  <p>➕ Extras: {item.personalizacion.ingredientesExtra.map(obtenerNombreIngredienteExtra).join(', ')}</p>
                                )}
                                {item.personalizacion.ingredientesRemovidos.length > 0 && (
                                  <p>❌ Sin: {item.personalizacion.ingredientesRemovidos.join(', ')}</p>
                                )}
                                {item.personalizacion.precioExtra > 0 && (
                                  <p>💰 Extra: +€{item.personalizacion.precioExtra.toFixed(2)}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-purple-600">€{((item.precioPersonalizado || item.producto.precio) * item.cantidad).toFixed(2)}</span>
                            <div className="flex items-center mt-2">
                              <button onClick={() => actualizarCantidadComanda(index, item.cantidad - 1)} className="text-gray-600 hover:text-purple-600 px-1">-</button>
                              <span className="px-2 text-sm">{item.cantidad}</span>
                              <button onClick={() => actualizarCantidadComanda(index, item.cantidad + 1)} className="text-gray-600 hover:text-purple-600 px-1">+</button>
                              <button onClick={() => eliminarDeComanda(index)} className="text-red-600 hover:text-red-700 ml-2">❌</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total y botón de finalizar */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-3xl font-bold text-purple-600">€{totalComanda.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={finalizarComanda}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">✅</span>
                    Finalizar Comanda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de personalización */}
      {modalPersonalizacionAbierto && productoParaPersonalizar && (
        <ModalPersonalizacion
          producto={productoParaPersonalizar}
          isOpen={modalPersonalizacionAbierto}
          onClose={cerrarModalPersonalizacion}
          onAgregarAlCarrito={agregarAComandaDesdeModal}
        />
      )}
    </div>
  );
}
