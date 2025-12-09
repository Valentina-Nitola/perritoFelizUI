// 🔄 Cambia esto a false cuando quieras usar el backend real
const USAR_MOCK = true

// 🧪 Datos de ejemplo para ver el módulo funcionando visualmente
const MOCK_CLIENTES = [
  {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Pérez',
    tipoDocumento: 'CC',
    numeroDocumento: '1001234567',
    email: 'carlos.perez@example.com',
    telefono: '3001234567',
    estado: 'ACTIVO',
    fechaRegistro: '2025-11-01T10:30:00Z',
    cantidadMascotas: 2,
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'Gómez',
    tipoDocumento: 'CC',
    numeroDocumento: '1012345678',
    email: 'maria.gomez@example.com',
    telefono: '3012345678',
    estado: 'INACTIVO',
    fechaRegistro: '2025-10-15T15:00:00Z',
    cantidadMascotas: 1,
  },
  {
    id: 3,
    nombre: 'Andrés',
    apellido: 'López',
    tipoDocumento: 'CC',
    numeroDocumento: '1023456789',
    email: 'andres.lopez@example.com',
    telefono: '3023456789',
    estado: 'ACTIVO',
    fechaRegistro: '2025-09-20T09:15:00Z',
    cantidadMascotas: 3,
  },
  {
    id: 4,
    nombre: 'Luisa',
    apellido: 'Ramírez',
    tipoDocumento: 'CC',
    numeroDocumento: '1034567890',
    email: 'luisa.ramirez@example.com',
    telefono: '3034567890',
    estado: 'ACTIVO',
    fechaRegistro: '2025-12-01T12:00:00Z',
    cantidadMascotas: 1,
  },
  {
    id: 5,
    nombre: 'Juan',
    apellido: 'Martínez',
    tipoDocumento: 'CC',
    numeroDocumento: '1045678901',
    email: 'juan.martinez@example.com',
    telefono: '3045678901',
    estado: 'INACTIVO',
    fechaRegistro: '2025-08-05T18:45:00Z',
    cantidadMascotas: 0,
  },
]

// 👉 Esta función es la que ya estás usando en el componente
export const listarClientes = async (filtros = {}) => {
  if (USAR_MOCK) {
    // Simulamos un pequeño delay de red para que se vea más real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_CLIENTES)
      }, 600)
    })
  }

}
