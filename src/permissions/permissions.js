export function normalizeRole(role) {
  return role === 'director' ? 'administrador' : role
}

export const PERMISSIONS = {
  administrador: [
    'dashboard:ver',
    'user_int:ver',
    'asistencia:ver',
    'rematricula:ver',
  ],
  entrenador: [
    'dashboard:ver',
    'user_int:ver',
    'asistencia:ver',
  ],
  cliente: [
    'dashboard_client:ver',
    'matricula:ver',
  ],
}

export function rolePermissions(role) {
  const r = normalizeRole(role)
  return PERMISSIONS[r] || []
}

export function can(user, permission) {
  const role = user?.role
  if (!role) return false
  return rolePermissions(role).includes(permission)
}

export function canAny(user, permissions) {
  return permissions.some((p) => can(user, p))
}
