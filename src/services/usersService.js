// ----------------------------------------------
// src/services/usersService.js
// ----------------------------------------------
import { API_BASE } from './apiClient'
import { getAccessToken } from './authService'

// ----------------------------------------------
// Crear usuario interno
// ----------------------------------------------
export async function crearUsuarioInterno(datos) {
  const token = getAccessToken()

  const resp = await fetch(`${API_BASE}/usuarios-internos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  })

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    console.error('Error al crear usuario interno:', error)
    throw new Error(error.detail || 'Error al crear usuario interno')
  }

  return resp.json()
}
