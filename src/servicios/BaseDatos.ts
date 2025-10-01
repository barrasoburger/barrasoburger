// Simulación de base de datos SQLite para el navegador
// En producción real, esto se conectaría a una base de datos real

// Interfaz para usuarios
export interface Usuario {
  id_usuario: number;
  username: string;
  password: string;
  rol: 'admin' | 'empleado' | 'cliente';
}

// Interfaz para clientes
export interface Cliente {
  id_cliente: number;
  id_usuario: number;
  nombre: string;
  apellido1?: string;
  apellido2?: string;
  dni?: string;
  telefono: string;
  email: string;
  puntos: number;
  fecha_registro: string;
  codigo_unico: string; // Código único para usar en el restaurante
}

// Interfaz para pedidos
export interface Pedido {
  id_pedido: number;
  id_cliente: number;
  fecha: string;
  total: number;
  productos: DetallePedido[];
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';
  tiempo_estimado?: string;
  notas_cocina?: string;
  direccion_entrega?: string;
  telefono_contacto?: string;
  metodo_pago?: string;
  fecha_actualizacion: string;
}

// Interfaz para detalle de pedidos
export interface DetallePedido {
  id_detalle: number;
  id_pedido: number;
  producto: string;
  cantidad: number;
  precio_unitario: number;
}

// Interfaz para reseñas
export interface Reseña {
  id_reseña: number;
  id_cliente: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  verificado: boolean;
  producto_reseñado?: string; // Producto específico reseñado (opcional)
}

// Interfaz para productos del menú
export interface ProductoMenu {
  id_producto: number;
  nombre: string;
  descripcion: string;
  descripcion_detallada: string;
  precio: number;
  categoria: 'hamburguesas' | 'acompañamientos' | 'bebidas';
  imagen: string;
  ingredientes: string[];
  alergenos: string[];
  calorias: number;
  tiempo_preparacion: string;
  disponible: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

// Clase para manejar la base de datos simulada con persistencia
class BaseDatosService {
  private usuarios: Usuario[] = [];
  private clientes: Cliente[] = [];
  private pedidos: Pedido[] = [];
  private reseñas: Reseña[] = [];
  private productos: ProductoMenu[] = [];
  private contadorUsuarios = 1;
  private contadorClientes = 1;
  private contadorPedidos = 1;
  private contadorReseñas = 1;
  private contadorProductos = 1;

  constructor() {
    // Cargar datos desde localStorage o inicializar con datos de ejemplo
    this.cargarDatos();
  }

