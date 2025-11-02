import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { normalizeRole } from '../permissions/permissions'

const AuthUserContext = createContext(null)

function deriveRole(raw) {
  if (!raw) return null
  const r =
    raw.role ||                          // "administrador"
    (raw.rol && (raw.rol.nombre || raw.rol)) ||  // { rol: { nombre: 'cliente' } } o "cliente"
    raw.tipo_usuario ||
    raw.perfil ||                        // "entrenador"
    raw.tipo ||                          // "director"
    null
  return r ? String(r).toLowerCase() : null
}

function normalizeUser(raw) {
  if (!raw) return null
  const base = typeof raw === 'string' ? JSON.parse(raw) : raw
  const roleRaw = deriveRole(base)
  const role = roleRaw ? normalizeRole(roleRaw) : null
  return role ? { ...base, role } : { ...base }
}

export const AuthUserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? normalizeUser(raw) : null
    } catch {
      return null
    }
  })

  // sincroniza cuando cambie en memoria
  useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user))
      else localStorage.removeItem('user')
    } catch {}
  }, [user])

  // sincroniza si otro tab modifica el storage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'user') {
        setUser(normalizeUser(e.newValue))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updateUser = (patch) => {
    setUser((prev) => normalizeUser({ ...(prev || {}), ...patch }))
  }

  const value = useMemo(() => ({ user, setUser, updateUser }), [user])
  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

export const useAuthUser = () => useContext(AuthUserContext)
