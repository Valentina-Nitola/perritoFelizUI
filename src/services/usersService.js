// ----------------------------------------------
// src/services/usersService.js
// ----------------------------------------------
import { API_BASE } from './apiClient'
import { getAccessToken } from './authService'

// Util: arma querystring a partir de un objeto (omite valores vacíos)
function buildQuery(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      qs.set(k, v)
    }
  })
  const s = qs.toString()
  return s ? `?${s}` : ''
}

// Util: maneja respuesta y errores del backend
async function handleResponse(resp, defaultError = 'Error en la petición') {
  let data = null
  try {
    data = await resp.json()
  } catch (_) {
    // puede que el backend devuelva 204 o texto plano
  }

  if (!resp.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : null) ||
      resp.statusText ||
      defaultError
    const err = new Error(detail)
    err.status = resp.status
    err.payload = data
    throw err
  }

  return data
}

// ----------------------------------------------------
// Crear usuario interno (POST /usuarios-internos/)
// ----------------------------------------------------
export async function crearUsuarioInterno(datos) {
  const token = getAccessToken()
  if (!token) throw new Error('No hay token de acceso. Inicia sesión.')

  const resp = await fetch(`${API_BASE}/usuarios-internos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  })

  return handleResponse(resp, 'Error al crear usuario interno')
}

// -----------------------------------------------------------------------
// Listar usuarios internos (GET /usuarios-internos/)
// Filtros soportados (ajusta a tu backend si usa otros nombres):
//   - page: número de página (1-based)
//   - pageSize: cantidad por página
//   - q: búsqueda libre (nombre, apellidos, documento, email)
//   - role: DIRECTOR|ADMIN|ENTRENADOR
//   - from: fecha vinculación desde (YYYY-MM-DD)
//   - to: fecha vinculación hasta (YYYY-MM-DD)
// -----------------------------------------------------------------------
export async function listarUsuariosInternos(params = {}) {
  const token = getAccessToken()
  if (!token) throw new Error('No hay token de acceso. Inicia sesión.')

  // Si tu backend usa otros nombres (p. ej. page_size, search, role),
  // mapea aquí. Ejemplo:
  const mapped = {
    page: params.page,                 // o params.pageIndex
    page_size: params.pageSize,        // si tu API usa page_size
    q: params.q,
    role: params.role,                 // DIRECTOR|ADMIN|ENTRENADOR
    from: params.from,                 // YYYY-MM-DD
    to: params.to,                     // YYYY-MM-DD
  }

  const resp = await fetch(`${API_BASE}/usuarios-internos/${buildQuery(mapped)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Esperado: { items: [], total: number }
  // Si tu backend devuelve otro shape (por ejemplo {results, count}),
  // normalizamos aquí.
  const data = await handleResponse(resp, 'Error al listar usuarios internos')

  // Normalización opcional
  if (Array.isArray(data)) {
    // Si te devuelve solo un array, adaptamos a {items,total}
    return { items: data, total: data.length }
  }
  if ('results' in data && 'count' in data) {
    return { items: data.results, total: data.count }
  }
  // Por defecto asumimos { items, total }
  return { items: data.items ?? [], total: data.total ?? 0 }
}