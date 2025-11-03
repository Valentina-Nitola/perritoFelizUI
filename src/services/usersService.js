// ----------------------------------------------
// src/services/usersService.js
// ----------------------------------------------
import { API_BASE } from './apiClient'
import { getAccessToken } from './authService'

// ======================================================
// Crear usuario interno (ADMIN, DIRECTOR, ENTRENADOR)
// ======================================================
export async function crearUsuarioInterno(datos) {
  // Obtener el token JWT almacenado por el login JWT
  const token = getAccessToken()
  console.log('📦 Token usado para crear interno:', token)

  // Validar que exista token
  if (!token) {
    throw new Error('No hay token de sesión. Inicia sesión nuevamente.')
  }

  // Enviar la solicitud al backend
  const resp = await fetch(`${API_BASE}/usuarios-internos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // 👈 Enviar token JWT
    },
    body: JSON.stringify(datos),
  })

  // Procesar respuesta
  const data = await resp.json().catch(() => ({}))

  if (!resp.ok) {
    console.error('❌ Error al crear usuario interno:', data)
    const msg =
      data.detail ||
      data.error ||
      (data.non_field_errors && data.non_field_errors[0]) ||
      'Error al crear usuario interno'
    throw new Error(msg)
  }

  console.log('✅ Usuario interno creado correctamente:', data)
  return data
}
