import { API_BASE, USE_MOCKS, postJSON } from './apiClient'

// Mock helpers (solo para dev sin backend)
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms))
}


//=================FUNCIONES PARA login.js===============================================

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
  return postJSON(`${API_BASE}/auth/verify-recaptcha/`, { recaptchaToken: token })
}

async function realLogin(payload) {
  return postJSON(`${API_BASE}/auth/login`, payload)
}
//============================================================================




//==============FUNCIONES PARA register.js====================================

export const checkEmail = async (email) => {
  const response = await fetch(`${API_BASE}/check-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Error checking email");
  }

  const data = await response.json();
  return data; // { exists: true/false }
};
//----------------------------------------------

//----------------------------------------------
// 🔹 Verifica si el documento ya está registrado
//----------------------------------------------
export const checkDocumento = async (nroDoc) => {
  const response = await fetch(`${API_BASE}/check-documento/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nroDoc }),
  });

  if (!response.ok) {
    throw new Error("Error checking document");
  }

  const data = await response.json();
  return data; // { exists: true/false }
};
//----------------------------------------------

//----------------------------------------------
// 🔹 Registra un nuevo usuario
//----------------------------------------------
export const register = async (payload) => {
  const response = await fetch(`${API_BASE}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Error en el registro");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

//============================================================================


//----------------------------------------------
// API público del servicio
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
    if (USE_MOCKS) return mockCheckEmail(email)
    return checkEmail(email)
  },

  async checkDocumento(nroDoc) {
    if (USE_MOCKS) return mockCheckDocumento(nroDoc)
    return checkDocumento(nroDoc)
  },

  async register(payload) {
    if (USE_MOCKS) return mockRegister(payload)
    return register(payload)
  },
}
