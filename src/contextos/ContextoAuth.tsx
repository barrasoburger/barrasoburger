import React, { createContext, useContext, useState, useEffect } from 'react';
import { baseDatos, Usuario, Cliente } from '../servicios/BaseDatos';

// Interfaz para el contexto de autenticación
interface ContextoAuth {
  usuarioActual: Usuario | null;
  clienteActual: Cliente | null;
  estaAutenticado: boolean;
  esAdmin: boolean;
  esEmpleado: boolean;
  esCliente: boolean;
  iniciarSesion: (username: string, password: string) => Promise<boolean>;
  cerrarSesion: () => void;
  registrarse: (username: string, password: string, nombreCompleto: string, telefono: string, email: string, dni?: string) => Promise<boolean>;
  actualizarDatosCliente: (datosActualizados: any) => void;
}

// Estado global simple para evitar problemas con hooks
let estadoGlobal = {
  usuarioActual: null as Usuario | null,
  clienteActual: null as Cliente | null
};

// Crear el contexto con valores por defecto
const AuthContext = createContext<ContextoAuth>({
  usuarioActual: null,
  clienteActual: null,
  estaAutenticado: false,
  esAdmin: false,
  esEmpleado: false,
  esCliente: false,
  iniciarSesion: async () => false,
  cerrarSesion: () => {},
  registrarse: async () => false,
  actualizarDatosCliente: () => {}
});

// Proveedor del contexto de autenticación
export function ProveedorAuth({ children }: { children: React.ReactNode }) {
  // Estado para el usuario actual
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [clienteActual, setClienteActual] = useState<Cliente | null>(null);

  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sesion_barraso_burger');
    console.log('Verificando sesión guardada:', sesionGuardada);
    
    if (sesionGuardada) {
      try {
        const datosUsuario = JSON.parse(sesionGuardada);
        console.log('Datos de usuario cargados:', datosUsuario);
        setUsuarioActual(datosUsuario);
        estadoGlobal.usuarioActual = datosUsuario;
        
        // Si es cliente, obtener datos del cliente
        if (datosUsuario.rol === 'cliente') {
          const cliente = baseDatos.obtenerClientePorUsuario(datosUsuario.id_usuario);
          console.log('Cliente cargado:', cliente);
          setClienteActual(cliente);
          estadoGlobal.clienteActual = cliente;
        }
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        localStorage.removeItem('sesion_barraso_burger');
      }
    } else {
      console.log('No hay sesión guardada');
    }
  }, []);

  // Función para iniciar sesión
  const iniciarSesion = async (username: string, password: string): Promise<boolean> => {
    try {
      const usuario = baseDatos.autenticarUsuario(username, password);
      
      if (usuario) {
        setUsuarioActual(usuario);
        estadoGlobal.usuarioActual = usuario;
        
        // Si es cliente, obtener datos del cliente
        if (usuario.rol === 'cliente') {
          const cliente = baseDatos.obtenerClientePorUsuario(usuario.id_usuario);
          setClienteActual(cliente);
          estadoGlobal.clienteActual = cliente;
        }
        
        // Guardar sesión en localStorage
        localStorage.setItem('sesion_barraso_burger', JSON.stringify(usuario));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    setUsuarioActual(null);
    setClienteActual(null);
    estadoGlobal.usuarioActual = null;
    estadoGlobal.clienteActual = null;
    localStorage.removeItem('sesion_barraso_burger');
  };

  // Función para registrarse
  const registrarse = async (
    username: string, 
    password: string, 
    nombreCompleto: string, 
    telefono: string, 
    email: string,
    dni?: string
  ): Promise<boolean> => {
    try {
      // Crear usuario
      const nuevoUsuario = baseDatos.registrarUsuario(username, password, 'cliente');
      
      if (nuevoUsuario) {
        // Crear cliente asociado con nombre completo
        const nuevoCliente = baseDatos.crearCliente(nuevoUsuario.id_usuario, nombreCompleto, telefono, email, dni);
        
        // Iniciar sesión automáticamente
        setUsuarioActual(nuevoUsuario);
        setClienteActual(nuevoCliente);
        estadoGlobal.usuarioActual = nuevoUsuario;
        estadoGlobal.clienteActual = nuevoCliente;
        
        // Guardar sesión
        localStorage.setItem('sesion_barraso_burger', JSON.stringify(nuevoUsuario));
        
        console.log('Usuario registrado exitosamente:', {
          usuario: nuevoUsuario,
          cliente: nuevoCliente
        });
        
        return true;
      }
      
      console.error('Error: No se pudo crear el usuario');
      return false;
    } catch (error) {
      console.error('Error al registrarse:', error);
      return false;
    }
  };

  // Función para actualizar datos del cliente actual
  const actualizarDatosCliente = (datosActualizados: any) => {
    if (clienteActual) {
      const clienteActualizado = { ...clienteActual, ...datosActualizados };
      setClienteActual(clienteActualizado);
      estadoGlobal.clienteActual = clienteActualizado;
    }
  };

  // Valores calculados
  const estaAutenticado = usuarioActual !== null;
  const esAdmin = usuarioActual?.rol === 'admin';
  const esEmpleado = usuarioActual?.rol === 'empleado';
  const esCliente = usuarioActual?.rol === 'cliente';

  const valor: ContextoAuth = {
    usuarioActual,
    clienteActual,
    estaAutenticado,
    esAdmin,
    esEmpleado,
    esCliente,
    iniciarSesion,
    cerrarSesion,
    registrarse,
    actualizarDatosCliente
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook simplificado para usar el contexto de autenticación
export function useAuth(): ContextoAuth {
  try {
    const contexto = useContext(AuthContext);
    return contexto;
  } catch (error) {
    console.error('Error en useAuth:', error);
    // Retornar valores por defecto si hay error
    return {
      usuarioActual: estadoGlobal.usuarioActual,
      clienteActual: estadoGlobal.clienteActual,
      estaAutenticado: estadoGlobal.usuarioActual !== null,
      esAdmin: estadoGlobal.usuarioActual?.rol === 'admin',
      esEmpleado: estadoGlobal.usuarioActual?.rol === 'empleado',
      esCliente: estadoGlobal.usuarioActual?.rol === 'cliente',
      iniciarSesion: async () => false,
      cerrarSesion: () => {},
      registrarse: async () => false,
      actualizarDatosCliente: () => {}
    };
  }
}
