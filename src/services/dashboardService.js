// ----------------------------------------------
// src/services/dashboardService.js
// ----------------------------------------------
import { API_BASE } from './apiClient'

const API_URL = `${API_BASE}/dashboard/cliente/`

export const dashboardService = {
  async getClientDashboard(token) {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Error al obtener el dashboard')
    return await res.json()
  },
}
