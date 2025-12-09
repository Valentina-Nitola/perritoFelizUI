// src/services/reMatriculasService.js
// YA SIN MOCKS — usa el backend verdadero

const API_BASE = import.meta.env.VITE_API_BASE

// -------------------------------------------
// Obtener token del localStorage
// -------------------------------------------
const getToken = () =>
  localStorage.getItem('access') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token')

// -------------------------------------------
// Función para transformar la respuesta REAL
// -------------------------------------------
const mapMatricula = (m) => {
  return {
    id: m.id_matricula,
    idCanino: m.id_canino,

    // datos aplanados del serializer
    nombreCanino: m.nombre || '',
    raza: m.raza || '',
    tamano: m.talla || '',

    plan: m.plan || '',
    fechaInicio: m.fecha_inicio || '',
    fechaFin: m.fecha_fin || '',
    estado: m.estado || '',
  }
}


// -------------------------------------------
// LISTAR MATRÍCULAS desde /matriculas/listado-global/
// -------------------------------------------
export const listarMatriculas = async () => {
  const token = getToken()
  if (!token) throw new Error('No hay sesión iniciada.')

  const url = `${API_BASE}/matriculas/listado-global/`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Error listarMatriculas:', err)
    throw new Error('Error consultando matrículas')
  }

  const data = await res.json()

  // transformar todas las matrículas
  return Array.isArray(data) ? data.map(mapMatricula) : []
}

// -------------------------------------------
// ACTUALIZAR MATRÍCULA
// -------------------------------------------
export const actualizarMatricula = async (idMatricula, payload) => {
  const token = getToken()
  const url = `${API_BASE}/matriculas/${idMatricula}/`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Error actualizando matrícula')

  const data = await res.json()
  return mapMatricula(data)
}

// -------------------------------------------
// ELIMINAR MATRÍCULA
// -------------------------------------------
export const eliminarMatricula = async (idMatricula) => {
  const token = getToken()
  const url = `${API_BASE}/matriculas/${idMatricula}/`

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('Error eliminando matrícula')

  return { success: true }
}
