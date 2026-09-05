export type LeadFieldGroup = 'contact' | 'role' | 'company'

export type LeadField = {
  key: string
  label: string
  group: LeadFieldGroup
  csvHeaders: string[]
  type: 'string' | 'int'
  required?: boolean
}

export const LEAD_FIELD_GROUP_LABELS: Record<LeadFieldGroup, string> = {
  contact: 'Contact',
  role: 'Role',
  company: 'Company',
}

export const LEAD_FIELDS: LeadField[] = [
  {
    key: 'firstName',
    label: 'First name',
    group: 'contact',
    csvHeaders: ['firstname'],
    type: 'string',
    required: true,
  },
  {
    key: 'lastName',
    label: 'Last name',
    group: 'contact',
    csvHeaders: ['lastname'],
    type: 'string',
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    group: 'contact',
    csvHeaders: ['email'],
    type: 'string',
    required: true,
  },
  {
    key: 'phoneNumber',
    label: 'Phone number',
    group: 'contact',
    csvHeaders: ['phonenumber', 'phone', 'phoneno'],
    type: 'string',
  },
  {
    key: 'linkedinUrl',
    label: 'LinkedIn',
    group: 'contact',
    csvHeaders: ['linkedinurl', 'linkedin', 'linkedinprofileurl', 'linkedinprofile'],
    type: 'string',
  },
  {
    key: 'jobTitle',
    label: 'Job title',
    group: 'role',
    csvHeaders: ['jobtitle'],
    type: 'string',
  },
  {
    key: 'yearsAtCompany',
    label: 'Years at company',
    group: 'role',
    csvHeaders: ['yearsatcompany', 'yearsatcurrentcompany', 'yearsinrole'],
    type: 'int',
  },
  {
    key: 'companyName',
    label: 'Company',
    group: 'company',
    csvHeaders: ['companyname'],
    type: 'string',
  },
  {
    key: 'countryCode',
    label: 'Country',
    group: 'company',
    csvHeaders: ['countrycode'],
    type: 'string',
  },
]

const csvHeaderToField = new Map<string, LeadField>()
for (const field of LEAD_FIELDS) {
  for (const header of field.csvHeaders) {
    csvHeaderToField.set(header, field)
  }
}

export const getLeadFieldByCsvHeader = (normalizedHeader: string): LeadField | undefined =>
  csvHeaderToField.get(normalizedHeader)

export const getCsvImportHelpText = (): string => {
  const required = LEAD_FIELDS.filter((field) => field.required).map((field) => field.key)
  const optional = LEAD_FIELDS.filter((field) => !field.required).map((field) => field.key)
  return `CSV must include: ${required.join(', ')} (required). Optional: ${optional.join(', ')}`
}

export const previewMessageFromTemplate = (
  template: string,
  lead: Record<string, unknown>
): { ok: true; message: string } | { ok: false; error: string } => {
  try {
    const knownKeys = new Set(LEAD_FIELDS.map((field) => field.key))
    let message = template
    const templateVariables = template.match(/\{(\w+)\}/g) || []

    for (const variable of templateVariables) {
      const fieldName = variable.slice(1, -1)

      if (!knownKeys.has(fieldName)) {
        throw new Error(`Unknown field in template: ${fieldName}`)
      }

      const fieldValue = lead[fieldName]
      if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
        throw new Error(`Missing required field: ${fieldName}`)
      }

      message = message.replace(new RegExp(`\\{${fieldName}\\}`, 'g'), String(fieldValue))
    }

    return { ok: true, message }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
