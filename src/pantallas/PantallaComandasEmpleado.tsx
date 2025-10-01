import React, { useState, useEffect } from 'react';
import { EncabezadoPrincipal } from '../componentes/EncabezadoPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { baseDatos, ProductoMenu } from '../servicios/BaseDatos';

// Interfaz para las props del componente
interface PropsPantallaComandasEmpleado {
  onCambiarPantalla: (pantalla: any) => void;
}

// Interfaz para el item de la comanda
interface ItemComanda {
  producto: ProductoMenu;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Interfaz para la comanda completa
interface Comanda {
  items: ItemComanda[];
  clienteId?: number;
  codigoCliente?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  tipoServicio: 'mesa' | 'llevar';
  numeroMesa?: number;
  notas?: string;
  total: number;
  descuentoAplicado: number;
}

// Componente de la pantalla de comandas para empleados
export function PantallaComandasEmpleado({ onCambiarPantalla }: PropsPantallaComandasEmpleado) {
  // Hook de autenticación
  const { usuarioActual, esAdmin, esEmpleado } = useAuth();
  
  // Estados para los productos
  const [productos, setProductos] = useState<ProductoMenu[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<'hamburguesas' | 'acompañamientos' | 'bebidas'>('hamburguesas');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  
  // Estados para la comanda actual
  const [comandaActual, setComandaActual] = useState<Comanda>({
    items: [],
    tipoServicio: 'mesa',
    total: 0,
    descuentoAplicado: 0
  });
  
  // Estados para el cliente
  const [codigoClienteBusqueda, setCodigoClienteBusqueda] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  
  // Estados para la interfaz
  const [mostrandoResumen, setMostrandoResumen] = useState(false);
  const [procesandoComanda, setProcesandoComanda] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para cargar productos
  const cargarProductos = () => {
    const todosLosProductos = baseDatos.obtenerTodosLosProductos();
    setProductos(todosLosProductos.filter(p => p.disponible)); // Solo productos disponibles
  };

  // Función para buscar cliente por código
  const buscarClientePorCodigo = () => {
    if (!codigoClienteBusqueda.trim()) {
      alert('Por favor ingresa un código de cliente');
      return;
    }

    // Buscar cliente por código único, username o ID
    const cliente = baseDatos.buscarClientePorCodigo(codigoClienteBusqueda);

    if (cliente) {
      setClienteEncontrado(cliente);
      setComandaActual(prev => ({
        ...prev,
        clienteId: cliente.id_cliente,
        codigoCliente: cliente.codigo_unico,
        nombreCliente: cliente.nombre,
        telefonoCliente: cliente.telefono
      }));
      alert(`✅ Cliente encontrado: ${cliente.nombre}\n🎯 Código: ${cliente.codigo_unico}\n⭐ Puntos actuales: ${cliente.puntos}\n💰 Puntos a ganar: +${Math.floor(comandaActual.total)} pts`);
    } else {
      alert('❌ Cliente no encontrado.\n\nVerifica el código único de 8 caracteres.\nEjemplos: MG123456, CR789012');
      setClienteEncontrado(null);
    }
  };

  // Función para agregar producto a la comanda
  const agregarProductoComanda = (producto: ProductoMenu) => {
    const precioUnitario = producto.precio;
    const subtotal = precioUnitario;

    const nuevoItem: ItemComanda = {
      producto,
      cantidad: 1,
      precioUnitario,
      subtotal
    };

    setComandaActual(prev => {
      // Verificar si el producto ya existe en la comanda
      const itemExistente = prev.items.find(item => item.producto.id_producto === producto.id_producto);
      
      let nuevosItems;
      if (itemExistente) {
        // Si existe, aumentar cantidad
        nuevosItems = prev.items.map(item =>
          item.producto.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        nuevosItems = [...prev.items, nuevoItem];
      }

      const nuevoTotal = nuevosItems.reduce((total, item) => total + item.subtotal, 0);

      return {
        ...prev,
        items: nuevosItems,
        total: nuevoTotal
      };
    });
  };

  // Función para actualizar cantidad de un item
  const actualizarCantidadItem = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      // Eliminar item si la cantidad es 0
      setComandaActual(prev => {
        const nuevosItems = prev.items.filter((_, i) => i !== index);
        const nuevoTotal = nuevosItems.reduce((total, item) => total + item.subtotal, 0);
        return { ...prev, items: nuevosItems, total: nuevoTotal };
      });
    } else {
      // Actualizar cantidad
      setComandaActual(prev => {
        const nuevosItems = prev.items.map((item, i) =>
          i === index
            ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precioUnitario }
            : item
        );
        const nuevoTotal = nuevosItems.reduce((total, item) => total + item.subtotal, 0);
        return { ...prev, items: nuevosItems, total: nuevoTotal };
      });
    }
  };

