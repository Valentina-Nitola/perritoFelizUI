export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export async function postJSON(url, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const msg = data?.msg || 'Error en la solicitud'
    throw new Error(msg)
  }
  return data
}
