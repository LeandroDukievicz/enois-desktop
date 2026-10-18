export type PermissionDecision = 'allow' | 'ask' | 'deny'

export function permissionDecision(
  permission: string,
  trusted: boolean,
  notifications: boolean,
): PermissionDecision {
  if (!trusted) return 'deny'
  if (permission === 'notifications') return notifications ? 'allow' : 'deny'
  if (['fullscreen', 'clipboard-sanitized-write'].includes(permission)) return 'allow'
  if (['media', 'clipboard-read', 'geolocation'].includes(permission)) return 'ask'
  return 'deny'
}