  // Función para aplicar descuento (solo para clientes registrados)
  const aplicarDescuento = (porcentaje: number) => {
    if (!clienteEncontrado) {
      alert('Solo se pueden aplicar descuentos a clientes registrados');
      return;
    }

    const descuento = (comandaActual.total * porcentaje) / 100;
    setComandaActual(prev => ({
      ...prev,
      descuentoAplicado: descuento
    }));
  };

  // Función para procesar la comanda
  const procesarComanda = async () => {
    if (comandaActual.items.length === 0) {
      alert('Agrega al menos un producto a la comanda');
      return;
    }

    setProcesandoComanda(true);

    try {
      // Preparar productos para la base de datos
      const productosParaBD = comandaActual.items.map(item => ({
        producto: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario
      }));

      const totalFinal = comandaActual.total - comandaActual.descuentoAplicado;

      // Crear el pedido en la base de datos
      const nuevoPedido = baseDatos.crearPedido(
        comandaActual.clienteId || 0, // Si no hay cliente, usar 0 (cliente anónimo)
        totalFinal,
        productosParaBD,
        comandaActual.tipoServicio === 'mesa' ? `Mesa ${comandaActual.numeroMesa}` : 'Para llevar',
        comandaActual.telefonoCliente || 'No especificado',
        'Efectivo - Comanda Empleado'
      );

      // Si hay cliente registrado, agregar puntos
      if (comandaActual.clienteId && comandaActual.clienteId > 0) {
        baseDatos.agregarPuntos(comandaActual.clienteId, Math.floor(totalFinal));
      }

      alert(`¡Comanda procesada exitosamente!\nPedido #${nuevoPedido.id_pedido}\nTotal: €${totalFinal.toFixed(2)}\n${clienteEncontrado ? `Puntos ganados: ${Math.floor(totalFinal)}` : ''}`);

      // Limpiar comanda
      limpiarComanda();

    } catch (error) {
      console.error('Error al procesar comanda:', error);
      alert('Error al procesar la comanda. Inténtalo de nuevo.');
    } finally {
      setProcesandoComanda(false);
    }
  };

  // Función para limpiar comanda
  const limpiarComanda = () => {
    setComandaActual({
      items: [],
      tipoServicio: 'mesa',
      total: 0,
      descuentoAplicado: 0
    });
    setClienteEncontrado(null);
    setCodigoClienteBusqueda('');
    setMostrandoResumen(false);
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = producto.categoria === categoriaActiva;
    const coincideBusqueda = busquedaProducto === '' || 
      producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase());
    
