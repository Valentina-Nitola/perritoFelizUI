// ----------------------------------------------
// src/services/profileService.js
// ----------------------------------------------
import { API_BASE } from './apiClient'

const API_URL = `${API_BASE}/perfil/`;

export const profileService = {
  async getProfile(token) {
    console.log("🔍 Token que se envía:", token); // 👈 Añade esto
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("🔍 Respuesta del servidor:", res.status);
    if (!res.ok) throw new Error("Error al obtener el perfil");
    return await res.json();
  },

  async updateProfile(data, token) {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el perfil");
    return await res.json();
  },
};
