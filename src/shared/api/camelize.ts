export function camelize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelize)
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value)) {
      out[key.charAt(0).toLowerCase() + key.slice(1)] = camelize(nested)
    }
    return out
  }
  return value
}
