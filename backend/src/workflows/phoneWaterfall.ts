export type ProviderId = 'orion' | 'astra' | 'nimbus'

export const PROVIDER_ORDER: ProviderId[] = ['orion', 'astra', 'nimbus']

export type PhoneWaterfallOutcome =
  | { status: 'found'; provider: ProviderId; phone: string }
  | { status: 'no_data' }
  | { status: 'failed' }

/**
 * Sequential provider waterfall. A null phone is a successful miss (try the next
 * provider). A thrown lookup is also skipped. If every provider throws, the
 * outcome is failed; if at least one returned null, the outcome is no_data.
 */
export async function runPhoneWaterfall(
  lookup: (provider: ProviderId) => Promise<string | null>
): Promise<PhoneWaterfallOutcome> {
  let anySuccess = false

  for (const provider of PROVIDER_ORDER) {
    try {
      const phone = await lookup(provider)
      anySuccess = true
      if (phone) {
        return { status: 'found', provider, phone }
      }
    } catch {
      // Provider failed after retries; continue the waterfall.
    }
  }

  return anySuccess ? { status: 'no_data' } : { status: 'failed' }
}
