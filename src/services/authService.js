// ----------------------------------------------
// src/services/authService.js (versión JWT completa con validaciones remotas)
// ----------------------------------------------
import { API_BASE } from './apiClient'

// ------------------------
// Helpers de storage
// ------------------------
const LS_KEYS = {
  access: 'access',
  refresh: 'refresh',
  user: 'user',
}

function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem(LS_KEYS.access, access)
  if (refresh) localStorage.setItem(LS_KEYS.refresh, refresh)
}

export function getAccessToken() {
  return localStorage.getItem(LS_KEYS.access)
}

export function getRefreshToken() {
  return localStorage.getItem(LS_KEYS.refresh)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.user) || 'null')
  } catch {
    return null
  }
}

export function setUser(user) {
  localStorage.setItem(LS_KEYS.user, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(LS_KEYS.access)
  localStorage.removeItem(LS_KEYS.refresh)
  localStorage.removeItem(LS_KEYS.user)
  console.log('🚪 Sesión cerrada.')
}

// ------------------------
// Llamados API base
// ------------------------
async function handleJson(resp, defaultMsg = 'Error en la petición') {
  let data = null
  try {
    data = await resp.json()
  } catch {
    /* 204 o sin contenido */
  }

  if (!resp.ok) {
    const msg =
      data?.detail || data?.message || data?.error || resp.statusText || defaultMsg
    const err = new Error(msg)
    err.status = resp.status
    err.payload = data
    throw err
  }
  return data
}

// 🔹 /me: devuelve perfil del usuario autenticado
export async function fetchMe() {
  const access = getAccessToken()
  if (!access) throw new Error('No hay token de acceso')
  const resp = await fetch(`${API_BASE}/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  })
  return handleJson(resp, 'Error al obtener el perfil')
}

// 🔹 /token: login JWT
export async function jwtLogin(documento, password) {
  const resp = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documento, password }),
  })
  const data = await handleJson(resp, 'Error al iniciar sesión')

  // Guarda tokens
  saveTokens({ access: data.access, refresh: data.refresh })

  // Guarda usuario si viene; si no, lo pedimos a /me
  let user = data.user || null
  if (!user) {
    try {
      user = await fetchMe()
    } catch (e) {
      console.warn('No llegó user en /token y falló /me:', e)
      throw e
    }
  }

  setUser(user)
  return { access: data.access, refresh: data.refresh, user }
}

// 🔹 /token/refresh: renueva access
export async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No hay refresh token')
  const resp = await fetch(`${API_BASE}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  const data = await handleJson(resp, 'No se pudo refrescar el token')
  if (!data?.access) throw new Error('Respuesta inválida de refresh')
  localStorage.setItem(LS_KEYS.access, data.access)
  return data.access
}

// 🔹 fetch autenticado con refresh automático
export async function authFetch(input, init = {}) {
  let access = getAccessToken()
  const withAuth = (tk) => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${tk}`,
    },
  })

  // 1️⃣ Intento con access actual
  let resp = await fetch(input, withAuth(access))

  // 2️⃣ Si expiró el access, intenta refrescar y reintenta una vez
  if (resp.status === 401) {
    try {
      access = await refreshAccessToken()
      resp = await fetch(input, withAuth(access))
    } catch (e) {
      logout()
      throw new Error('Sesión expirada. Inicia sesión nuevamente.')
    }
  }
  return resp
}

// 🔹 /auth/verify-recaptcha: verifica reCAPTCHA
export async function verifyRecaptcha(token) {
  const resp = await fetch(`${API_BASE}/auth/verify-recaptcha/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recaptchaToken: token }),
  })
  return handleJson(resp, 'Error verificando reCAPTCHA')
}

// 🔹 /auth/register/: registra un nuevo usuario
export async function register(userData) {
  const resp = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  return handleJson(resp, 'Error al registrar usuario')
}

// 🔹 Validaciones remotas: email y documento
export async function checkEmail(email) {
  const resp = await fetch(`${API_BASE}/check-email/?email=${encodeURIComponent(email)}`)
  if (!resp.ok) throw new Error('Error verificando correo.')
  return resp.json()
}

export async function checkDocumento(documento) {
  const resp = await fetch(`${API_BASE}/check-documento/?documento=${encodeURIComponent(documento)}`)
  if (!resp.ok) throw new Error('Error verificando documento.')
  return resp.json()
}

// ------------------------
// Export agrupado
// ------------------------
export const authService = {
  jwtLogin,
  refreshAccessToken,
  verifyRecaptcha,
  fetchMe,
  authFetch,
  logout,
  getAccessToken,
  getRefreshToken,
  getUser,
  setUser,
  register,
  checkEmail,       // ✅ agregado
  checkDocumento,   // ✅ agregado
}
