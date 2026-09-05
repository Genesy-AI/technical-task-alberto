export function sanitizeCountryCode(value: unknown): string | null {
  if (value == null) return null
  const normalized = String(value).trim().toUpperCase()
  if (!normalized) return null
  if (!/^[A-Z]{2}$/.test(normalized)) return null
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(normalized)
    return name ? normalized : null
  } catch {
    return null
  }
}
