// ----------------------------------------------
// src/services/dashboardService.js
// ----------------------------------------------
import { API_BASE } from './apiClient'

const API_URL = `${API_BASE}/dashboard/`

export const dashboardService = {
  async getClientDashboard(token) {
    const res = await fetch(`${API_URL}cliente/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Error al obtener dashboard cliente')
    return await res.json()
  },

  async getAdminDashboard(token) {
    const res = await fetch(`${API_URL}admin/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Error al obtener dashboard admin')
    return await res.json()
  },
}
