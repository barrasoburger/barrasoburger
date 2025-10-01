import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipo para los idiomas disponibles
type Idioma = 'es' | 'en';

// Interfaz para las traducciones
interface Traducciones {
  [key: string]: {
    es: string;
    en: string;
  };
}

// Traducciones del sistema
const traducciones: Traducciones = {
  // Header
  'header.inicio': { es: 'Inicio', en: 'Home' },
  'header.menu': { es: 'Menú', en: 'Menu' },
  'header.reservas': { es: 'Reservas', en: 'Reservations' },
  'header.lealtad': { es: 'Lealtad', en: 'Loyalty' },
  'header.reseñas': { es: 'Reseñas', en: 'Reviews' },
  'header.historialPedidos': { es: 'Historial Pedidos', en: 'Order History' },
  'header.miPerfil': { es: 'Mi Perfil', en: 'My Profile' },
  'header.panelAdmin': { es: 'Panel Admin', en: 'Admin Panel' },
  'header.cerrarSesion': { es: 'Cerrar Sesión', en: 'Sign Out' },
  'header.iniciarSesion': { es: 'Iniciar Sesión', en: 'Sign In' },

  // Hero Section
  'hero.titulo': { es: 'La Hamburguesa Perfecta te Espera', en: 'The Perfect Burger Awaits You' },
  'hero.subtitulo': { es: 'Hechas con pasión, nuestras hamburguesas son una sinfonía de sabores. Pide ahora o reserva tu mesa para una experiencia inolvidable.', en: 'Made with passion, our burgers are a symphony of flavors. Order now or book your table for an unforgettable experience.' },
  'hero.hacerPedido': { es: 'Hacer Pedido', en: 'Place Order' },
  'hero.reservarMesa': { es: 'Reservar Mesa', en: 'Book Table' },

  // Destacados
  'destacados.titulo': { es: 'Destacados del Chef', en: 'Chef\'s Specials' },
  'destacados.subtitulo': { es: 'Creaciones únicas, solo por tiempo limitado.', en: 'Unique creations, for a limited time only.' },
  'destacados.hamburgesaMes': { es: 'Hamburguesa del Mes', en: 'Burger of the Month' },
  'destacados.volcanQueso': { es: 'La Volcán de Queso', en: 'The Cheese Volcano' },
  'destacados.descripcion': { es: 'Una explosión de sabor con doble carne de res, nuestro exclusivo queso cheddar fundido inyectado en el pan brioche, bacon crujiente y cebolla caramelizada al bourbon. ¡Una experiencia que no te puedes perder!', en: 'An explosion of flavor with double beef, our exclusive melted cheddar cheese injected into brioche bread, crispy bacon and bourbon caramelized onion. An experience you can\'t miss!' },
  'destacados.probarAhora': { es: 'Probar Ahora', en: 'Try Now' },
  'destacados.ingredientesFrescos': { es: 'Ingredientes Frescos', en: 'Fresh Ingredients' },
  'destacados.ingredientesDesc': { es: 'Seleccionados diariamente de proveedores locales', en: 'Selected daily from local suppliers' },
  'destacados.carnePremium': { es: 'Carne Premium', en: 'Premium Meat' },
  'destacados.carneDesc': { es: '100% carne de res, molida fresca cada día', en: '100% beef, freshly ground every day' },
  'destacados.preparacionArtesanal': { es: 'Preparación Artesanal', en: 'Artisanal Preparation' },
  'destacados.preparacionDesc': { es: 'Cada hamburguesa hecha a mano por nuestros chefs', en: 'Every burger handmade by our chefs' },

  // Menu
  'menu.titulo': { es: 'Nuestro Menú', en: 'Our Menu' },
  'menu.subtitulo': { es: 'Descubre nuestras deliciosas creaciones hechas con ingredientes frescos', en: 'Discover our delicious creations made with fresh ingredients' },
  'menu.hamburguesas': { es: 'Hamburguesas', en: 'Burgers' },
  'menu.acompañamientos': { es: 'Acompañamientos', en: 'Sides' },
  'menu.bebidas': { es: 'Bebidas', en: 'Drinks' },
  'menu.agregarCarrito': { es: 'Agregar al Carrito', en: 'Add to Cart' },
  'menu.enCarrito': { es: 'En carrito', en: 'In cart' },
  'menu.completo': { es: 'Nuestro Menú Completo', en: 'Our Complete Menu' },
  'menu.descripcionCompleta': { es: 'Descubre todas nuestras deliciosas opciones preparadas con ingredientes frescos', en: 'Discover all our delicious options prepared with fresh ingredients' },
  'menu.calidadBocado': { es: 'Calidad en Cada Bocado', en: 'Quality in Every Bite' },
  'menu.calidadDesc': { es: 'En BarrasoBurger, cada elemento de nuestro menú está cuidadosamente preparado con ingredientes frescos y de la más alta calidad. Nuestros chefs trabajan diariamente para ofrecerte sabores únicos e inolvidables.', en: 'At BarrasoBurger, every item on our menu is carefully prepared with fresh, highest quality ingredients. Our chefs work daily to offer you unique and unforgettable flavors.' },
  'menu.opcionesMenu': { es: 'Opciones de Menú', en: 'Menu Options' },
  'menu.ingredientesFrescos': { es: 'Ingredientes Frescos', en: 'Fresh Ingredients' },

  // Carrito
  'carrito.titulo': { es: 'Tu Carrito', en: 'Your Cart' },
  'carrito.subtitulo': { es: 'Revisa tu pedido antes de finalizar la compra', en: 'Review your order before checkout' },
  'carrito.vacio': { es: 'Tu carrito está vacío', en: 'Your cart is empty' },
  'carrito.vacioDesc': { es: '¡Agrega algunos productos deliciosos para comenzar!', en: 'Add some delicious products to get started!' },
  'carrito.verMenu': { es: 'Ver Menú', en: 'View Menu' },
  'carrito.productos': { es: 'Productos', en: 'Products' },
  'carrito.vaciarCarrito': { es: 'Vaciar Carrito', en: 'Empty Cart' },
  'carrito.cantidad': { es: 'Cantidad', en: 'Quantity' },
  'carrito.subtotal': { es: 'Subtotal', en: 'Subtotal' },
  'carrito.impuestos': { es: 'Impuestos (10%)', en: 'Taxes (10%)' },
  'carrito.envio': { es: 'Envío', en: 'Shipping' },
  'carrito.gratis': { es: 'Gratis', en: 'Free' },
  'carrito.total': { es: 'Total a Pagar', en: 'Total to Pay' },
  'carrito.procederPago': { es: 'Proceder al Pago', en: 'Proceed to Payment' },
  'carrito.continuarComprando': { es: 'Continuar Comprando', en: 'Continue Shopping' },
  'carrito.resumenPedido': { es: 'Resumen del Pedido', en: 'Order Summary' },
  'carrito.pagoSeguro': { es: 'Pago Seguro', en: 'Secure Payment' },
  'carrito.metodosSeguro': { es: 'Todos los métodos de pago son seguros y están protegidos', en: 'All payment methods are secure and protected' },

  // Login
  'login.titulo': { es: 'BarrasoBurger', en: 'BarrasoBurger' },
  'login.bienvenido': { es: 'Bienvenido de vuelta', en: 'Welcome back' },
  'login.crearCuenta': { es: 'Crea tu cuenta y únete a la familia', en: 'Create your account and join the family' },
  'login.iniciarSesion': { es: 'Iniciar Sesión', en: 'Sign In' },
  'login.registrarse': { es: 'Registrarse', en: 'Sign Up' },
  'login.usuario': { es: 'Usuario', en: 'Username' },
  'login.contraseña': { es: 'Contraseña', en: 'Password' },
  'login.nombre': { es: 'Nombre', en: 'Name' },
  'login.primerApellido': { es: 'Primer Apellido', en: 'First Surname' },
  'login.segundoApellido': { es: 'Segundo Apellido', en: 'Second Surname' },
  'login.email': { es: 'Email', en: 'Email' },
  'login.telefono': { es: 'Teléfono', en: 'Phone' },
  'login.dni': { es: 'DNI (Opcional)', en: 'ID (Optional)' },
  'login.confirmarPassword': { es: 'Confirmar Contraseña', en: 'Confirm Password' },
  'login.crearCuentaBtn': { es: 'Crear Cuenta', en: 'Create Account' },
  'login.continuarSinCuenta': { es: 'Continuar sin cuenta', en: 'Continue without account' },
  'login.informacionPersonal': { es: 'Información Personal', en: 'Personal Information' },
  'login.datosAcceso': { es: 'Datos de Acceso', en: 'Access Data' },
  'login.informacionContacto': { es: 'Información de Contacto', en: 'Contact Information' },
  'login.seguridad': { es: 'Seguridad', en: 'Security' },
  'login.cuentasPrueba': { es: 'Cuentas de Prueba - Click para Iniciar Sesión', en: 'Test Accounts - Click to Sign In' },
  'login.administrador': { es: 'Administrador', en: 'Administrator' },
  'login.empleado': { es: 'Empleado', en: 'Employee' },
  'login.cliente': { es: 'Cliente', en: 'Customer' },
  'login.accesoCompleto': { es: 'Acceso completo', en: 'Full access' },
  'login.gestionOperativa': { es: 'Gestión operativa', en: 'Operations management' },
  'login.clickTarjeta': { es: 'Haz click en cualquier tarjeta para iniciar sesión automáticamente', en: 'Click on any card to sign in automatically' },

  // Reservas
  'reservas.titulo': { es: 'Reserva tu Mesa', en: 'Book Your Table' },
  'reservas.subtitulo': { es: 'Asegura tu lugar en BarrasoBurger y disfruta de una experiencia gastronómica única', en: 'Secure your place at BarrasoBurger and enjoy a unique dining experience' },
  'reservas.informacionRestaurante': { es: 'Información del Restaurante', en: 'Restaurant Information' },
  'reservas.horariosAtencion': { es: 'Horarios de Atención', en: 'Opening Hours' },
  'reservas.ubicacion': { es: 'Ubicación', en: 'Location' },
  'reservas.politicasReserva': { es: 'Políticas de Reserva', en: 'Reservation Policies' },
  'reservas.formularioReserva': { es: 'Formulario de Reserva', en: 'Reservation Form' },
  'reservas.nombre': { es: 'Nombre', en: 'Name' },
  'reservas.primerApellido': { es: 'Primer Apellido', en: 'First Surname' },
  'reservas.segundoApellido': { es: 'Segundo Apellido', en: 'Second Surname' },
  'reservas.dni': { es: 'DNI (Opcional)', en: 'ID (Optional)' },
  'reservas.telefono': { es: 'Teléfono', en: 'Phone' },
  'reservas.email': { es: 'Email', en: 'Email' },
  'reservas.fecha': { es: 'Fecha', en: 'Date' },
  'reservas.hora': { es: 'Hora', en: 'Time' },
  'reservas.numeroPersonas': { es: 'Número de Personas', en: 'Number of People' },
  'reservas.comentarios': { es: 'Comentarios Adicionales', en: 'Additional Comments' },
  'reservas.enviarReserva': { es: 'Enviar Reserva', en: 'Send Reservation' },
  'reservas.reservaEnviada': { es: 'Reserva Enviada ✓', en: 'Reservation Sent ✓' },

  // Lealtad
  'lealtad.titulo': { es: 'Programa de Lealtad', en: 'Loyalty Program' },
  'lealtad.subtitulo': { es: 'Únete a nuestro programa y disfruta de beneficios exclusivos con cada visita', en: 'Join our program and enjoy exclusive benefits with every visit' },
  'lealtad.comoFunciona': { es: '¿Cómo Funciona?', en: 'How Does It Work?' },
  'lealtad.registrate': { es: 'Regístrate', en: 'Sign Up' },
  'lealtad.registrateDesc': { es: 'Únete gratis a nuestro programa de lealtad', en: 'Join our loyalty program for free' },
  'lealtad.acumulaPuntos': { es: 'Acumula Puntos', en: 'Earn Points' },
  'lealtad.acumulaDesc': { es: 'Gana puntos con cada compra que realices', en: 'Earn points with every purchase you make' },
  'lealtad.canjeaPremios': { es: 'Canjea Premios', en: 'Redeem Rewards' },
  'lealtad.canjearDesc': { es: 'Usa tus puntos para obtener beneficios increíbles', en: 'Use your points to get amazing benefits' },
  'lealtad.bienvenido': { es: 'Bienvenido', en: 'Welcome' },
  'lealtad.puntosDisponibles': { es: 'Puntos Disponibles', en: 'Available Points' },
  'lealtad.progresoHamburguesa': { es: 'Progreso hacia Hamburguesa Gratis', en: 'Progress towards Free Burger' },
  'lealtad.puntos': { es: 'puntos', en: 'points' },
  'lealtad.comoGanarPuntos': { es: '¿Cómo ganar puntos?', en: 'How to earn points?' },
  'lealtad.puntoPorEuro': { es: '1 punto por cada €1 gastado en pedidos', en: '1 point for every €1 spent on orders' },
  'lealtad.puntosAutomaticos': { es: 'Puntos se agregan automáticamente después del pago', en: 'Points are added automatically after payment' },
  'lealtad.revisaHistorial': { es: 'Revisa tu historial de puntos abajo', en: 'Check your points history below' },
  'lealtad.historialPuntos': { es: 'Historial de Puntos', en: 'Points History' },
  'lealtad.sinHistorial': { es: 'Aún no tienes historial de puntos', en: 'You don\'t have points history yet' },
  'lealtad.primerPedido': { es: '¡Haz tu primer pedido para empezar a ganar puntos!', en: 'Make your first order to start earning points!' },
  'lealtad.pedidosRealizados': { es: 'Pedidos Realizados', en: 'Orders Made' },
  'lealtad.totalGastado': { es: 'Total Gastado', en: 'Total Spent' },
  'lealtad.verHistorialCompleto': { es: 'Ver Historial Completo de Pedidos', en: 'View Complete Order History' },
  'lealtad.beneficiosDisponibles': { es: 'Beneficios Disponibles', en: 'Available Benefits' },
  'lealtad.hamburguesaGratis': { es: 'Hamburguesa Gratis', en: 'Free Burger' },
  'lealtad.acompañamientoGratis': { es: 'Acompañamiento Gratis', en: 'Free Side' },
  'lealtad.bebidaGratis': { es: 'Bebida Gratis', en: 'Free Drink' },
  'lealtad.descuentoCumpleaños': { es: 'Descuento de Cumpleaños', en: 'Birthday Discount' },
  'lealtad.accesoVIP': { es: 'Acceso VIP', en: 'VIP Access' },
  'lealtad.comboEspecial': { es: 'Combo Especial', en: 'Special Combo' },
  'lealtad.canjear': { es: 'Canjear', en: 'Redeem' },
  'lealtad.necesitasPuntos': { es: 'Necesitas', en: 'You need' },
  'lealtad.puntosAdicionales': { es: 'puntos más', en: 'more points' },
  'lealtad.gratisCumpleaños': { es: 'Gratis en tu cumpleaños', en: 'Free on your birthday' },
  'lealtad.disponibleCumpleaños': { es: 'Disponible en tu cumpleaños', en: 'Available on your birthday' },

  // Mi Cuenta
  'miCuenta.titulo': { es: 'Mi Cuenta', en: 'My Account' },
  'miCuenta.bienvenido': { es: 'Bienvenido', en: 'Welcome' },
  'miCuenta.clienteVIP': { es: 'Cliente VIP', en: 'VIP Customer' },
  'miCuenta.pedidos': { es: 'Pedidos', en: 'Orders' },
  'miCuenta.gastado': { es: 'Gastado', en: 'Spent' },
  'miCuenta.promedio': { es: 'Promedio', en: 'Average' },
  'miCuenta.favorito': { es: 'Favorito', en: 'Favorite' },
  'miCuenta.puntosLealtad': { es: 'Puntos de Lealtad', en: 'Loyalty Points' },
  'miCuenta.proximoBeneficio': { es: 'Próximo beneficio', en: 'Next benefit' },
  'miCuenta.hamburguesaGratis': { es: 'Hamburguesa Gratis', en: 'Free Burger' },
  'miCuenta.puntosHacia': { es: 'pts más', en: 'pts more' },
  'miCuenta.haciaHamburguesa': { es: '% hacia hamburguesa gratis', en: '% towards free burger' },
  'miCuenta.hacerNuevoPedido': { es: 'Hacer Nuevo Pedido', en: 'Make New Order' },
  'miCuenta.exploraMenu': { es: 'Explora nuestro menú y personaliza tu hamburguesa', en: 'Explore our menu and customize your burger' },
  'miCuenta.canjearPuntos': { es: 'Canjear Puntos', en: 'Redeem Points' },
  'miCuenta.usaPuntos': { es: 'Usa tus', en: 'Use your' },
  'miCuenta.obtenerBeneficios': { es: 'puntos para obtener beneficios', en: 'points to get benefits' },
  'miCuenta.reservarMesa': { es: 'Reservar Mesa', en: 'Book Table' },
  'miCuenta.aseguraLugar': { es: 'Asegura tu lugar para una experiencia especial', en: 'Secure your place for a special experience' },
  'miCuenta.editarPerfil': { es: 'Editar Perfil', en: 'Edit Profile' },
  'miCuenta.actualizaDatos': { es: 'Actualiza tus datos personales y de domicilio', en: 'Update your personal and address data' },
  'miCuenta.historialPedidos': { es: 'Historial de Pedidos', en: 'Order History' },
  'miCuenta.revisaPedidos': { es: 'Revisa todos los pedidos que has realizado y los puntos que has ganado', en: 'Review all the orders you\'ve made and the points you\'ve earned' },
  'miCuenta.actualizar': { es: 'Actualizar', en: 'Update' },
  'miCuenta.todos': { es: 'Todos', en: 'All' },
  'miCuenta.enPreparacion': { es: 'En Preparación', en: 'In Preparation' },
  'miCuenta.entregados': { es: 'Entregados', en: 'Delivered' },
  'miCuenta.completados': { es: 'Completados', en: 'Completed' },
  'miCuenta.sinPedidos': { es: 'Aún no has realizado pedidos', en: 'You haven\'t made any orders yet' },
  'miCuenta.noPedidosFiltro': { es: 'No hay pedidos', en: 'No orders' },
  'miCuenta.primerPedido': { es: '¡Haz tu primer pedido y comienza a ganar puntos!', en: 'Make your first order and start earning points!' },
  'miCuenta.pruebaFiltro': { es: 'Prueba con otro filtro o haz un nuevo pedido', en: 'Try another filter or make a new order' },
  'miCuenta.pedido': { es: 'Pedido', en: 'Order' },
  'miCuenta.personalizada': { es: '(Personalizada)', en: '(Customized)' },
  'miCuenta.productos': { es: 'productos', en: 'products' },
  'miCuenta.puntosGanados': { es: 'pts ganados', en: 'pts earned' },
  'miCuenta.productosPedido': { es: 'Productos del Pedido', en: 'Order Products' },
  'miCuenta.cantidad': { es: 'Cantidad', en: 'Quantity' },
  'miCuenta.precioUnitario': { es: 'Precio unitario', en: 'Unit price' },
  'miCuenta.tiempoEstimado': { es: 'Tiempo Estimado', en: 'Estimated Time' },
  'miCuenta.minutos': { es: '45-60 minutos', en: '45-60 minutes' },
  'miCuenta.envio': { es: 'Envío', en: 'Shipping' },
  'miCuenta.gratis': { es: 'Gratis', en: 'Free' },
  'miCuenta.repetirPedido': { es: 'Repetir Pedido', en: 'Repeat Order' },
  'miCuenta.dejarReseña': { es: 'Dejar Reseña', en: 'Leave Review' },
  'miCuenta.idPedido': { es: 'ID del pedido', en: 'Order ID' },
  'miCuenta.totalHistorico': { es: 'Total de Pedidos Históricos', en: 'Total Historical Orders' },
  'miCuenta.totalGastadoHistorico': { es: 'Total Gastado Histórico', en: 'Total Historical Spent' },
  'miCuenta.totalPuntosGanados': { es: 'Total de Puntos Ganados', en: 'Total Points Earned' },
  'miCuenta.productoFavorito': { es: 'Tu Producto Favorito', en: 'Your Favorite Product' },
  'miCuenta.hasPedido': { es: 'Has pedido este producto', en: 'You have ordered this product' },
  'miCuenta.veces': { es: 'veces', en: 'times' },
  'miCuenta.pedirDeNuevo': { es: 'Pedir de Nuevo', en: 'Order Again' },

  // Perfil
  'perfil.titulo': { es: 'Mi Perfil', en: 'My Profile' },
  'perfil.subtitulo': { es: 'Gestiona tu información personal, datos de domicilio y preferencias para una experiencia personalizada', en: 'Manage your personal information, address data and preferences for a personalized experience' },
  'perfil.configuracion': { es: 'Configuración', en: 'Configuration' },
  'perfil.miembroDesde': { es: 'Miembro desde', en: 'Member since' },
  'perfil.volverMiCuenta': { es: 'Volver a Mi Cuenta', en: 'Back to My Account' },
  'perfil.datosPersonales': { es: 'Datos Personales', en: 'Personal Data' },
  'perfil.domicilio': { es: 'Domicilio', en: 'Address' },
  'perfil.preferencias': { es: 'Preferencias', en: 'Preferences' },
  'perfil.informacionPersonal': { es: 'Información Personal', en: 'Personal Information' },
  'perfil.informacionDomicilio': { es: 'Información de Domicilio', en: 'Address Information' },
  'perfil.preferenciasConfiguracion': { es: 'Preferencias y Configuración', en: 'Preferences and Configuration' },

  // Pago
  'pago.titulo': { es: 'Finalizar Pedido', en: 'Complete Order' },
  'pago.subtitulo': { es: 'Completa tu información para procesar el pago', en: 'Complete your information to process payment' },
  'pago.volverCarrito': { es: 'Volver al Carrito', en: 'Back to Cart' },
  'pago.pedidoConfirmado': { es: '¡Pedido Confirmado!', en: 'Order Confirmed!' },
  'pago.pedidoProcesado': { es: 'Tu pedido ha sido procesado exitosamente. Te contactaremos pronto para confirmar la entrega.', en: 'Your order has been processed successfully. We will contact you soon to confirm delivery.' },
  'pago.numeroPedido': { es: 'Número de pedido', en: 'Order number' },
  'pago.emailConfirmacion': { es: 'Recibirás un email de confirmación en breve', en: 'You will receive a confirmation email shortly' },
  'pago.puntosGanados': { es: '¡Has ganado', en: 'You have earned' },
  'pago.puntosLealtad': { es: 'puntos de lealtad!', en: 'loyalty points!' },
  'pago.puntosTotales': { es: 'Puntos totales', en: 'Total points' },
  'pago.volverInicio': { es: 'Volver al Inicio', en: 'Back to Home' },
  'pago.informacionPago': { es: 'Información de Pago', en: 'Payment Information' },
  'pago.seleccionaMetodo': { es: 'Selecciona tu Método de Pago', en: 'Select Your Payment Method' },
  'pago.pagarBizum': { es: 'Pagar con Bizum', en: 'Pay with Bizum' },
  'pago.pagoInstantaneo': { es: 'Pago instantáneo', en: 'Instant payment' },
  'pago.transferenciaBancaria': { es: 'Transferencia Bancaria', en: 'Bank Transfer' },
  'pago.abrirAppBancaria': { es: 'Abrir app bancaria', en: 'Open banking app' },
  'pago.pagarPayPal': { es: 'Pagar con PayPal', en: 'Pay with PayPal' },
  'pago.pagoSeguro': { es: 'Pago seguro', en: 'Secure payment' },
  'pago.pago100Seguro': { es: 'Pago 100% Seguro', en: '100% Secure Payment' },
  'pago.abrirAplicacion': { es: 'Al hacer click, se abrirá tu aplicación de pago', en: 'By clicking, your payment app will open' },
  'pago.datosAutomaticos': { es: 'Los datos se rellenan automáticamente', en: 'Data is filled automatically' },
  'pago.confirmaApp': { es: 'Solo confirma el pago en tu aplicación', en: 'Just confirm the payment in your app' },
  'pago.confirmacionInmediata': { es: 'Recibirás confirmación inmediata', en: 'You will receive immediate confirmation' },

  // Admin
  'admin.titulo': { es: 'Panel de Administración', en: 'Administration Panel' },
  'admin.bienvenido': { es: 'Bienvenido', en: 'Welcome' },
  'admin.administrador': { es: 'Administrador', en: 'Administrator' },
  'admin.ingresosTotales': { es: 'Ingresos Totales', en: 'Total Revenue' },
  'admin.promedioPedido': { es: 'Promedio por pedido', en: 'Average per order' },
  'admin.usuarios': { es: 'Usuarios', en: 'Users' },
  'admin.clientes': { es: 'Clientes', en: 'Customers' },
  'admin.pedidos': { es: 'Pedidos', en: 'Orders' },
  'admin.puntos': { es: 'Puntos', en: 'Points' },
  'admin.gestionarUsuarios': { es: 'Gestionar Usuarios', en: 'Manage Users' },
  'admin.verClientes': { es: 'Ver Clientes', en: 'View Customers' },
  'admin.verPedidos': { es: 'Ver Pedidos', en: 'View Orders' },
  'admin.estadisticas': { es: 'Estadísticas', en: 'Statistics' },
  'admin.estadisticasGenerales': { es: 'Estadísticas Generales', en: 'General Statistics' },
  'admin.totalUsuarios': { es: 'Total Usuarios', en: 'Total Users' },
  'admin.clientesRegistrados': { es: 'Clientes Registrados', en: 'Registered Customers' },
  'admin.pedidosRealizados': { es: 'Pedidos Realizados', en: 'Orders Made' },
  'admin.puntosDistribuidos': { es: 'Puntos Distribuidos', en: 'Points Distributed' },
  'admin.gestionUsuarios': { es: 'Gestión de Usuarios', en: 'User Management' },
  'admin.gestionClientes': { es: 'Gestión de Clientes', en: 'Customer Management' },
  'admin.historialPedidos': { es: 'Historial de Pedidos', en: 'Order History' },

  // Productos del menú
  'productos.barrasoClasica': { es: 'BarrasoBurger Clásica', en: 'Classic BarrasoBurger' },
  'productos.baconDeluxe': { es: 'Bacon Deluxe', en: 'Bacon Deluxe' },
  'productos.aguacateRanch': { es: 'Aguacate Ranch', en: 'Avocado Ranch' },
  'productos.bbqEspecial': { es: 'BBQ Especial', en: 'BBQ Special' },
  'productos.vegetarianaSuprema': { es: 'Vegetariana Suprema', en: 'Supreme Vegetarian' },
  'productos.picanteJalapeno': { es: 'Picante Jalapeño', en: 'Spicy Jalapeño' },
  'productos.papasFritas': { es: 'Papas Fritas Crujientes', en: 'Crispy French Fries' },
  'productos.arosCebolla': { es: 'Aros de Cebolla Dorados', en: 'Golden Onion Rings' },
  'productos.papasCamote': { es: 'Papas de Camote', en: 'Sweet Potato Fries' },
  'productos.nuggets': { es: 'Nuggets de Pollo', en: 'Chicken Nuggets' },
  'productos.ensaladaCesar': { es: 'Ensalada César', en: 'Caesar Salad' },
  'productos.palitosMozzarella': { es: 'Palitos de Mozzarella', en: 'Mozzarella Sticks' },
  'productos.cocaCola': { es: 'Coca-Cola', en: 'Coca-Cola' },
  'productos.sprite': { es: 'Sprite', en: 'Sprite' },
  'productos.teHelado': { es: 'Té Helado', en: 'Iced Tea' },
  'productos.malteadaVainilla': { es: 'Malteada de Vainilla', en: 'Vanilla Milkshake' },
  'productos.jugoNaranja': { es: 'Jugo de Naranja Natural', en: 'Fresh Orange Juice' },
  'productos.cafeAmericano': { es: 'Café Americano', en: 'American Coffee' },

  // Detalle producto
  'detalle.volverMenu': { es: 'Volver al Menú', en: 'Back to Menu' },
  'detalle.disponible': { es: 'Disponible', en: 'Available' },
  'detalle.reseñas': { es: 'reseñas', en: 'reviews' },
  'detalle.descripcion': { es: 'Descripción', en: 'Description' },
  'detalle.ingredientes': { es: 'Ingredientes', en: 'Ingredients' },
  'detalle.informacionAlergenos': { es: 'Información de Alérgenos', en: 'Allergen Information' },
  'detalle.contieneAlergenos': { es: 'Este producto contiene o puede contener:', en: 'This product contains or may contain:' },
  'detalle.puntoCoccion': { es: 'Punto de Cocción', en: 'Cooking Point' },
  'detalle.ingredientesBase': { es: 'Ingredientes Base', en: 'Base Ingredients' },
  'detalle.desmarcaIngredientes': { es: 'Desmarca los ingredientes que no desees en tu hamburguesa', en: 'Uncheck the ingredients you don\'t want in your burger' },
  'detalle.ingredientesExtra': { es: 'Ingredientes Extra', en: 'Extra Ingredients' },
  'detalle.eligeAcompañamiento': { es: 'Elige tu Acompañamiento', en: 'Choose Your Side' },
  'detalle.eligeBebida': { es: 'Elige tu Bebida', en: 'Choose Your Drink' },
  'detalle.completaCombo': { es: 'Completa tu combo con una deliciosa bebida', en: 'Complete your combo with a delicious drink' },
  'detalle.sinBebida': { es: 'Sin Bebida', en: 'No Drink' },
  'detalle.agregarCarrito': { es: 'Agregar al Carrito', en: 'Add to Cart' },
  'detalle.resumenCombo': { es: 'Resumen de tu Combo', en: 'Your Combo Summary' },
  'detalle.puntoCoccionLabel': { es: 'Punto de cocción', en: 'Cooking point' },
  'detalle.acompañamientoLabel': { es: 'Acompañamiento', en: 'Side' },
  'detalle.bebidaLabel': { es: 'Bebida', en: 'Drink' },
  'detalle.extras': { es: 'Extras', en: 'Extras' },
  'detalle.sin': { es: 'Sin', en: 'Without' },
  'detalle.precioBase': { es: 'Precio base', en: 'Base price' },
  'detalle.verCarrito': { es: 'Ver Carrito', en: 'View Cart' },
  'detalle.tambienInteresar': { es: 'También te puede interesar', en: 'You might also like' },
  'detalle.verMasProductos': { es: 'Ver más productos', en: 'View more products' },
  'detalle.agregadoCarrito': { es: '¡Agregado al carrito!', en: 'Added to cart!' },
  'detalle.personalizacionesSeleccionadas': { es: 'Con tus personalizaciones seleccionadas', en: 'With your selected customizations' },
  'detalle.informacionNutricional': { es: 'Información Nutricional', en: 'Nutritional Information' },
  'detalle.calorias': { es: 'Calorías', en: 'Calories' },
  'detalle.tiempo': { es: 'Tiempo', en: 'Time' },
  'detalle.incluido': { es: 'Incluido', en: 'Included' },

  // Puntos de cocción
  'coccion.pocoHecho': { es: 'Poco Hecho', en: 'Rare' },
  'coccion.alPunto': { es: 'Al Punto', en: 'Medium' },
  'coccion.muyHecho': { es: 'Muy Hecho', en: 'Well Done' },
  'coccion.pocoDesc': { es: 'Jugoso y rosado en el centro', en: 'Juicy and pink in the center' },
  'coccion.medioDesc': { es: 'Equilibrio perfecto entre jugoso y cocido', en: 'Perfect balance between juicy and cooked' },
  'coccion.bienDesc': { es: 'Completamente cocido, sin rosado', en: 'Fully cooked, no pink' },

  // Común
  'comun.cargando': { es: 'Cargando...', en: 'Loading...' },
  'comun.guardar': { es: 'Guardar', en: 'Save' },
  'comun.cancelar': { es: 'Cancelar', en: 'Cancel' },
  'comun.editar': { es: 'Editar', en: 'Edit' },
  'comun.eliminar': { es: 'Eliminar', en: 'Delete' },
  'comun.actualizar': { es: 'Actualizar', en: 'Update' },
  'comun.volver': { es: 'Volver', en: 'Back' },
  'comun.continuar': { es: 'Continuar', en: 'Continue' },
  'comun.confirmar': { es: 'Confirmar', en: 'Confirm' },
  'comun.opcional': { es: 'Opcional', en: 'Optional' },
  'comun.obligatorio': { es: 'Obligatorio', en: 'Required' },
  'comun.noEspecificado': { es: 'No especificado', en: 'Not specified' },
  'comun.noEspecificada': { es: 'No especificada', en: 'Not specified' },
  'comun.guardando': { es: 'Guardando...', en: 'Saving...' },
  'comun.registrando': { es: 'Registrando...', en: 'Registering...' },
  'comun.iniciandoSesion': { es: 'Iniciando sesión...', en: 'Signing in...' },
  'comun.procesando': { es: 'Procesando...', en: 'Processing...' },
  'comun.hoy': { es: 'Hoy', en: 'Today' },
  'comun.ayer': { es: 'Ayer', en: 'Yesterday' },
  'comun.hace': { es: 'Hace', en: 'ago' },
  'comun.dias': { es: 'días', en: 'days' },
  'comun.semanas': { es: 'semanas', en: 'weeks' },
  'comun.meses': { es: 'meses', en: 'months' },

  // Inicio
  'inicio.listoSabor': { es: '¿Listo para más sabor?', en: 'Ready for more flavor?' },
  'inicio.exploraMenu': { es: 'Explora nuestro menú completo con hamburguesas, acompañamientos y bebidas', en: 'Explore our complete menu with burgers, sides and drinks' },
  'inicio.verMenuCompleto': { es: 'Ver Menú Completo', en: 'View Complete Menu' },
};

