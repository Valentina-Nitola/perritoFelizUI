import { can } from './permissions/permissions'

function pass(user, item) {
  if (item.perm)  return can(user, item.perm)
  if (item.anyOf) return item.anyOf.some((p) => can(user, p))
  return true
}
function sanitize(item) {
  const { perm, anyOf, items, ...rest } = item
  if (items) rest.items = items.map(sanitize)
  return rest
}
export function navigationFor(user, items) {
  const walk = (arr) => arr.filter(i => pass(user, i)).map(i => i.items ? { ...i, items: walk(i.items) } : i)
  return walk(items).map(sanitize)
}
