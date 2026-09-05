import { providerConfig } from './config'
import { providerPost } from './http'
import { companyWebsiteFromEmail, fullNameFromLead, normalizePhone } from './mapping'
import { LeadLookupInput, PhoneLookupResult, PhoneProvider } from './types'

export const orionConnect: PhoneProvider = {
  id: 'orion',
  async lookup(input: LeadLookupInput): Promise<PhoneLookupResult> {
    const data = (await providerPost({
      providerId: 'orion',
      url: providerConfig.orion.baseUrl,
      headers: { 'x-auth-me': providerConfig.orion.apiKey },
      body: {
        fullName: fullNameFromLead(input.firstName, input.lastName),
        companyWebsite: companyWebsiteFromEmail(input.email),
      },
    })) as { phone?: string | null }

    return { phone: normalizePhone(data?.phone) }
  },
}
