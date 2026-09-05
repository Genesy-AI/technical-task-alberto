const SYSTEM_FIELDS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'message',
  'emailVerified',
  'phoneEnrichmentStatus',
  'phoneEnrichmentProvider',
])

export interface Lead {
  firstName: string
  lastName?: string | null
  email?: string | null
  jobTitle?: string | null
  companyName?: string | null
  countryCode?: string | null
  phoneNumber?: string | null
  yearsAtCompany?: number | string | null
  linkedinUrl?: string | null
  [key: string]: unknown
}

export function generateMessageFromTemplate(template: string, lead: Lead): string {
  let message = template

  const availableFields: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(lead)) {
    if (!SYSTEM_FIELDS.has(key)) {
      availableFields[key] = value
    }
  }

  const templateVariables = template.match(/\{(\w+)\}/g) || []

  for (const variable of templateVariables) {
    const fieldName = variable.slice(1, -1)

    if (fieldName in availableFields) {
      const fieldValue = availableFields[fieldName]

      if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
        throw new Error(`Missing required field: ${fieldName}`)
      }

      message = message.replace(new RegExp(`\\{${fieldName}\\}`, 'g'), String(fieldValue))
    } else {
      throw new Error(`Unknown field in template: ${fieldName}`)
    }
  }

  return message
}
