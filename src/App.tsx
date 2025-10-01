import React, { useState } from 'react';
import { ProveedorAuth, useAuth } from './contextos/ContextoAuth';
import { ProveedorIdioma } from './contextos/ContextoIdioma';
import { PantallaInicio } from './pantallas/PantallaInicio';
import { PantallaMenu } from './pantallas/PantallaMenu';
import { PantallaReservas } from './pantallas/PantallaReservas';
import { PantallaLealtad } from './pantallas/PantallaLealtad';
import { PantallaReseñas } from './pantallas/PantallaReseñas';
import { PantallaDetalleProducto } from './pantallas/PantallaDetalleProducto';
import { PantallaCarrito } from './pantallas/PantallaCarrito';
import { PantallaPago } from './pantallas/PantallaPago';
import { PantallaLogin } from './pantallas/PantallaLogin';
import { PantallaAdmin } from './pantallas/PantallaAdmin';
import { PantallaDetalleCliente } from './pantallas/PantallaDetalleCliente';
import { PantallaMiCuenta } from './pantallas/PantallaMiCuenta';
import { PantallaPerfil } from './pantallas/PantallaPerfil';
import { PantallaGestionProductos } from './pantallas/PantallaGestionProductos';
import { PantallaGestionPedidos } from './pantallas/PantallaGestionPedidos';
import { PantallaComandasEmpleado } from './pantallas/PantallaComandasEmpleado';
import { ElementoMenu } from './tipos/ElementoMenu';

// Tipo para definir las pantallas disponibles
type PantallaActiva = 'login' | 'inicio' | 'menu' | 'reservas' | 'lealtad' | 'reseñas' | 'detalle-producto' | 'carrito' | 'pago' | 'admin' | 'detalle-cliente' | 'mi-cuenta' | 'perfil' | 'gestion-productos' | 'gestion-pedidos' | 'comandas-empleado';

// Interfaz para la personalización de hamburguesas
export interface PersonalizacionHamburguesa {
  puntoCoccion: string;
  ingredientesExtra: string[];
  ingredientesRemovidos: string[];
  acompañamiento: string;
  bebida: string;
  precioExtra: number;
}

// Interfaz para el elemento del carrito
export interface ElementoCarrito {
  producto: ElementoMenu;
  cantidad: number;
  personalizacion?: PersonalizacionHamburguesa;
  precioPersonalizado?: number;
}

