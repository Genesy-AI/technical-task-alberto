import { ProviderId } from './types'
import { providerConfig } from './config'

const lastCallAt = new Map<ProviderId, number>()

export class RetryableProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryAfterMs?: number
  ) {
    super(message)
    this.name = 'RetryableProviderError'
  }
}

export class ProviderHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'ProviderHttpError'
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) {
    return undefined
  }

  const asSeconds = Number(header)
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return asSeconds * 1000
  }

  const asDate = Date.parse(header)
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - Date.now())
  }

  return undefined
}

export async function respectRateLimit(providerId: ProviderId): Promise<void> {
  const maxRps = providerConfig[providerId].maxRps
  if (!maxRps || maxRps <= 0) {
    return
  }

  const minIntervalMs = 1000 / maxRps
  const last = lastCallAt.get(providerId) ?? 0
  const waitMs = last + minIntervalMs - Date.now()
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  lastCallAt.set(providerId, Date.now())
}

export async function providerPost(options: {
  providerId: ProviderId
  url: string
  headers?: Record<string, string>
  body: unknown
}): Promise<unknown> {
  await respectRateLimit(options.providerId)

  const response = await fetch(options.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(options.body),
  })

  if (response.status === 429 || response.status === 503) {
    throw new RetryableProviderError(
      `Provider ${options.providerId} returned ${response.status}`,
      response.status,
      parseRetryAfter(response.headers.get('retry-after'))
    )
  }

  if (!response.ok) {
    const message = `Provider ${options.providerId} returned ${response.status}`
    if (response.status >= 500 || response.status === 408) {
      throw new RetryableProviderError(message, response.status)
    }
    throw new ProviderHttpError(message, response.status)
  }

  return response.json()
}
