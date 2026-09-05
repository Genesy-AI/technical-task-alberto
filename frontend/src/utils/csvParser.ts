import Papa from 'papaparse'
import { getLeadFieldByCsvHeader, LeadField } from '../leadFields'
import { sanitizeCountryCode } from './countryCode'

export interface CsvLead {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  countryCode?: string
  companyName?: string
  phoneNumber?: string
  yearsAtCompany?: number
  linkedinUrl?: string
  isValid: boolean
  errors: string[]
  warnings: string[]
  rowIndex: number
}

type CsvLeadValues = Omit<CsvLead, 'isValid' | 'errors' | 'warnings' | 'rowIndex'>

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const normalizeLinkedinUrl = (value: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

export const parseYearsAtCompany = (value: string): number | null => {
  if (!/^\d+$/.test(value)) {
    return null
  }
  return Number(value)
}

const assignFieldValue = (
  lead: Partial<CsvLeadValues>,
  field: LeadField,
  value: string,
  errors: string[],
  warnings: string[]
) => {
  if (field.key === 'countryCode') {
    if (!value) return
    const sanitized = sanitizeCountryCode(value)
    if (sanitized) {
      lead.countryCode = sanitized
      return
    }
    warnings.push(`Invalid country code "${value}" was omitted`)
    return
  }

  if (field.key === 'linkedinUrl') {
    if (!value) return
    const normalized = normalizeLinkedinUrl(value)
    if (!normalized) {
      errors.push('Invalid LinkedIn URL')
      return
    }
    lead.linkedinUrl = normalized
    return
  }

  if (field.type === 'int') {
    if (!value) return
    const parsed = parseYearsAtCompany(value)
    if (parsed === null) {
      errors.push(`${field.label} must be a non-negative integer`)
      return
    }
    lead.yearsAtCompany = parsed
    return
  }

  if (field.required) {
    ;(lead as Record<string, string>)[field.key] = value
    return
  }

  if (value) {
    ;(lead as Record<string, string>)[field.key] = value
  }
}

export const parseCsv = (content: string): CsvLead[] => {
  if (!content?.trim()) {
    throw new Error('CSV content cannot be empty')
  }

  const parseResult = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
    transformHeader: (header) => header.trim().toLowerCase(),
    quoteChar: '"',
  })

  if (parseResult.errors.length > 0) {
    const criticalErrors = parseResult.errors.filter(
      (error) => error.type === 'Delimiter' || error.type === 'Quotes' || error.type === 'FieldMismatch'
    )
    if (criticalErrors.length > 0) {
      throw new Error(`CSV parsing failed: ${criticalErrors[0].message}`)
    }
  }

  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error('CSV file appears to be empty or contains no valid data')
  }

  const data: CsvLead[] = []

  parseResult.data.forEach((row, index) => {
    if (Object.values(row).every((value) => !value)) return

    const lead: Partial<CsvLeadValues> = {}
    const errors: string[] = []
    const warnings: string[] = []

    Object.entries(row).forEach(([header, value]) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '')
      const field = getLeadFieldByCsvHeader(normalizedHeader)
      if (!field) return

      assignFieldValue(lead, field, value?.trim() || '', errors, warnings)
    })

    if (!lead.firstName?.trim()) {
      errors.push('First name is required')
    }
    if (!lead.lastName?.trim()) {
      errors.push('Last name is required')
    }
    if (!lead.email?.trim()) {
      errors.push('Email is required')
    } else if (!isValidEmail(lead.email)) {
      errors.push('Invalid email format')
    }

    data.push({
      ...lead,
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      isValid: errors.length === 0,
      errors,
      warnings,
      rowIndex: index + 2,
    })
  })

  return data
}
