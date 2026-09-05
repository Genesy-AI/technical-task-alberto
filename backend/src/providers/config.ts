import { ProviderId } from './types'

type ProviderConfig = {
  baseUrl: string
  apiKey: string
  /** Requests per second. `null` means unlimited until the vendor publishes a limit. */
  maxRps: number | null
}

function envOr(name: string, fallback: string): string {
  const value = process.env[name]
  return value && value.trim() ? value.trim() : fallback
}

function envNumberOrNull(name: string): number | null {
  const value = process.env[name]
  if (!value || !value.trim()) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const providerConfig: Record<ProviderId, ProviderConfig> = {
  orion: {
    baseUrl: envOr('ORION_BASE_URL', 'https://api.enginy.ai/api/tmp/orionConnect'),
    apiKey: envOr('ORION_API_KEY', 'mySecretKey123'),
    maxRps: envNumberOrNull('ORION_MAX_RPS'),
  },
  astra: {
    baseUrl: envOr('ASTRA_BASE_URL', 'https://api.enginy.ai/api/tmp/astraDialer'),
    apiKey: envOr('ASTRA_API_KEY', '1234jhgf'),
    maxRps: envNumberOrNull('ASTRA_MAX_RPS'),
  },
  nimbus: {
    // Spec uses "numbusLookup" (typo) for the path.
    baseUrl: envOr('NIMBUS_BASE_URL', 'https://api.enginy.ai/api/tmp/numbusLookup'),
    apiKey: envOr('NIMBUS_API_KEY', '000099998888'),
    maxRps: envNumberOrNull('NIMBUS_MAX_RPS'),
  },
}
