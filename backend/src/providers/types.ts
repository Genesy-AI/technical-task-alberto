export type ProviderId = 'orion' | 'astra' | 'nimbus'

export type PhoneEnrichmentStatus =
  | 'idle'
  | 'pending'
  | ProviderId
  | 'found'
  | 'no_data'
  | 'failed'

export type LeadLookupInput = {
  firstName: string
  lastName: string
  email: string
  jobTitle: string | null
  companyName: string | null
}

export type PhoneLookupResult = {
  phone: string | null
}

export interface PhoneProvider {
  id: ProviderId
  lookup(input: LeadLookupInput): Promise<PhoneLookupResult>
}

export const PROVIDER_ORDER: ProviderId[] = ['orion', 'astra', 'nimbus']

export const IN_PROGRESS_PHONE_STATUSES: PhoneEnrichmentStatus[] = [
  'pending',
  'orion',
  'astra',
  'nimbus',
]