// Componente interno de la aplicación (dentro del proveedor de autenticación)
function AppInterno() {
  // Estado para controlar qué pantalla está activa
  const [pantallaActiva, setPantallaActiva] = useState<PantallaActiva>('inicio');
  
  // Hook de autenticación
  const { estaAutenticado, esAdmin, esEmpleado, usuarioActual } = useAuth();
  
  // Estado para el producto seleccionado para ver detalles
  const [productoSeleccionado, setProductoSeleccionado] = useState<ElementoMenu | null>(null);
  
  // Estado para manejar el carrito de compras
  const [carrito, setCarrito] = useState<ElementoCarrito[]>([]);
  
  // Estado para el cliente seleccionado en el panel admin
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);

  // Función para cambiar de pantalla
  const cambiarPantalla = (nuevaPantalla: PantallaActiva) => {
    console.log('Cambiando pantalla a:', nuevaPantalla);
    console.log('Estado autenticación:', { estaAutenticado, esAdmin, usuarioActual });
    
    // Verificar si es una pantalla que requiere autenticación
    const pantallasQueRequierenAuth = ['admin', 'gestion-productos', 'mi-cuenta', 'perfil'];
    
    if (pantallasQueRequierenAuth.includes(nuevaPantalla) && !estaAutenticado) {
      console.log('Pantalla requiere autenticación, redirigiendo a login');
      setPantallaActiva('login');
      return;
    }
    
    // Verificar si es una pantalla que requiere ser admin
    const pantallasAdmin = ['admin', 'gestion-productos'];
    const pantallasStaff = ['gestion-pedidos', 'comandas-empleado']; // Admin y empleados
    
    if (pantallasAdmin.includes(nuevaPantalla) && !esAdmin) {
      console.log('Pantalla requiere ser admin, redirigiendo a inicio');
      setPantallaActiva('inicio');
      return;
    }
    
    if (pantallasStaff.includes(nuevaPantalla) && !esAdmin && !esEmpleado) {
      console.log('Pantalla requiere ser staff, redirigiendo a inicio');
      setPantallaActiva('inicio');
      return;
    }
    
    setPantallaActiva(nuevaPantalla);
  };

  // Función para ver detalles de un producto
  const verDetalleProducto = (producto: ElementoMenu) => {
    setProductoSeleccionado(producto);
    setPantallaActiva('detalle-producto');
  };

  // Función para agregar productos al carrito
  const agregarAlCarrito = (producto: ElementoMenu, cantidad: number = 1, personalizacion?: PersonalizacionHamburguesa) => {
    setCarrito(carritoActual => {
      // Calcular precio personalizado si hay personalización
      const precioBase = parseFloat(producto.precio.replace('€', ''));
      const precioPersonalizado = personalizacion ? precioBase + personalizacion.precioExtra : precioBase;
      
      // Para hamburguesas personalizadas, siempre crear una nueva entrada
      if (personalizacion) {
        return [...carritoActual, { 
          producto, 
          cantidad, 
          personalizacion,
          precioPersonalizado 
        }];
      }
      
      // Para productos sin personalización, buscar si ya existe
      const elementoExistente = carritoActual.find(item => 
        item.producto.id === producto.id && !item.personalizacion
      );
      
      if (elementoExistente) {
        // Si el producto ya existe, aumentar la cantidad
        return carritoActual.map(item =>
          item.producto.id === producto.id && !item.personalizacion
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo al carrito
        return [...carritoActual, { producto, cantidad }];
      }
    });
  };

  // Función para actualizar la cantidad de un producto en el carrito
  const actualizarCantidadCarrito = (indiceCarrito: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      // Si la cantidad es 0 o menor, eliminar el producto del carrito
      setCarrito(carritoActual => carritoActual.filter((_, index) => index !== indiceCarrito));
    } else {
      // Actualizar la cantidad
      setCarrito(carritoActual =>
        carritoActual.map((item, index) =>
          index === indiceCarrito
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    }
  };

  // Función para obtener la cantidad total de elementos en el carrito
  const obtenerTotalCarrito = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  // Función para obtener el precio total del carrito (subtotal sin impuestos)
  const obtenerPrecioTotal = () => {
    return carrito.reduce((total, item) => {
      const precio = item.precioPersonalizado || parseFloat(item.producto.precio.replace('€', ''));
      return total + (precio * item.cantidad);
    }, 0);
  };

  // Función para editar un producto del carrito
  const editarProductoCarrito = (indiceCarrito: number) => {
    const item = carrito[indiceCarrito];
    if (item) {
      // Ir a la pantalla de detalle del producto para editarlo
      setProductoSeleccionado(item.producto);
      setPantallaActiva('detalle-producto');
      // Remover el producto del carrito para que se pueda volver a agregar editado
      actualizarCantidadCarrito(indiceCarrito, 0);
    }
  };

  // Función para ver detalle de un cliente
  const verDetalleCliente = (clienteId: number) => {
    setClienteSeleccionado(clienteId);
    setPantallaActiva('detalle-cliente');
  };

  // Función para vaciar el carrito
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // Función para repetir un pedido completo
  const repetirPedido = (pedido: any) => {
    // Obtener todos los elementos del menú para hacer match con los productos del pedido
    const elementosMenu = [
      // Hamburguesas
      { id: 1, nombre: 'BarrasoBurger Clásica', precio: '€11.99', categoria: 'hamburguesas', imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 2, nombre: 'Bacon Deluxe', precio: '€14.99', categoria: 'hamburguesas', imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 3, nombre: 'Aguacate Ranch', precio: '€13.99', categoria: 'hamburguesas', imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 4, nombre: 'BBQ Especial', precio: '€15.99', categoria: 'hamburguesas', imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 5, nombre: 'Vegetariana Suprema', precio: '€12.99', categoria: 'hamburguesas', imagen: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 6, nombre: 'Picante Jalapeño', precio: '€14.49', categoria: 'hamburguesas', imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      // Acompañamientos
      { id: 7, nombre: 'Papas Fritas Crujientes', precio: '€4.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 7, nombre: 'Papas Fritas', precio: '€4.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }, // Alias
      { id: 8, nombre: 'Aros de Cebolla Dorados', precio: '€5.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 8, nombre: 'Aros de Cebolla', precio: '€5.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }, // Alias
      { id: 9, nombre: 'Papas de Camote', precio: '€5.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 10, nombre: 'Nuggets de Pollo', precio: '€6.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 11, nombre: 'Ensalada César', precio: '€7.49', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 12, nombre: 'Palitos de Mozzarella', precio: '€5.99', categoria: 'acompañamientos', imagen: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      // Bebidas
      { id: 13, nombre: 'Coca-Cola', precio: '€2.79', categoria: 'bebidas', imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 14, nombre: 'Sprite', precio: '€2.79', categoria: 'bebidas', imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 15, nombre: 'Té Helado', precio: '€3.29', categoria: 'bebidas', imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 16, nombre: 'Malteada de Vainilla', precio: '€4.79', categoria: 'bebidas', imagen: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 17, nombre: 'Jugo de Naranja Natural', precio: '€3.79', categoria: 'bebidas', imagen: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 18, nombre: 'Café Americano', precio: '€2.29', categoria: 'bebidas', imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ];

    // Procesar cada producto del pedido
    pedido.productos.forEach((productoPedido: any) => {
      // Buscar el producto en el menú actual
      let productoEncontrado = elementosMenu.find(p => p.nombre === productoPedido.producto);
      
      // Si no se encuentra exactamente, buscar por nombre similar (sin "(Personalizada)")
      if (!productoEncontrado) {
        const nombreLimpio = productoPedido.producto.replace(' (Personalizada)', '').trim();
        productoEncontrado = elementosMenu.find(p => p.nombre === nombreLimpio);
      }

      if (productoEncontrado) {
        // Crear el objeto ElementoMenu completo
        const elementoMenu: ElementoMenu = {
          id: productoEncontrado.id,
          nombre: productoEncontrado.nombre,
          descripcion: `Repetido del pedido #${pedido.id_pedido}`,
          precio: `€${productoPedido.precio_unitario.toFixed(2)}`,
          imagen: productoEncontrado.imagen,
          categoria: productoEncontrado.categoria as 'hamburguesas' | 'acompañamientos' | 'bebidas',
          disponible: true
        };

        // Si es una hamburguesa personalizada, crear personalización por defecto
        let personalizacion: PersonalizacionHamburguesa | undefined;
        if (elementoMenu.categoria === 'hamburguesas' && productoPedido.producto.includes('(Personalizada)')) {
          personalizacion = {
            puntoCoccion: 'medio', // Valor por defecto
            ingredientesExtra: [], // Se podría extraer del nombre si se guardara
            ingredientesRemovidos: [],
            acompañamiento: 'papas-fritas',
            bebida: 'coca-cola',
            precioExtra: Math.max(0, productoPedido.precio_unitario - parseFloat(productoEncontrado.precio.replace('€', '')))
          };
        }

        // Agregar al carrito
        agregarAlCarrito(elementoMenu, productoPedido.cantidad, personalizacion);
      }
    });
  };

  // Función para renderizar la pantalla activa
  const renderizarPantalla = () => {
    console.log('Renderizando pantalla:', pantallaActiva);
    console.log('Estado autenticación:', { estaAutenticado, esAdmin });

    // Si no está autenticado y no es login o inicio, mostrar login
    if (!estaAutenticado && pantallaActiva !== 'login' && pantallaActiva !== 'inicio') {
      console.log('Redirigiendo a login porque no está autenticado');
      return <PantallaLogin onCambiarPantalla={cambiarPantalla} />;
    }

    switch (pantallaActiva) {
      case 'login':
        return <PantallaLogin onCambiarPantalla={cambiarPantalla} />;
      case 'gestion-productos':
        console.log('Renderizando gestión de productos, esAdmin:', esAdmin);
        return <PantallaGestionProductos onCambiarPantalla={cambiarPantalla} />;
      case 'gestion-pedidos':
        return <PantallaGestionPedidos onCambiarPantalla={cambiarPantalla} />;
      case 'comandas-empleado':
        return <PantallaComandasEmpleado onCambiarPantalla={cambiarPantalla} />;
      case 'admin':
        return <PantallaAdmin onCambiarPantalla={cambiarPantalla} onVerDetalleCliente={verDetalleCliente} />;
      case 'detalle-cliente':
        return clienteSeleccionado ? (
          <PantallaDetalleCliente
            onCambiarPantalla={cambiarPantalla}
            clienteId={clienteSeleccionado}
          />
        ) : (
          <PantallaAdmin onCambiarPantalla={cambiarPantalla} onVerDetalleCliente={verDetalleCliente} />
        );
      case 'mi-cuenta':
        return <PantallaMiCuenta onCambiarPantalla={cambiarPantalla} onRepetirPedido={repetirPedido} />;
      case 'perfil':
        return <PantallaPerfil onCambiarPantalla={cambiarPantalla} />;
      case 'inicio':
        return <PantallaInicio onCambiarPantalla={cambiarPantalla} />;
      case 'menu':
        return (
          <PantallaMenu 
            onCambiarPantalla={cambiarPantalla}
            onVerDetalleProducto={verDetalleProducto}
            onAgregarAlCarrito={agregarAlCarrito}
            carrito={carrito}
            totalCarrito={obtenerTotalCarrito()}
          />
        );
      case 'reservas':
        return <PantallaReservas onCambiarPantalla={cambiarPantalla} />;
      case 'lealtad':
        return <PantallaLealtad onCambiarPantalla={cambiarPantalla} onRepetirPedido={repetirPedido} />;
      case 'reseñas':
        return <PantallaReseñas onCambiarPantalla={cambiarPantalla} />;
      case 'detalle-producto':
        return productoSeleccionado ? (
          <PantallaDetalleProducto
            producto={productoSeleccionado}
            onCambiarPantalla={cambiarPantalla}
            onAgregarAlCarrito={agregarAlCarrito}
          />
        ) : (
          <PantallaInicio onCambiarPantalla={cambiarPantalla} />
        );
      case 'carrito':
        return (
          <PantallaCarrito
            onCambiarPantalla={cambiarPantalla}
            carrito={carrito}
            onActualizarCantidad={actualizarCantidadCarrito}
            onVaciarCarrito={vaciarCarrito}
            onEditarProducto={editarProductoCarrito}
            precioTotal={obtenerPrecioTotal()}
          />
        );
      case 'pago':
        return (
          <PantallaPago
            onCambiarPantalla={cambiarPantalla}
            carrito={carrito}
            precioTotal={obtenerPrecioTotal()}
            onVaciarCarrito={vaciarCarrito}
          />
        );
      default:
        console.log('Pantalla no reconocida, mostrando login');
        return <PantallaLogin onCambiarPantalla={cambiarPantalla} />;
    }
  };

  return (
    // Contenedor principal con altura mínima de pantalla completa
    <div className="min-h-screen bg-orange-50">
      {/* Renderizar la pantalla activa */}
      {renderizarPantalla()}
    </div>
  );
}

// Componente principal de la aplicación con proveedores
function App() {
  return (
    <ProveedorIdioma>
      <ProveedorAuth>
        <AppInterno />
      </ProveedorAuth>
    </ProveedorIdioma>
  );
}

export default App;