  // Función para cargar datos desde localStorage
  private cargarDatos() {
    try {
      // Cargar usuarios
      const usuariosGuardados = localStorage.getItem('barraso_usuarios');
      if (usuariosGuardados) {
        this.usuarios = JSON.parse(usuariosGuardados);
        this.contadorUsuarios = Math.max(...this.usuarios.map(u => u.id_usuario), 0) + 1;
      }

      // Cargar clientes
      const clientesGuardados = localStorage.getItem('barraso_clientes');
      if (clientesGuardados) {
        this.clientes = JSON.parse(clientesGuardados);
        this.contadorClientes = Math.max(...this.clientes.map(c => c.id_cliente), 0) + 1;
      }

      // Cargar pedidos
      const pedidosGuardados = localStorage.getItem('barraso_pedidos');
      if (pedidosGuardados) {
        this.pedidos = JSON.parse(pedidosGuardados);
        this.contadorPedidos = Math.max(...this.pedidos.map(p => p.id_pedido), 0) + 1;
      }

      // Cargar reseñas
      const reseñasGuardadas = localStorage.getItem('barraso_reseñas');
      if (reseñasGuardadas) {
        this.reseñas = JSON.parse(reseñasGuardadas);
        this.contadorReseñas = Math.max(...this.reseñas.map(r => r.id_reseña), 0) + 1;
      }

      // Cargar productos
      const productosGuardados = localStorage.getItem('barraso_productos');
      if (productosGuardados) {
        this.productos = JSON.parse(productosGuardados);
        this.contadorProductos = Math.max(...this.productos.map(p => p.id_producto), 0) + 1;
      }

      // Si no hay datos guardados, inicializar con datos de ejemplo
      if (this.usuarios.length === 0) {
        console.log('No hay usuarios, inicializando datos completos...');
        this.inicializarDatos();
      } else {
        // Si hay usuarios pero no productos, crear solo los productos
        if (this.productos.length === 0) {
          console.log('Hay usuarios pero no productos, creando productos...');
          this.crearProductosIniciales();
        } else {
          console.log('Datos cargados:', {
            usuarios: this.usuarios.length,
            clientes: this.clientes.length,
            productos: this.productos.length,
            pedidos: this.pedidos.length,
            reseñas: this.reseñas.length
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.inicializarDatos();
    }
  }

  // Función para guardar datos en localStorage
  private guardarDatos() {
    try {
      localStorage.setItem('barraso_usuarios', JSON.stringify(this.usuarios));
      localStorage.setItem('barraso_clientes', JSON.stringify(this.clientes));
      localStorage.setItem('barraso_pedidos', JSON.stringify(this.pedidos));
      localStorage.setItem('barraso_reseñas', JSON.stringify(this.reseñas));
      localStorage.setItem('barraso_productos', JSON.stringify(this.productos));
      console.log('Datos guardados en localStorage');
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  }

  // Función para inicializar datos de ejemplo
  private inicializarDatos() {
    // Crear usuario administrador por defecto
    this.usuarios.push({
      id_usuario: this.contadorUsuarios++,
      username: 'admin',
      password: 'admin123', // En producción esto estaría encriptado
      rol: 'admin'
    });

    // Crear algunos usuarios de ejemplo
    this.usuarios.push({
      id_usuario: this.contadorUsuarios++,
      username: 'empleado1',
      password: 'emp123',
      rol: 'empleado'
    });

    this.usuarios.push({
      id_usuario: this.contadorUsuarios++,
      username: 'cliente1',
      password: 'cli123',
      rol: 'cliente'
    });

    this.usuarios.push({
      id_usuario: this.contadorUsuarios++,
      username: 'cliente2',
      password: 'cli456',
      rol: 'cliente'
    });

    // Crear clientes correspondientes con datos completos y códigos únicos
    this.clientes.push({
      id_cliente: this.contadorClientes++,
      id_usuario: 3, // cliente1
      nombre: 'María González Martínez',
      apellido1: 'González',
      apellido2: 'Martínez',
      dni: '12345678A',
      telefono: '644123456',
      email: 'maria@email.com',
      puntos: 1250,
      fecha_registro: '2024-01-15',
      codigo_unico: 'MG123456' // Código único para María
    });

    this.clientes.push({
      id_cliente: this.contadorClientes++,
      id_usuario: 4, // cliente2
      nombre: 'Carlos Rodríguez López',
      apellido1: 'Rodríguez',
      apellido2: 'López',
      dni: '87654321B',
      telefono: '655987654',
      email: 'carlos@email.com',
      puntos: 890,
      fecha_registro: '2024-01-20',
      codigo_unico: 'CR789012' // Código único para Carlos
    });

    // Crear algunos pedidos de ejemplo con estados
    this.pedidos.push({
      id_pedido: this.contadorPedidos++,
      id_cliente: 1,
      fecha: '2024-01-25T14:30:00',
      total: 18.99,
      productos: [
        {
          id_detalle: 1,
          id_pedido: 1,
          producto: 'BarrasoBurger Clásica',
          cantidad: 1,
          precio_unitario: 11.99
        },
        {
          id_detalle: 2,
          id_pedido: 1,
          producto: 'Papas Fritas',
          cantidad: 1,
          precio_unitario: 4.49
        },
        {
          id_detalle: 3,
          id_pedido: 1,
          producto: 'Coca-Cola',
          cantidad: 1,
          precio_unitario: 2.79
        }
      ],
      estado: 'entregado',
      tiempo_estimado: '45-60 min',
      direccion_entrega: 'Calle Principal 123, Madrid',
      telefono_contacto: '644123456',
      metodo_pago: 'Bizum',
      fecha_actualizacion: '2024-01-25T15:30:00'
    });

    this.pedidos.push({
      id_pedido: this.contadorPedidos++,
      id_cliente: 2,
      fecha: '2024-01-26T19:15:00',
      total: 22.48,
      productos: [
        {
          id_detalle: 4,
          id_pedido: 2,
          producto: 'Bacon Deluxe',
          cantidad: 1,
          precio_unitario: 14.99
        },
        {
          id_detalle: 5,
          id_pedido: 2,
          producto: 'Aros de Cebolla',
          cantidad: 1,
          precio_unitario: 5.49
        },
        {
          id_detalle: 6,
          id_pedido: 2,
          producto: 'Malteada de Vainilla',
          cantidad: 1,
          precio_unitario: 4.79
        }
      ],
      estado: 'en_camino',
      tiempo_estimado: '15-20 min',
      direccion_entrega: 'Avenida Central 456, Madrid',
      telefono_contacto: '655987654',
      metodo_pago: 'PayPal',
      fecha_actualizacion: '2024-01-26T19:45:00'
    });

    this.pedidos.push({
      id_pedido: this.contadorPedidos++,
      id_cliente: 1,
      fecha: new Date().toISOString(), // Pedido de hoy
      total: 15.99,
      productos: [
        {
          id_detalle: 7,
          id_pedido: 3,
          producto: 'Bacon Deluxe',
          cantidad: 1,
          precio_unitario: 14.99
        },
        {
          id_detalle: 8,
          id_pedido: 3,
          producto: 'Sprite',
          cantidad: 1,
          precio_unitario: 2.79
        }
      ],
      estado: 'preparando',
      tiempo_estimado: '25-30 min',
      direccion_entrega: 'Calle Principal 123, Madrid',
      telefono_contacto: '644123456',
      metodo_pago: 'Transferencia',
      notas_cocina: 'Sin cebolla en la hamburguesa',
      fecha_actualizacion: new Date().toISOString()
    });

    // Agregar más pedidos con diferentes estados para testing
    this.pedidos.push({
      id_pedido: this.contadorPedidos++,
      id_cliente: 1,
      fecha: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Hace 10 minutos
      total: 19.99,
      productos: [
        {
          id_detalle: 10,
          id_pedido: 5,
          producto: 'BarrasoBurger Clásica',
          cantidad: 1,
          precio_unitario: 11.99
        },
        {
          id_detalle: 11,
          id_pedido: 5,
          producto: 'Papas Fritas',
          cantidad: 1,
          precio_unitario: 4.49
        },
        {
          id_detalle: 12,
          id_pedido: 5,
          producto: 'Coca-Cola',
          cantidad: 1,
          precio_unitario: 2.79
        }
      ],
      estado: 'confirmado',
      tiempo_estimado: '35-40 min',
      direccion_entrega: 'Calle Principal 123, Madrid',
      telefono_contacto: '644123456',
      metodo_pago: 'Bizum',
      fecha_actualizacion: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    });

    this.pedidos.push({
      id_pedido: this.contadorPedidos++,
      id_cliente: 2,
      fecha: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Hace 5 minutos
      total: 16.99,
      productos: [
        {
          id_detalle: 13,
          id_pedido: 6,
          producto: 'BBQ Especial',
          cantidad: 1,
          precio_unitario: 15.99
        },
        {
          id_detalle: 14,
          id_pedido: 6,
          producto: 'Té Helado',
          cantidad: 1,
          precio_unitario: 3.29
        }
      ],
      estado: 'pendiente',
      tiempo_estimado: '45-50 min',
      direccion_entrega: 'Avenida Central 456, Madrid',
      telefono_contacto: '655987654',
      metodo_pago: 'PayPal',
      fecha_actualizacion: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    });

    this.pedidos.push({
      id_pedido: this.contadorPedidos++,
      id_cliente: 2,
      fecha: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Hace 30 minutos
      total: 13.99,
      productos: [
        {
          id_detalle: 9,
          id_pedido: 4,
          producto: 'Aguacate Ranch',
          cantidad: 1,
          precio_unitario: 13.99
        }
      ],
      estado: 'listo',
      tiempo_estimado: '5-10 min',
      direccion_entrega: 'Avenida Central 456, Madrid',
      telefono_contacto: '655987654',
      metodo_pago: 'Bizum',
      fecha_actualizacion: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    });

    // Crear algunas reseñas de ejemplo
    this.reseñas.push({
      id_reseña: this.contadorReseñas++,
      id_cliente: 1, // María González
      calificacion: 5,
      comentario: '¡Increíble! La mejor hamburguesa que he probado en años. Los ingredientes son súper frescos y el servicio es excelente. Definitivamente volveré.',
      fecha: '2024-01-25T15:30:00',
      verificado: true,
      producto_reseñado: 'BarrasoBurger Clásica'
    });

    this.reseñas.push({
      id_reseña: this.contadorReseñas++,
      id_cliente: 2, // Carlos Rodríguez
      calificacion: 5,
      comentario: 'El ambiente es perfecto para una cena familiar. Las hamburguesas están deliciosas y las papas fritas son las mejores de la ciudad. ¡Altamente recomendado!',
      fecha: '2024-01-26T20:15:00',
      verificado: true
    });

    this.reseñas.push({
      id_reseña: this.contadorReseñas++,
      id_cliente: 1, // María González
      calificacion: 4,
      comentario: 'Muy buena experiencia con la hamburguesa vegetariana. Estaba deliciosa. El único detalle es que tardaron un poco en servir, pero valió la pena la espera.',
      fecha: '2024-01-20T13:45:00',
      verificado: true,
      producto_reseñado: 'Vegetariana Suprema'
    });

    this.reseñas.push({
      id_reseña: this.contadorReseñas++,
      id_cliente: 2, // Carlos Rodríguez
      calificacion: 5,
      comentario: 'Excelente calidad-precio. Las porciones son generosas y todo está muy bien preparado. El personal es muy amable y atento.',
      fecha: '2024-01-18T17:20:00',
      verificado: false
    });

    // Crear todos los productos del menú
    
    // HAMBURGUESAS
    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'BarrasoBurger Clásica',
      descripcion: 'Jugosa carne de res con queso cheddar derretido, lechuga y tomate',
      descripcion_detallada: 'Nuestra hamburguesa insignia que ha conquistado corazones desde el primer día. Preparada con carne de res 100% fresca, molida diariamente y cocinada a la perfección. El queso cheddar se derrite lentamente sobre la carne caliente, mientras que la lechuga iceberg y el tomate maduro aportan frescura y textura.',
      precio: 11.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Queso cheddar', 'Lechuga iceberg', 'Tomate fresco', 'Pan brioche', 'Salsa especial de la casa', 'Cebolla roja', 'Pepinillos'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 650,
      tiempo_preparacion: '12-15 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Bacon Deluxe',
      descripcion: 'Bacon crujiente, queso cheddar y nuestra salsa especial',
      descripcion_detallada: 'Para los amantes del bacon, esta hamburguesa es un sueño hecho realidad. Doble ración de bacon ahumado y crujiente, combinado con nuestra jugosa carne de res y queso cheddar premium. La salsa especial de la casa, con toques ahumados, complementa perfectamente todos los sabores.',
      precio: 14.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Bacon ahumado (4 tiras)', 'Queso cheddar premium', 'Lechuga', 'Tomate', 'Pan brioche', 'Salsa BBQ especial', 'Cebolla caramelizada'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 820,
      tiempo_preparacion: '15-18 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Aguacate Ranch',
      descripcion: 'Aguacate fresco y salsa ranch cremosa con cebolla caramelizada',
      descripcion_detallada: 'Una combinación perfecta entre lo clásico y lo moderno. Aguacate fresco de California, cortado al momento, se une con nuestra cremosa salsa ranch casera. La cebolla caramelizada añade un toque dulce que equilibra todos los sabores.',
      precio: 13.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Aguacate fresco', 'Salsa ranch casera', 'Cebolla caramelizada', 'Lechuga mixta', 'Tomate cherry', 'Pan integral', 'Queso monterey jack'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
      calorias: 720,
      tiempo_preparacion: '14-16 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'BBQ Especial',
      descripcion: 'Salsa BBQ casera, aros de cebolla y queso pepper jack',
      descripcion_detallada: 'Una explosión de sabores ahumados y picantes. Nuestra salsa BBQ se cocina lentamente durante horas con ingredientes secretos. Los aros de cebolla crujientes y el queso pepper jack le dan la textura y el toque picante perfecto.',
      precio: 15.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Salsa BBQ casera', 'Aros de cebolla crujientes', 'Queso pepper jack', 'Bacon', 'Lechuga', 'Pan brioche', 'Jalapeños encurtidos'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 890,
      tiempo_preparacion: '16-20 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Vegetariana Suprema',
      descripcion: 'Hamburguesa de quinoa y vegetales con aguacate y hummus',
      descripcion_detallada: 'Nuestra opción vegetariana no tiene nada que envidiar a las demás. Hamburguesa artesanal hecha con quinoa, lentejas y vegetales frescos. El hummus casero y el aguacate aportan cremosidad, mientras que los vegetales asados dan un sabor profundo y satisfactorio.',
      precio: 12.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Hamburguesa de quinoa y lentejas', 'Aguacate', 'Hummus casero', 'Vegetales asados', 'Brotes frescos', 'Tomate', 'Pan integral', 'Salsa tahini'],
      alergenos: ['Gluten', 'Sésamo'],
      calorias: 580,
      tiempo_preparacion: '12-14 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Picante Jalapeño',
      descripcion: 'Jalapeños frescos, queso pepper jack y salsa chipotle',
      descripcion_detallada: '¡Para los valientes! Esta hamburguesa no es para los débiles de corazón. Jalapeños frescos y encurtidos, combinados con nuestra salsa chipotle casera y queso pepper jack que se derrite perfectamente. El nivel de picante es intenso pero equilibrado.',
      precio: 14.49,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Jalapeños frescos', 'Jalapeños encurtidos', 'Queso pepper jack', 'Salsa chipotle', 'Cebolla roja', 'Lechuga', 'Pan brioche'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 750,
      tiempo_preparacion: '13-15 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    // ACOMPAÑAMIENTOS
    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Papas Fritas Crujientes',
      descripcion: 'Papas cortadas a mano, perfectamente saladas y crujientes',
      descripcion_detallada: 'Nuestras famosas papas fritas, cortadas a mano cada mañana de papas frescas seleccionadas. Freídas en aceite de girasol a la temperatura perfecta para lograr ese exterior dorado y crujiente con interior suave y esponjoso.',
      precio: 4.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Papas frescas', 'Aceite de girasol', 'Sal marina', 'Especias secretas'],
      alergenos: [],
      calorias: 320,
      tiempo_preparacion: '8-10 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Aros de Cebolla Dorados',
      descripcion: 'Cebolla cortada gruesa, empanizada y dorada',
      descripcion_detallada: 'Aros de cebolla dulce cortados gruesos, empanizados con nuestra mezcla especial de harinas y especias. Freídos hasta lograr un dorado perfecto. Servidos con salsa ranch para acompañar.',
      precio: 5.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Cebolla dulce', 'Harina de trigo', 'Harina de maíz', 'Especias', 'Aceite vegetal', 'Salsa ranch'],
      alergenos: ['Gluten', 'Huevos', 'Lácteos'],
      calorias: 380,
      tiempo_preparacion: '10-12 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Papas de Camote',
      descripcion: 'Naturalmente dulces y sabrosas, con un toque de canela',
      descripcion_detallada: 'Una alternativa más saludable y deliciosa. Camotes frescos cortados en bastones, horneados hasta la perfección y espolvoreados con canela y una pizca de sal marina. Naturalmente dulces y nutritivos.',
      precio: 5.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Camote fresco', 'Aceite de oliva', 'Canela', 'Sal marina', 'Páprika dulce'],
      alergenos: [],
      calorias: 280,
      tiempo_preparacion: '15-18 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Nuggets de Pollo',
      descripcion: 'Tiernos trozos de pollo empanizados con especias secretas',
      descripcion_detallada: 'Trozos de pechuga de pollo fresco, marinados en buttermilk y empanizados con nuestra mezcla secreta de especias. Crujientes por fuera, jugosos por dentro. Servidos con tu salsa favorita.',
      precio: 6.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Pechuga de pollo', 'Buttermilk', 'Harina especiada', 'Aceite vegetal', 'Salsas variadas'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 420,
      tiempo_preparacion: '12-15 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Ensalada César',
      descripcion: 'Lechuga fresca, crutones caseros y aderezo césar',
      descripcion_detallada: 'Ensalada clásica con lechuga romana fresca, crutones caseros dorados y nuestro aderezo césar preparado con anchoas, parmesano y limón fresco. Una opción ligera pero llena de sabor.',
      precio: 7.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Lechuga romana', 'Crutones caseros', 'Queso parmesano', 'Aderezo césar', 'Anchoas', 'Limón'],
      alergenos: ['Gluten', 'Lácteos', 'Pescado', 'Huevos'],
      calorias: 250,
      tiempo_preparacion: '5-7 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Palitos de Mozzarella',
      descripcion: 'Queso mozzarella empanizado, servido con salsa marinara',
      descripcion_detallada: 'Bastones de mozzarella de alta calidad, empanizados con pan rallado italiano y freídos hasta lograr un exterior dorado. El queso se derrite creando esa textura irresistible. Acompañados con salsa marinara casera.',
      precio: 5.99,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Queso mozzarella', 'Pan rallado italiano', 'Harina', 'Huevos', 'Salsa marinara', 'Aceite vegetal'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
      calorias: 450,
      tiempo_preparacion: '8-10 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    // BEBIDAS
    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Coca-Cola',
      descripcion: 'El clásico refrescante que nunca pasa de moda',
      descripcion_detallada: 'La bebida cola más famosa del mundo, servida bien fría con hielo fresco. Su sabor único y refrescante es el acompañamiento perfecto para cualquier comida.',
      precio: 2.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Agua carbonatada', 'Jarabe de cola', 'Cafeína', 'Ácido fosfórico'],
      alergenos: [],
      calorias: 140,
      tiempo_preparacion: '1 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Sprite',
      descripcion: 'Refrescante sabor limón-lima para acompañar tu comida',
      descripcion_detallada: 'Bebida gaseosa con sabor natural de limón y lima. Sin cafeína, perfecta para refrescar el paladar. Su sabor cítrico y burbujeante complementa especialmente bien las comidas picantes.',
      precio: 2.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Agua carbonatada', 'Sabor natural de limón-lima', 'Ácido cítrico', 'Benzoato de sodio'],
      alergenos: [],
      calorias: 120,
      tiempo_preparacion: '1 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Té Helado',
      descripcion: 'Fresco y crujiente, perfecto para días calurosos',
      descripcion_detallada: 'Té negro premium preparado fresco cada día, endulzado ligeramente y servido con hielo y una rodaja de limón. Una alternativa refrescante y menos dulce a los refrescos tradicionales.',
      precio: 3.29,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Té negro premium', 'Azúcar', 'Limón fresco', 'Hielo', 'Agua filtrada'],
      alergenos: [],
      calorias: 80,
      tiempo_preparacion: '2-3 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Malteada de Vainilla',
      descripcion: 'Cremosa malteada hecha con helado premium de vainilla',
      descripcion_detallada: 'Malteada clásica preparada con helado premium de vainilla, leche fresca y extracto de vainilla real. Batida hasta lograr la consistencia perfecta y coronada con crema batida.',
      precio: 4.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Helado de vainilla premium', 'Leche fresca', 'Extracto de vainilla', 'Crema batida', 'Jarabe de malta'],
      alergenos: ['Lácteos'],
      calorias: 380,
      tiempo_preparacion: '3-5 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Jugo de Naranja Natural',
      descripcion: 'Exprimido fresco cada mañana, 100% natural',
      descripcion_detallada: 'Jugo de naranja 100% natural, exprimido fresco cada mañana de naranjas valencianas seleccionadas. Rico en vitamina C y sin azúcares añadidos. La opción más saludable y refrescante.',
      precio: 3.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Naranjas valencianas frescas', 'Sin aditivos'],
      alergenos: [],
      calorias: 110,
      tiempo_preparacion: '2 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Café Americano',
      descripcion: 'Café recién molido, fuerte y aromático',
      descripcion_detallada: 'Café americano preparado con granos 100% arábica, tostados artesanalmente. Fuerte, aromático y con cuerpo. Perfecto para acompañar tu comida o para ese impulso de energía que necesitas.',
      precio: 2.29,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Granos de café arábica', 'Agua filtrada'],
      alergenos: [],
      calorias: 5,
      tiempo_preparacion: '3-4 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    // Guardar datos después de inicializar
    this.guardarDatos();
  }

  // Función separada para crear solo los productos iniciales
  private crearProductosIniciales() {
    // Limpiar productos existentes para evitar duplicados
    this.productos = [];
    this.contadorProductos = 1;

    // HAMBURGUESAS
    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'BarrasoBurger Clásica',
      descripcion: 'Jugosa carne de res con queso cheddar derretido, lechuga y tomate',
      descripcion_detallada: 'Nuestra hamburguesa insignia que ha conquistado corazones desde el primer día. Preparada con carne de res 100% fresca, molida diariamente y cocinada a la perfección. El queso cheddar se derrite lentamente sobre la carne caliente, mientras que la lechuga iceberg y el tomate maduro aportan frescura y textura.',
      precio: 11.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Queso cheddar', 'Lechuga iceberg', 'Tomate fresco', 'Pan brioche', 'Salsa especial de la casa', 'Cebolla roja', 'Pepinillos'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 650,
      tiempo_preparacion: '12-15 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Bacon Deluxe',
      descripcion: 'Bacon crujiente, queso cheddar y nuestra salsa especial',
      descripcion_detallada: 'Para los amantes del bacon, esta hamburguesa es un sueño hecho realidad. Doble ración de bacon ahumado y crujiente, combinado con nuestra jugosa carne de res y queso cheddar premium. La salsa especial de la casa, con toques ahumados, complementa perfectamente todos los sabores.',
      precio: 14.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Bacon ahumado (4 tiras)', 'Queso cheddar premium', 'Lechuga', 'Tomate', 'Pan brioche', 'Salsa BBQ especial', 'Cebolla caramelizada'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 820,
      tiempo_preparacion: '15-18 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Aguacate Ranch',
      descripcion: 'Aguacate fresco y salsa ranch cremosa con cebolla caramelizada',
      descripcion_detallada: 'Una combinación perfecta entre lo clásico y lo moderno. Aguacate fresco de California, cortado al momento, se une con nuestra cremosa salsa ranch casera. La cebolla caramelizada añade un toque dulce que equilibra todos los sabores.',
      precio: 13.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Aguacate fresco', 'Salsa ranch casera', 'Cebolla caramelizada', 'Lechuga mixta', 'Tomate cherry', 'Pan integral', 'Queso monterey jack'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
      calorias: 720,
      tiempo_preparacion: '14-16 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'BBQ Especial',
      descripcion: 'Salsa BBQ casera, aros de cebolla y queso pepper jack',
      descripcion_detallada: 'Una explosión de sabores ahumados y picantes. Nuestra salsa BBQ se cocina lentamente durante horas con ingredientes secretos. Los aros de cebolla crujientes y el queso pepper jack le dan la textura y el toque picante perfecto.',
      precio: 15.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Salsa BBQ casera', 'Aros de cebolla crujientes', 'Queso pepper jack', 'Bacon', 'Lechuga', 'Pan brioche', 'Jalapeños encurtidos'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 890,
      tiempo_preparacion: '16-20 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Vegetariana Suprema',
      descripcion: 'Hamburguesa de quinoa y vegetales con aguacate y hummus',
      descripcion_detallada: 'Nuestra opción vegetariana no tiene nada que envidiar a las demás. Hamburguesa artesanal hecha con quinoa, lentejas y vegetales frescos. El hummus casero y el aguacate aportan cremosidad, mientras que los vegetales asados dan un sabor profundo y satisfactorio.',
      precio: 12.99,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Hamburguesa de quinoa y lentejas', 'Aguacate', 'Hummus casero', 'Vegetales asados', 'Brotes frescos', 'Tomate', 'Pan integral', 'Salsa tahini'],
      alergenos: ['Gluten', 'Sésamo'],
      calorias: 580,
      tiempo_preparacion: '12-14 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Picante Jalapeño',
      descripcion: 'Jalapeños frescos, queso pepper jack y salsa chipotle',
      descripcion_detallada: '¡Para los valientes! Esta hamburguesa no es para los débiles de corazón. Jalapeños frescos y encurtidos, combinados con nuestra salsa chipotle casera y queso pepper jack que se derrite perfectamente. El nivel de picante es intenso pero equilibrado.',
      precio: 14.49,
      categoria: 'hamburguesas',
      imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Carne de res (150g)', 'Jalapeños frescos', 'Jalapeños encurtidos', 'Queso pepper jack', 'Salsa chipotle', 'Cebolla roja', 'Lechuga', 'Pan brioche'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 750,
      tiempo_preparacion: '13-15 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    // ACOMPAÑAMIENTOS
    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Papas Fritas Crujientes',
      descripcion: 'Papas cortadas a mano, perfectamente saladas y crujientes',
      descripcion_detallada: 'Nuestras famosas papas fritas, cortadas a mano cada mañana de papas frescas seleccionadas. Freídas en aceite de girasol a la temperatura perfecta para lograr ese exterior dorado y crujiente con interior suave y esponjoso.',
      precio: 4.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Papas frescas', 'Aceite de girasol', 'Sal marina', 'Especias secretas'],
      alergenos: [],
      calorias: 320,
      tiempo_preparacion: '8-10 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Aros de Cebolla Dorados',
      descripcion: 'Cebolla cortada gruesa, empanizada y dorada',
      descripcion_detallada: 'Aros de cebolla dulce cortados gruesos, empanizados con nuestra mezcla especial de harinas y especias. Freídos hasta lograr un dorado perfecto. Servidos con salsa ranch para acompañar.',
      precio: 5.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Cebolla dulce', 'Harina de trigo', 'Harina de maíz', 'Especias', 'Aceite vegetal', 'Salsa ranch'],
      alergenos: ['Gluten', 'Huevos', 'Lácteos'],
      calorias: 380,
      tiempo_preparacion: '10-12 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Papas de Camote',
      descripcion: 'Naturalmente dulces y sabrosas, con un toque de canela',
      descripcion_detallada: 'Una alternativa más saludable y deliciosa. Camotes frescos cortados en bastones, horneados hasta la perfección y espolvoreados con canela y una pizca de sal marina. Naturalmente dulces y nutritivos.',
      precio: 5.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Camote fresco', 'Aceite de oliva', 'Canela', 'Sal marina', 'Páprika dulce'],
      alergenos: [],
      calorias: 280,
      tiempo_preparacion: '15-18 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Nuggets de Pollo',
      descripcion: 'Tiernos trozos de pollo empanizados con especias secretas',
      descripcion_detallada: 'Trozos de pechuga de pollo fresco, marinados en buttermilk y empanizados con nuestra mezcla secreta de especias. Crujientes por fuera, jugosos por dentro. Servidos con tu salsa favorita.',
      precio: 6.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Pechuga de pollo', 'Buttermilk', 'Harina especiada', 'Aceite vegetal', 'Salsas variadas'],
      alergenos: ['Gluten', 'Lácteos'],
      calorias: 420,
      tiempo_preparacion: '12-15 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Ensalada César',
      descripcion: 'Lechuga fresca, crutones caseros y aderezo césar',
      descripcion_detallada: 'Ensalada clásica con lechuga romana fresca, crutones caseros dorados y nuestro aderezo césar preparado con anchoas, parmesano y limón fresco. Una opción ligera pero llena de sabor.',
      precio: 7.49,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Lechuga romana', 'Crutones caseros', 'Queso parmesano', 'Aderezo césar', 'Anchoas', 'Limón'],
      alergenos: ['Gluten', 'Lácteos', 'Pescado', 'Huevos'],
      calorias: 250,
      tiempo_preparacion: '5-7 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Palitos de Mozzarella',
      descripcion: 'Queso mozzarella empanizado, servido con salsa marinara',
      descripcion_detallada: 'Bastones de mozzarella de alta calidad, empanizados con pan rallado italiano y freídos hasta lograr un exterior dorado. El queso se derrite creando esa textura irresistible. Acompañados con salsa marinara casera.',
      precio: 5.99,
      categoria: 'acompañamientos',
      imagen: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Queso mozzarella', 'Pan rallado italiano', 'Harina', 'Huevos', 'Salsa marinara', 'Aceite vegetal'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
      calorias: 450,
      tiempo_preparacion: '8-10 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    // BEBIDAS
    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Coca-Cola',
      descripcion: 'El clásico refrescante que nunca pasa de moda',
      descripcion_detallada: 'La bebida cola más famosa del mundo, servida bien fría con hielo fresco. Su sabor único y refrescante es el acompañamiento perfecto para cualquier comida.',
      precio: 2.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Agua carbonatada', 'Jarabe de cola', 'Cafeína', 'Ácido fosfórico'],
      alergenos: [],
      calorias: 140,
      tiempo_preparacion: '1 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Sprite',
      descripcion: 'Refrescante sabor limón-lima para acompañar tu comida',
      descripcion_detallada: 'Bebida gaseosa con sabor natural de limón y lima. Sin cafeína, perfecta para refrescar el paladar. Su sabor cítrico y burbujeante complementa especialmente bien las comidas picantes.',
      precio: 2.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Agua carbonatada', 'Sabor natural de limón-lima', 'Ácido cítrico', 'Benzoato de sodio'],
      alergenos: [],
      calorias: 120,
      tiempo_preparacion: '1 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Té Helado',
      descripcion: 'Fresco y crujiente, perfecto para días calurosos',
      descripcion_detallada: 'Té negro premium preparado fresco cada día, endulzado ligeramente y servido con hielo y una rodaja de limón. Una alternativa refrescante y menos dulce a los refrescos tradicionales.',
      precio: 3.29,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Té negro premium', 'Azúcar', 'Limón fresco', 'Hielo', 'Agua filtrada'],
      alergenos: [],
      calorias: 80,
      tiempo_preparacion: '2-3 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Malteada de Vainilla',
      descripcion: 'Cremosa malteada hecha con helado premium de vainilla',
      descripcion_detallada: 'Malteada clásica preparada con helado premium de vainilla, leche fresca y extracto de vainilla real. Batida hasta lograr la consistencia perfecta y coronada con crema batida.',
      precio: 4.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Helado de vainilla premium', 'Leche fresca', 'Extracto de vainilla', 'Crema batida', 'Jarabe de malta'],
      alergenos: ['Lácteos'],
      calorias: 380,
      tiempo_preparacion: '3-5 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Jugo de Naranja Natural',
      descripcion: 'Exprimido fresco cada mañana, 100% natural',
      descripcion_detallada: 'Jugo de naranja 100% natural, exprimido fresco cada mañana de naranjas valencianas seleccionadas. Rico en vitamina C y sin azúcares añadidos. La opción más saludable y refrescante.',
      precio: 3.79,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Naranjas valencianas frescas', 'Sin aditivos'],
      alergenos: [],
      calorias: 110,
      tiempo_preparacion: '2 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    this.productos.push({
      id_producto: this.contadorProductos++,
      nombre: 'Café Americano',
      descripcion: 'Café recién molido, fuerte y aromático',
      descripcion_detallada: 'Café americano preparado con granos 100% arábica, tostados artesanalmente. Fuerte, aromático y con cuerpo. Perfecto para acompañar tu comida o para ese impulso de energía que necesitas.',
      precio: 2.29,
      categoria: 'bebidas',
      imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ingredientes: ['Granos de café arábica', 'Agua filtrada'],
      alergenos: [],
      calorias: 5,
      tiempo_preparacion: '3-4 min',
      disponible: true,
      fecha_creacion: '2024-01-01T00:00:00',
      fecha_modificacion: '2024-01-01T00:00:00'
    });

    // Guardar productos después de crearlos
    this.guardarDatos();
    console.log('Productos iniciales creados:', this.productos.length);
  }

  // Función para autenticar usuario
  autenticarUsuario(username: string, password: string): Usuario | null {
    const usuario = this.usuarios.find(u => u.username === username && u.password === password);
    return usuario || null;
  }

  // Función para registrar nuevo usuario
  registrarUsuario(username: string, password: string, rol: 'cliente' | 'empleado' = 'cliente'): Usuario | null {
    // Verificar si el usuario ya existe
    if (this.usuarios.find(u => u.username === username)) {
      return null; // Usuario ya existe
    }

    const nuevoUsuario: Usuario = {
      id_usuario: this.contadorUsuarios++,
      username,
      password, // En producción esto estaría encriptado
      rol
    };

    this.usuarios.push(nuevoUsuario);
    this.guardarDatos(); // Guardar en localStorage
    console.log('Nuevo usuario registrado:', nuevoUsuario);
    return nuevoUsuario;
  }

  // Función para generar código único para cliente
  private generarCodigoUnico(): string {
    // Generar código de 8 caracteres alfanuméricos
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    
    do {
      codigo = '';
      for (let i = 0; i < 8; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
    } while (this.clientes.some(c => c.codigo_unico === codigo)); // Asegurar que sea único
    
    return codigo;
  }

  // Función para crear cliente con nombre completo separado
  crearCliente(id_usuario: number, nombreCompleto: string, telefono: string, email: string, dni?: string): Cliente {
    // Separar el nombre completo en partes
    const partesNombre = nombreCompleto.trim().split(' ');
    const nombre = partesNombre[0] || '';
    const apellido1 = partesNombre[1] || '';
    const apellido2 = partesNombre.slice(2).join(' ') || '';

    const nuevoCliente: Cliente = {
      id_cliente: this.contadorClientes++,
      id_usuario,
      nombre: nombreCompleto, // Mantener nombre completo para compatibilidad
      apellido1,
      apellido2,
      dni,
      telefono,
      email,
      puntos: 0,
      fecha_registro: new Date().toISOString().split('T')[0],
      codigo_unico: this.generarCodigoUnico()
    };

    this.clientes.push(nuevoCliente);
    this.guardarDatos(); // Guardar en localStorage
    console.log('Nuevo cliente creado:', nuevoCliente);
    return nuevoCliente;
  }

  // Función para actualizar datos del cliente
  actualizarCliente(id_cliente: number, datosActualizados: Partial<Cliente>): boolean {
    const clienteIndex = this.clientes.findIndex(c => c.id_cliente === id_cliente);
    if (clienteIndex !== -1) {
      this.clientes[clienteIndex] = {
        ...this.clientes[clienteIndex],
        ...datosActualizados
      };
      this.guardarDatos(); // Guardar en localStorage
      console.log('Cliente actualizado:', this.clientes[clienteIndex]);
      return true;
    }
    return false;
  }

  // Función para obtener todos los usuarios
  obtenerTodosLosUsuarios(): Usuario[] {
    return [...this.usuarios];
  }

  // Función para obtener todos los clientes con información de usuario
  obtenerTodosLosClientes(): (Cliente & { username: string })[] {
    return this.clientes.map(cliente => {
      const usuario = this.usuarios.find(u => u.id_usuario === cliente.id_usuario);
      return {
        ...cliente,
        username: usuario?.username || 'N/A'
      };
    });
  }

  // Función para buscar cliente por código (username, ID o código único)
  buscarClientePorCodigo(codigo: string): (Cliente & { username: string }) | null {
    const todosLosClientes = this.obtenerTodosLosClientes();
    return todosLosClientes.find(cliente => 
      cliente.username.toLowerCase() === codigo.toLowerCase() ||
      cliente.id_cliente.toString() === codigo ||
      cliente.codigo_unico.toLowerCase() === codigo.toLowerCase()
    ) || null;
  }

  // Función para obtener cliente por código único
  obtenerClientePorCodigoUnico(codigoUnico: string): (Cliente & { username: string }) | null {
    const todosLosClientes = this.obtenerTodosLosClientes();
    return todosLosClientes.find(cliente => 
      cliente.codigo_unico.toLowerCase() === codigoUnico.toLowerCase()
    ) || null;
  }

  // Función para regenerar código único de un cliente
  regenerarCodigoUnico(id_cliente: number): string | null {
    const clienteIndex = this.clientes.findIndex(c => c.id_cliente === id_cliente);
    if (clienteIndex !== -1) {
      const nuevoCodigo = this.generarCodigoUnico();
      this.clientes[clienteIndex].codigo_unico = nuevoCodigo;
      this.guardarDatos();
      console.log(`Código único regenerado para cliente ${id_cliente}: ${nuevoCodigo}`);
      return nuevoCodigo;
    }
    return null;
  }

  // Función para obtener pedidos de un cliente
  obtenerPedidosCliente(id_cliente: number): Pedido[] {
    return this.pedidos.filter(p => p.id_cliente === id_cliente);
  }

  // Función para obtener todos los pedidos
  obtenerTodosLosPedidos(): (Pedido & { nombreCliente: string })[] {
    return this.pedidos.map(pedido => {
      const cliente = this.clientes.find(c => c.id_cliente === pedido.id_cliente);
      return {
        ...pedido,
        nombreCliente: cliente?.nombre || 'Cliente Desconocido'
      };
    });
  }

  // Función para actualizar rol de usuario
  actualizarRolUsuario(id_usuario: number, nuevoRol: 'admin' | 'empleado' | 'cliente'): boolean {
    const usuarioIndex = this.usuarios.findIndex(u => u.id_usuario === id_usuario);
    if (usuarioIndex !== -1) {
      this.usuarios[usuarioIndex].rol = nuevoRol;
      this.guardarDatos(); // Guardar en localStorage
      console.log('Rol de usuario actualizado:', this.usuarios[usuarioIndex]);
      return true;
    }
    return false;
  }

  // Función para agregar puntos a un cliente
  agregarPuntos(id_cliente: number, puntos: number): boolean {
    const clienteIndex = this.clientes.findIndex(c => c.id_cliente === id_cliente);
    if (clienteIndex !== -1) {
      this.clientes[clienteIndex].puntos += puntos;
      this.guardarDatos(); // Guardar en localStorage
      console.log(`Puntos agregados: ${puntos} al cliente ${this.clientes[clienteIndex].nombre}`);
      return true;
    }
    return false;
  }

  // Función para crear un nuevo pedido
  crearPedido(
    id_cliente: number, 
    total: number, 
    productos: Omit<DetallePedido, 'id_detalle' | 'id_pedido'>[], 
    direccion_entrega?: string, 
    telefono_contacto?: string, 
    metodo_pago?: string
  ): Pedido {
    const nuevoPedido: Pedido = {
      id_pedido: this.contadorPedidos++,
      id_cliente,
      fecha: new Date().toISOString(),
      total,
      productos: productos.map((producto, index) => ({
        ...producto,
        id_detalle: Date.now() + index,
        id_pedido: this.contadorPedidos - 1
      })),
      estado: 'pendiente',
      tiempo_estimado: '45-60 min',
      direccion_entrega,
      telefono_contacto,
      metodo_pago,
      fecha_actualizacion: new Date().toISOString()
    };

    this.pedidos.push(nuevoPedido);
    
    // Agregar puntos automáticamente (1 punto por cada euro gastado)
    this.agregarPuntos(id_cliente, Math.floor(total));
    
    this.guardarDatos(); // Guardar en localStorage
    console.log('Nuevo pedido creado:', nuevoPedido);
    
    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('nuevoPedido', { detail: nuevoPedido }));
    
    return nuevoPedido;
  }

  // Función para actualizar estado del pedido
  actualizarEstadoPedido(
    id_pedido: number, 
    nuevoEstado: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_camino' | 'entregado' | 'cancelado',
    tiempo_estimado?: string,
    notas_cocina?: string
  ): boolean {
    const pedidoIndex = this.pedidos.findIndex(p => p.id_pedido === id_pedido);
    if (pedidoIndex !== -1) {
      this.pedidos[pedidoIndex] = {
        ...this.pedidos[pedidoIndex],
        estado: nuevoEstado,
        tiempo_estimado: tiempo_estimado || this.pedidos[pedidoIndex].tiempo_estimado,
        notas_cocina: notas_cocina || this.pedidos[pedidoIndex].notas_cocina,
        fecha_actualizacion: new Date().toISOString()
      };
      
      this.guardarDatos();
      console.log('Estado del pedido actualizado:', this.pedidos[pedidoIndex]);
      
      // Disparar evento para notificar cambios en tiempo real
      window.dispatchEvent(new CustomEvent('estadoPedidoActualizado', { 
        detail: { 
          pedido: this.pedidos[pedidoIndex],
          nuevoEstado,
          tiempo_estimado,
          notas_cocina
        }
      }));
      
      return true;
    }
    return false;
  }

  // Función para obtener pedidos por estado
  obtenerPedidosPorEstado(estado: string): (Pedido & { nombreCliente: string })[] {
    return this.pedidos
      .filter(p => estado === 'todos' || p.estado === estado)
      .map(pedido => {
        const cliente = this.clientes.find(c => c.id_cliente === pedido.id_cliente);
        return {
          ...pedido,
          nombreCliente: cliente?.nombre || 'Cliente Desconocido'
        };
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  // Función para obtener estadísticas de pedidos
  obtenerEstadisticasPedidos() {
    const totalPedidos = this.pedidos.length;
    const pedidosPorEstado = {
      pendiente: this.pedidos.filter(p => p.estado === 'pendiente').length,
      confirmado: this.pedidos.filter(p => p.estado === 'confirmado').length,
      preparando: this.pedidos.filter(p => p.estado === 'preparando').length,
      listo: this.pedidos.filter(p => p.estado === 'listo').length,
      en_camino: this.pedidos.filter(p => p.estado === 'en_camino').length,
      entregado: this.pedidos.filter(p => p.estado === 'entregado').length,
      cancelado: this.pedidos.filter(p => p.estado === 'cancelado').length
    };

    const pedidosHoy = this.pedidos.filter(p => {
      const fechaPedido = new Date(p.fecha);
      const hoy = new Date();
      return fechaPedido.toDateString() === hoy.toDateString();
    }).length;

    const ingresoHoy = this.pedidos
      .filter(p => {
        const fechaPedido = new Date(p.fecha);
        const hoy = new Date();
        return fechaPedido.toDateString() === hoy.toDateString() && p.estado !== 'cancelado';
      })
      .reduce((total, pedido) => total + pedido.total, 0);

    return {
      totalPedidos,
      pedidosPorEstado,
      pedidosHoy,
      ingresoHoy
    };
  }

  // Función para obtener cliente por id de usuario
  obtenerClientePorUsuario(id_usuario: number): Cliente | null {
    return this.clientes.find(c => c.id_usuario === id_usuario) || null;
  }

  // Función para eliminar usuario
  eliminarUsuario(id_usuario: number): boolean {
    const usuarioIndex = this.usuarios.findIndex(u => u.id_usuario === id_usuario);
    if (usuarioIndex !== -1 && this.usuarios[usuarioIndex].rol !== 'admin') {
      // Eliminar usuario
      const usuarioEliminado = this.usuarios[usuarioIndex];
      this.usuarios.splice(usuarioIndex, 1);
      
      // Eliminar cliente asociado si existe
      const clienteIndex = this.clientes.findIndex(c => c.id_usuario === id_usuario);
      if (clienteIndex !== -1) {
        this.clientes.splice(clienteIndex, 1);
      }
      
      this.guardarDatos(); // Guardar en localStorage
      console.log('Usuario eliminado:', usuarioEliminado);
      return true;
    }
    return false; // No se puede eliminar admin o usuario no encontrado
  }

  // Función para crear una nueva reseña
  crearReseña(id_cliente: number, calificacion: number, comentario: string, producto_reseñado?: string): Reseña {
    const nuevaReseña: Reseña = {
      id_reseña: this.contadorReseñas++,
      id_cliente,
      calificacion,
      comentario,
      fecha: new Date().toISOString(),
      verificado: false, // Las reseñas nuevas no están verificadas inicialmente
      producto_reseñado
    };

    this.reseñas.push(nuevaReseña);
    this.guardarDatos();
    console.log('Nueva reseña creada:', nuevaReseña);
    return nuevaReseña;
  }

  // Función para obtener todas las reseñas con información del cliente
  obtenerTodasLasReseñas(): (Reseña & { nombreCliente: string; avatarCliente: string })[] {
    return this.reseñas.map(reseña => {
      const cliente = this.clientes.find(c => c.id_cliente === reseña.id_cliente);
      return {
        ...reseña,
        nombreCliente: cliente?.nombre || 'Cliente Anónimo',
        avatarCliente: this.generarAvatarCliente(cliente?.nombre || 'Anónimo')
      };
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Más recientes primero
  }

  // Función para obtener reseñas de un cliente específico
  obtenerReseñasCliente(id_cliente: number): Reseña[] {
    return this.reseñas.filter(r => r.id_cliente === id_cliente)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  // Función para obtener estadísticas de reseñas
  obtenerEstadisticasReseñas() {
    const totalReseñas = this.reseñas.length;
    const sumaCalificaciones = this.reseñas.reduce((suma, reseña) => suma + reseña.calificacion, 0);
    const promedioCalificacion = totalReseñas > 0 ? sumaCalificaciones / totalReseñas : 0;
    
    const distribucionCalificaciones = [5, 4, 3, 2, 1].map(estrella => ({
      estrella,
      cantidad: this.reseñas.filter(r => r.calificacion === estrella).length,
      porcentaje: totalReseñas > 0 ? (this.reseñas.filter(r => r.calificacion === estrella).length / totalReseñas) * 100 : 0
    }));

    return {
      totalReseñas,
      promedioCalificacion,
      distribucionCalificaciones
    };
  }

  // Función para verificar una reseña (solo admin)
  verificarReseña(id_reseña: number): boolean {
    const reseñaIndex = this.reseñas.findIndex(r => r.id_reseña === id_reseña);
    if (reseñaIndex !== -1) {
      this.reseñas[reseñaIndex].verificado = true;
      this.guardarDatos();
      console.log('Reseña verificada:', this.reseñas[reseñaIndex]);
      return true;
    }
    return false;
  }

  // Función para eliminar una reseña
  eliminarReseña(id_reseña: number): boolean {
    const reseñaIndex = this.reseñas.findIndex(r => r.id_reseña === id_reseña);
    if (reseñaIndex !== -1) {
      const reseñaEliminada = this.reseñas[reseñaIndex];
      this.reseñas.splice(reseñaIndex, 1);
      this.guardarDatos();
      console.log('Reseña eliminada:', reseñaEliminada);
      return true;
    }
    return false;
  }

  // Función para generar avatar del cliente basado en el nombre
  private generarAvatarCliente(nombre: string): string {
    const avatares = ['👩‍🦱', '👨‍🦲', '👩‍🦰', '👨‍🦱', '👩‍🦳', '👨‍🦰', '👩‍🦱', '👨‍🦲'];
    const indice = nombre.length % avatares.length;
    return avatares[indice];
  }

  // Función para crear un nuevo producto
  crearProducto(datosProducto: Omit<ProductoMenu, 'id_producto' | 'fecha_creacion' | 'fecha_modificacion'>): ProductoMenu {
    const nuevoProducto: ProductoMenu = {
      ...datosProducto,
      id_producto: this.contadorProductos++,
      fecha_creacion: new Date().toISOString(),
      fecha_modificacion: new Date().toISOString()
    };

    this.productos.push(nuevoProducto);
    this.guardarDatos();
    console.log('Nuevo producto creado:', nuevoProducto);
    return nuevoProducto;
  }

  // Función para obtener todos los productos
  obtenerTodosLosProductos(): ProductoMenu[] {
    return [...this.productos].sort((a, b) => a.categoria.localeCompare(b.categoria));
  }

  // Función para obtener productos por categoría
  obtenerProductosPorCategoria(categoria: 'hamburguesas' | 'acompañamientos' | 'bebidas'): ProductoMenu[] {
    return this.productos.filter(p => p.categoria === categoria);
  }

  // Función para obtener un producto por ID
  obtenerProductoPorId(id_producto: number): ProductoMenu | null {
    return this.productos.find(p => p.id_producto === id_producto) || null;
  }

  // Función para actualizar un producto
  actualizarProducto(id_producto: number, datosActualizados: Partial<ProductoMenu>): boolean {
    const productoIndex = this.productos.findIndex(p => p.id_producto === id_producto);
    if (productoIndex !== -1) {
      this.productos[productoIndex] = {
        ...this.productos[productoIndex],
        ...datosActualizados,
        fecha_modificacion: new Date().toISOString()
      };
      this.guardarDatos();
      console.log('Producto actualizado:', this.productos[productoIndex]);
      return true;
    }
    return false;
  }

  // Función para eliminar un producto
  eliminarProducto(id_producto: number): boolean {
    const productoIndex = this.productos.findIndex(p => p.id_producto === id_producto);
    if (productoIndex !== -1) {
      const productoEliminado = this.productos[productoIndex];
      this.productos.splice(productoIndex, 1);
      this.guardarDatos();
      console.log('Producto eliminado:', productoEliminado);
      return true;
    }
    return false;
  }

  // Función para cambiar disponibilidad de un producto
  cambiarDisponibilidadProducto(id_producto: number, disponible: boolean): boolean {
    const exito = this.actualizarProducto(id_producto, { disponible });
    if (exito) {
      console.log(`Disponibilidad del producto ${id_producto} cambiada a: ${disponible}`);
    }
    return exito;
  }

  // Función para obtener estadísticas de productos
  obtenerEstadisticasProductos() {
    const totalProductos = this.productos.length;
    const productosDisponibles = this.productos.filter(p => p.disponible).length;
    const productosPorCategoria = {
      hamburguesas: this.productos.filter(p => p.categoria === 'hamburguesas').length,
      acompañamientos: this.productos.filter(p => p.categoria === 'acompañamientos').length,
      bebidas: this.productos.filter(p => p.categoria === 'bebidas').length
    };

    return {
      totalProductos,
      productosDisponibles,
      productosNoDisponibles: totalProductos - productosDisponibles,
      productosPorCategoria
    };
  }

  // Función para limpiar todos los datos (útil para testing)
  limpiarDatos(): void {
    this.usuarios = [];
    this.clientes = [];
    this.pedidos = [];
    this.reseñas = [];
    this.productos = [];
    this.contadorUsuarios = 1;
    this.contadorClientes = 1;
    this.contadorPedidos = 1;
    this.contadorReseñas = 1;
    this.contadorProductos = 1;
    
    // Limpiar localStorage
    localStorage.removeItem('barraso_usuarios');
    localStorage.removeItem('barraso_clientes');
    localStorage.removeItem('barraso_pedidos');
    localStorage.removeItem('barraso_reseñas');
    localStorage.removeItem('barraso_productos');
    
    // Reinicializar con datos de ejemplo
    this.inicializarDatos();
    console.log('Base de datos limpiada y reinicializada');
  }

  // Función para exportar datos (útil para debugging)
  exportarDatos(): string {
    const datos = {
      usuarios: this.usuarios,
      clientes: this.clientes,
      pedidos: this.pedidos,
      reseñas: this.reseñas,
      productos: this.productos,
      contadores: {
        usuarios: this.contadorUsuarios,
        clientes: this.contadorClientes,
        pedidos: this.contadorPedidos,
        reseñas: this.contadorReseñas,
        productos: this.contadorProductos
      }
    };
    return JSON.stringify(datos, null, 2);
  }

  // Función para obtener estadísticas generales
  obtenerEstadisticas() {
    const totalUsuarios = this.usuarios.length;
    const totalClientes = this.clientes.length;
    const totalPedidos = this.pedidos.length;
    const totalReseñas = this.reseñas.length;
    const totalProductos = this.productos.length;
    const ingresoTotal = this.pedidos.reduce((total, pedido) => total + pedido.total, 0);
    const puntosDistribuidos = this.clientes.reduce((total, cliente) => total + cliente.puntos, 0);

    return {
      totalUsuarios,
      totalClientes,
      totalPedidos,
      totalReseñas,
      totalProductos,
      ingresoTotal,
      puntosDistribuidos
    };
  }
}

// Instancia singleton de la base de datos
export const baseDatos = new BaseDatosService();