    return coincideCategoria && coincideBusqueda;
  });

  // Verificar permisos
  if (!esAdmin && !esEmpleado) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo empleados y administradores pueden tomar comandas</p>
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
    <div className="min-h-screen bg-orange-50">
      <EncabezadoPrincipal onCambiarPantalla={onCambiarPantalla} />
      
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🍽️ Sistema de Comandas</h1>
              <p className="text-xl text-purple-100">
                Toma pedidos directamente en el restaurante
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full backdrop-blur-sm">
                  <span className="text-purple-200 font-medium">
                    {esAdmin ? '👑 Administrador' : '👨‍💼 Empleado'}
                  </span>
                </div>
                <div className="text-purple-100">
                  {usuarioActual?.username}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-200">
                {comandaActual.items.length}
              </div>
              <div className="text-sm text-purple-100">Productos en Comanda</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <button
              onClick={() => onCambiarPantalla(esAdmin ? 'admin' : 'inicio')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              {esAdmin ? 'Volver al Panel Admin' : 'Volver al Inicio'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  Buscar Cliente (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Único del Cliente
                    </label>
                    <input
                      type="text"
                      value={codigoClienteBusqueda}
                      onChange={(e) => setCodigoClienteBusqueda(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-lg tracking-wider"
                      placeholder="Ej: MG123456, CR789012..."
                      maxLength={8}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          buscarClientePorCodigo();
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Código de 8 caracteres que aparece en el perfil del cliente
                    </p>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={buscarClientePorCodigo}
                      className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
                    >
                      🔍 Buscar
                    </button>
                  </div>
                </div>

                {/* Códigos de ejemplo para testing */}
                <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-bold text-purple-800 mb-2 flex items-center">
                    <span className="text-lg mr-2">🧪</span>
                    Códigos de Prueba
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <strong>María González:</strong> <code className="bg-gray-100 px-2 py-1 rounded">MG123456</code>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Carlos Rodríguez:</strong> <code className="bg-gray-100 px-2 py-1 rounded">CR789012</code>
                    </div>
                  </div>
                </div>


                {clienteEncontrado && (
                  <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center">
                      <span className="text-lg mr-2">✅</span>
                      Cliente Encontrado
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <strong>Nombre:</strong> {clienteEncontrado.nombre}
                      </div>
                      <div>
                        <strong>Puntos Actuales:</strong> 
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2 font-bold">
                          {clienteEncontrado.puntos} pts
                        </span>
                      </div>
                      <div>
                        <strong>Código Único:</strong> 
                        <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono ml-2">
                          {clienteEncontrado.codigo_unico}
                        </code>
                      </div>
                      <div>
                        <strong>Usuario:</strong> @{clienteEncontrado.username}
                      </div>
                    </div>
                    
                    {/* Información de puntos a ganar */}
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <h5 className="font-medium text-yellow-800 mb-1">💰 Puntos a Ganar con esta Comanda:</h5>
                      <div className="text-yellow-700 text-sm">
                        <strong>+{Math.floor(comandaActual.total - comandaActual.descuentoAplicado)} puntos</strong> (1 punto por cada €1 gastado)
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        Total después de la compra: {clienteEncontrado.puntos + Math.floor(comandaActual.total - comandaActual.descuentoAplicado)} pts
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => aplicarDescuento(10)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Aplicar 10% Descuento
                      </button>
                      <button
                        onClick={() => aplicarDescuento(15)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Aplicar 15% Descuento VIP
                      </button>
                      <button
                        onClick={() => {
                          setClienteEncontrado(null);
                          setCodigoClienteBusqueda('');
                          setComandaActual(prev => ({
                            ...prev,
                            clienteId: undefined,
                            codigoCliente: undefined,
                            nombreCliente: undefined,
                            telefonoCliente: undefined,
                            descuentoAplicado: 0
                          }));
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Quitar Cliente
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🍽️</span>
                  Tipo de Servicio
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    comandaActual.tipoServicio === 'mesa'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="tipoServicio"
                      value="mesa"
                      checked={comandaActual.tipoServicio === 'mesa'}
                      onChange={(e) => setComandaActual(prev => ({ ...prev, tipoServicio: e.target.value as 'mesa' | 'llevar' }))}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">🪑</div>
                      <h4 className="font-bold text-gray-800">Para Mesa</h4>
                      <p className="text-sm text-gray-600">Servicio en restaurante</p>
                    </div>
                  </label>

                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    comandaActual.tipoServicio === 'llevar'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="tipoServicio"
                      value="llevar"
                      checked={comandaActual.tipoServicio === 'llevar'}
                      onChange={(e) => setComandaActual(prev => ({ ...prev, tipoServicio: e.target.value as 'mesa' | 'llevar' }))}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">🥡</div>
                      <h4 className="font-bold text-gray-800">Para Llevar</h4>
                      <p className="text-sm text-gray-600">Pedido para llevar</p>
                    </div>
                  </label>
                </div>

                {comandaActual.tipoServicio === 'mesa' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Mesa *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={comandaActual.numeroMesa || ''}
                      onChange={(e) => setComandaActual(prev => ({ ...prev, numeroMesa: parseInt(e.target.value) || undefined }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Número de mesa"
                    />
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🍔</span>
                  Seleccionar Productos
                </h3>

                <div className="mb-6">
                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Buscar productos..."
                  />
                </div>

                <div className="flex justify-center mb-6">
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setCategoriaActiva('hamburguesas')}
                      className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        categoriaActiva === 'hamburguesas'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                    >
                      🍔 Hamburguesas
                    </button>
                    <button
                      onClick={() => setCategoriaActiva('acompañamientos')}
                      className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        categoriaActiva === 'acompañamientos'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                    >
                      🍟 Acompañamientos
                    </button>
                    <button
                      onClick={() => setCategoriaActiva('bebidas')}
                      className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        categoriaActiva === 'bebidas'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                    >
                      🥤 Bebidas
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id_producto}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => agregarProductoComanda(producto)}
                    >
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        loading="lazy"
                      />
                      <h4 className="font-bold text-gray-800 mb-1">{producto.nombre}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-600">€{producto.precio.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{producto.tiempo_preparacion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Comanda Actual
                </h3>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Tipo de servicio:</span>
                    <span className="font-bold text-purple-600">
                      {comandaActual.tipoServicio === 'mesa' ? '🪑 Mesa' : '🥡 Para Llevar'}
                    </span>
                  </div>
                  {comandaActual.numeroMesa && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-medium text-gray-700">Mesa:</span>
                      <span className="font-bold text-gray-800">#{comandaActual.numeroMesa}</span>
                    </div>
                  )}
                  {clienteEncontrado && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-sm text-green-700">
                        <strong>Cliente:</strong> {clienteEncontrado.nombre}<br/>
                        <strong>Puntos:</strong> {clienteEncontrado.puntos} pts
                      </div>
                    </div>
                  )}
                </div>

                {comandaActual.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🛒</div>
                    <p>No hay productos en la comanda</p>
                    <p className="text-sm">Haz click en los productos para agregarlos</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {comandaActual.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.producto.nombre}</h4>
                            <p className="text-xs text-gray-500">€{item.precioUnitario.toFixed(2)} c/u</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">€{item.subtotal.toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidadItem(index, item.cantidad - 1)}
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidadItem(index, item.cantidad + 1)}
                              className="w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold hover:bg-green-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => actualizarCantidadItem(index, 0)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {comandaActual.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">€{comandaActual.total.toFixed(2)}</span>
                      </div>
                      {comandaActual.descuentoAplicado > 0 && (
                        <div className="flex justify-between">
                          <span className="text-green-600">Descuento:</span>
                          <span className="font-medium text-green-600">-€{comandaActual.descuentoAplicado.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impuestos (10%):</span>
                        <span className="font-medium">€{((comandaActual.total - comandaActual.descuentoAplicado) * 0.1).toFixed(2)}</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-purple-600">
                          €{((comandaActual.total - comandaActual.descuentoAplicado) * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={comandaActual.notas || ''}
                    onChange={(e) => setComandaActual(prev => ({ ...prev, notas: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Instrucciones especiales, alergias, etc."
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {comandaActual.items.length > 0 && (
                    <>
                      <button
                        onClick={() => setMostrandoResumen(true)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                      >
                        👁️ Ver Resumen
                      </button>
                      
                      <button
                        onClick={procesarComanda}
                        disabled={procesandoComanda}
                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {procesandoComanda ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            💳 Procesar Comanda
                          </>
                        )}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={limpiarComanda}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                    🗑️ Limpiar Comanda
                  </button>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2 flex items-center">
                    <span className="text-lg mr-2">💡</span>
                    Instrucciones
                  </h5>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Busca cliente por código para aplicar puntos</li>
                    <li>• Haz click en productos para agregarlos</li>
                    <li>• Ajusta cantidades con los botones + y -</li>
                    <li>• Aplica descuentos a clientes VIP</li>
                    <li>• Procesa la comanda para enviarla a cocina</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {mostrandoResumen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">📋 Resumen de Comanda</h3>
                  <p className="text-purple-100 mt-1">
                    Revisa todos los detalles antes de procesar
                  </p>
                </div>
                <button
                  onClick={() => setMostrandoResumen(false)}
                  className="text-purple-200 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">Información del Servicio:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Tipo:</strong> {comandaActual.tipoServicio === 'mesa' ? 'Para Mesa' : 'Para Llevar'}</div>
                  {comandaActual.numeroMesa && (
                    <div><strong>Mesa:</strong> #{comandaActual.numeroMesa}</div>
                  )}
                  <div><strong>Empleado:</strong> {usuarioActual?.username}</div>
                  <div><strong>Fecha:</strong> {new Date().toLocaleString('es-ES')}</div>
                </div>
              </div>

              {clienteEncontrado && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">Cliente Registrado:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {clienteEncontrado.nombre}</div>
                    <div><strong>Código:</strong> {clienteEncontrado.username}</div>
                    <div><strong>Puntos actuales:</strong> {clienteEncontrado.puntos} pts</div>
                    <div><strong>Puntos a ganar:</strong> +{Math.floor(comandaActual.total - comandaActual.descuentoAplicado)} pts</div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-gray-800 mb-3">Productos Pedidos:</h4>
                <div className="space-y-2">
                  {comandaActual.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.cantidad}x {item.producto.nombre}</span>
                        <div className="text-xs text-gray-500">€{item.precioUnitario.toFixed(2)} c/u</div>
                      </div>
                      <span className="font-bold text-purple-600">€{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {comandaActual.notas && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">Notas Especiales:</h4>
                  <p className="text-yellow-700 text-sm">{comandaActual.notas}</p>
                </div>
              )}

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{comandaActual.total.toFixed(2)}</span>
                  </div>
                  {comandaActual.descuentoAplicado > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span>-€{comandaActual.descuentoAplicado.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Impuestos (10%):</span>
                    <span>€{((comandaActual.total - comandaActual.descuentoAplicado) * 0.1).toFixed(2)}</span>
                  </div>
                  <hr className="border-purple-200" />
                  <div className="flex justify-between text-xl font-bold text-purple-600">
                    <span>Total Final:</span>
                    <span>€{((comandaActual.total - comandaActual.descuentoAplicado) * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setMostrandoResumen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Volver a Editar
                </button>
                <button
                  onClick={() => {
                    setMostrandoResumen(false);
                    procesarComanda();
                  }}
                  className="flex-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-purple-700 transition-colors"
                >
                  💳 Confirmar y Procesar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
