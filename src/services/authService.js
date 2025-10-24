import { API_BASE, USE_MOCKS, postJSON } from './apiClient'

// Mock helpers (solo para dev sin backend)
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

async function mockVerifyRecaptcha(token) {
  // Simula verificación: si hay token, es válido.
  await wait(600)
  if (!token) throw new Error('Captcha inválido (mock)')
  return { success: true }
}

async function mockLogin({ documento, password, recaptchaToken }) {
  await wait(800)
  if (!documento || !password) throw new Error('Credenciales incompletas (mock)')
  // Demo: documento 123 y password perrito
  if (documento !== '123' || password !== 'perrito') {
    throw new Error('Credenciales inválidas (mock)')
  }
  return { msg: 'Login exitoso (mock)', token: 'jwt-mock', user: { id: 1, name: 'Perrito' } }
}

// Servicios reales (para cuando haya backend)
async function realVerifyRecaptcha(token) {
  // Normalmente NO llamas a Google desde el front.
// En su lugar, envías el token a tu backend y allá verificas.
// Aquí quedará preparado por si decides exponer un endpoint.
  return postJSON('http://localhost:8000/api/auth/verify-recaptcha/', { recaptchaToken: token })
}

async function realLogin(payload) {
  return postJSON(`${API_BASE}/api/auth/login`, payload)
}

// API público del servicio
export const authService = {
  async verifyRecaptcha(token) {
    if (USE_MOCKS) return mockVerifyRecaptcha(token)
    return realVerifyRecaptcha(token)
  },
  async login(payload) {
    if (USE_MOCKS) return mockLogin(payload)
    return realLogin(payload)
  },
}
