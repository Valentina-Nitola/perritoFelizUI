// src/services/matriculasService.js
// ⚠️ IMPORTANTE:
// Este archivo está listo para que el backend conecte después.
// Por ahora usa datos MOCK para que el front funcione visualmente.

// Cuando el backend esté listo, descomentas el import de apiClient
// y las llamadas con axios que están como ejemplo.

// import apiClient from './apiClient' // <-- ejemplo, según tu proyecto

// ===== MOCKS TEMPORALES =====
const MOCK_MATRICULAS = [
  {
    id: 1,
    nombreCanino: 'Firulais',
    raza: 'Labrador',
    tamano: 'Grande',
    plan: 'Mensual',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-01',
    estado: 'Activo',
  },
  {
    id: 2,
    nombreCanino: 'Rocky',
    raza: 'Poodle',
    tamano: 'Pequeño',
    plan: 'Trimestral',
    fechaInicio: '2025-02-01',
    fechaFin: '2025-08-01',
    estado: 'Activo',
  },
  {
    id: 3,
    nombreCanino: 'Luna',
    raza: 'Pastor Alemán',
    tamano: 'Grande',
    plan: 'Anual',
    fechaInicio: '2025-01-15',
    fechaFin: '2026-01-15',
    estado: 'Vencido',
  },
]

// ===== SERVICIOS =====

// Listar matrículas
export const listarMatriculas = async () => {
  // Ejemplo REAL (cuando haya backend):
  // const response = await apiClient.get('/matriculas')
  // return response.data

  // MOCK mientras tanto:
  return Promise.resolve(MOCK_MATRICULAS)
}

// Actualizar matrícula
export const actualizarMatricula = async (idMatricula, data) => {
  // Ejemplo REAL:
  // const response = await apiClient.put(`/matriculas/${idMatricula}`, data)
  // return response.data

  console.log('Mock actualizar matrícula', idMatricula, data)
  // devolvemos lo que enviamos, con el id
  return Promise.resolve({ ...data, id: idMatricula })
}

// Eliminar / desactivar matrícula
export const eliminarMatricula = async (idMatricula) => {
  // Ejemplo REAL:
  // await apiClient.delete(`/matriculas/${idMatricula}`)

  console.log('Mock eliminar matrícula', idMatricula)
  return Promise.resolve({ success: true })
}
