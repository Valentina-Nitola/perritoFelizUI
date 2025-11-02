import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthUser } from '../context/AuthUserContext'
import { canAny } from '../permissions/permissions'

const Guard = ({ meta = {}, children }) => {
  const { user } = useAuthUser()

  // Si no hay usuario en el contexto, intenta leer de localStorage
  const localUser =
    user || (JSON.parse(localStorage.getItem('user') || 'null'))

  // Si sigue sin haber usuario, redirige al login
  if (!localUser) {
    console.warn('🚫 Sin usuario autenticado, redirigiendo a login')
    return <Navigate to="/login" replace />
  }

  // Si la ruta no tiene restricciones, deja pasar
  if (!meta.anyOf) {
    return children
  }

  // Verifica permisos
  const hasPermission = canAny(localUser, meta.anyOf)

  if (!hasPermission) {
    console.warn('⛔ Acceso denegado para:', meta.anyOf)
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default Guard