// Interfaz para el contexto de idioma
interface ContextoIdioma {
  idiomaActual: Idioma;
  cambiarIdioma: (nuevoIdioma: Idioma) => void;
  t: (clave: string) => string;
}

// Crear el contexto
const ContextoIdioma = createContext<ContextoIdioma | undefined>(undefined);

// Proveedor del contexto de idioma
export function ProveedorIdioma({ children }: { children: React.ReactNode }) {
  // Estado para el idioma actual
  const [idiomaActual, setIdiomaActual] = useState<Idioma>('es');

  // Verificar si hay un idioma guardado al cargar la aplicación
  useEffect(() => {
    const idiomaGuardado = localStorage.getItem('idioma_barraso_burger') as Idioma;
    if (idiomaGuardado && (idiomaGuardado === 'es' || idiomaGuardado === 'en')) {
      setIdiomaActual(idiomaGuardado);
    }
  }, []);

  // Función para cambiar idioma
  const cambiarIdioma = (nuevoIdioma: Idioma) => {
    setIdiomaActual(nuevoIdioma);
    localStorage.setItem('idioma_barraso_burger', nuevoIdioma);
  };

  // Función para traducir (t = translate)
  const t = (clave: string): string => {
    const traduccion = traducciones[clave];
    if (traduccion) {
      return traduccion[idiomaActual];
    }
    // Si no encuentra la traducción, devolver la clave
    console.warn(`Traducción no encontrada para: ${clave}`);
    return clave;
  };

  const valor: ContextoIdioma = {
    idiomaActual,
    cambiarIdioma,
    t
  };

  return (
    <ContextoIdioma.Provider value={valor}>
      {children}
    </ContextoIdioma.Provider>
  );
}

// Hook para usar el contexto de idioma
export function useIdioma() {
  const contexto = useContext(ContextoIdioma);
  if (contexto === undefined) {
    throw new Error('useIdioma debe ser usado dentro de un ProveedorIdioma');
  }
  return contexto;
}
