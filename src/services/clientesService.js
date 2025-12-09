const API_BASE = import.meta.env.VITE_API_BASE

const getToken = () =>
  localStorage.getItem("access") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token")

const mapCliente = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  tipoDocumento: u.tipoDocumento,
  numeroDocumento: u.numeroDocumento,
  email: u.email,
  telefono: u.telefono,
  estado: u.estado,
  fechaRegistro: u.fechaRegistro,
  cantidadMascotas: u.cantidadMascotas ?? 0,
})

export const listarClientes = async () => {
  const token = getToken()
  if (!token) throw new Error("No hay sesión iniciada")

  const url = `${API_BASE}/clientes/listado-global/`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("Error listarClientes:", err)
    throw new Error("Error consultando clientes")
  }

  const data = await res.json()
  return Array.isArray(data) ? data.map(mapCliente) : []
}
