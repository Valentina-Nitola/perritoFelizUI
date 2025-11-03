// ----------------------------------------------
// src/services/authService.js
// ----------------------------------------------
import { API_BASE, USE_MOCKS, postJSON } from './apiClient'

//----------------------------------------------
// Utilidades mock (solo para desarrollo sin backend)
//----------------------------------------------
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

//----------------------------------------------
// MOCKS (para modo sin backend)
//----------------------------------------------
async function mockVerifyRecaptcha(token) {
  await wait(600)
  if (!token) throw new Error('Captcha inválido (mock)')
  return { success: true }
}

async function mockLogin({ documento, password }) {
  await wait(800)
  if (documento !== '123' || password !== 'perrito') {
    throw new Error('Credenciales inválidas (mock)')
  }
  return { msg: 'Login exitoso (mock)', token: 'jwt-mock', user: { id: 1, name: 'Perrito' } }
}

//----------------------------------------------
// Login real sin JWT (legacy) — usado por clientes
//----------------------------------------------
async function realLogin(payload) {
  return postJSON(`${API_BASE}/login`, payload)
}

//----------------------------------------------
// ReCAPTCHA (si lo usas)
//----------------------------------------------
async function realVerifyRecaptcha(token) {
  return postJSON(`${API_BASE}/auth/verify-recaptcha/`, { recaptchaToken: token })
}

//----------------------------------------------
// Registro de cliente
//----------------------------------------------
export const checkEmail = async (email) => {
  const response = await fetch(`${API_BASE}/check-email/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!response.ok) throw new Error('Error checking email')
  return await response.json()
}

export const checkDocumento = async (nroDoc) => {
  const response = await fetch(`${API_BASE}/check-documento/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nroDoc }),
  })
  if (!response.ok) throw new Error('Error checking document')
  return await response.json()
}

export const register = async (payload) => {
  const response = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Error en el registro')
  return data
}

//----------------------------------------------
// Export principal
//----------------------------------------------
export const authService = {
  async verifyRecaptcha(token) {
    if (USE_MOCKS) return mockVerifyRecaptcha(token)
    return realVerifyRecaptcha(token)
  },

  async login(payload) {
    if (USE_MOCKS) return mockLogin(payload)
    return realLogin(payload)
  },

  async checkEmail(email) {
    return checkEmail(email)
  },

  async checkDocumento(nroDoc) {
    return checkDocumento(nroDoc)
  },

  async register(payload) {
    return register(payload)
  },
}

// ======================================================================
// NUEVO BLOQUE JWT (para usuarios internos o staff)
// ======================================================================

// 🔹 Login real con JWT (usa /api/token/)
export async function jwtLogin(documento, password) {
  const response = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documento, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('JWT Login error:', data)
    throw new Error(data.detail || 'Error al iniciar sesión')
  }

  // ✅ Guarda tokens en localStorage con nombres consistentes
  localStorage.setItem('access', data.access)
  localStorage.setItem('refresh', data.refresh)

  // ✅ Guarda también la info del usuario si viene del backend
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user))
    console.log('👤 Usuario guardado en localStorage:', data.user)
  }

  console.log('🟢 Tokens guardados:', data)
  return data
}

// 🔹 Cerrar sesión
export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
  console.log('🚪 Sesión cerrada correctamente.')
}

// 🔹 Obtener token actual
export function getAccessToken() {
  const token = localStorage.getItem('access')
  console.log('📦 getAccessToken ->', token)
  return token
}
