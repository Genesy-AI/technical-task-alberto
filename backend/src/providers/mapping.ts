const ISO_CALLING_CODES: Record<string, string> = {
  US: '1',
  CA: '1',
  GB: '44',
  UK: '44',
  ES: '34',
  FR: '33',
  DE: '49',
  IT: '39',
  AU: '61',
  IN: '91',
  MX: '52',
  BR: '55',
  NL: '31',
  BE: '32',
  PT: '351',
  IE: '353',
  SE: '46',
  NO: '47',
  DK: '45',
  FI: '358',
  PL: '48',
  AT: '43',
  CH: '41',
  JP: '81',
  KR: '82',
  CN: '86',
  SG: '65',
  NZ: '64',
  ZA: '27',
  AE: '971',
  IL: '972',
}

export function companyWebsiteFromEmail(email: string): string {
  const at = email.lastIndexOf('@')
  if (at === -1 || at === email.length - 1) {
    return ''
  }
  return email.slice(at + 1).trim().toLowerCase()
}

export function normalizePhone(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const asString = String(value).trim()
  if (!asString || asString.toLowerCase() === 'undefined' || asString.toLowerCase() === 'null') {
    return null
  }

  return asString
}

export function formatNimbusPhone(
  number: number | string | null | undefined,
  countryCode: string | null | undefined
): string | null {
  if (number === null || number === undefined || number === '') {
    return null
  }

  const digits = String(number).replace(/\D/g, '')
  if (!digits) {
    return null
  }

  const cc = (countryCode ?? '').trim()
  if (!cc) {
    return `+${digits}`
  }

  if (cc.startsWith('+')) {
    const ccDigits = cc.slice(1).replace(/\D/g, '')
    return ccDigits ? `+${ccDigits}${digits}` : `+${digits}`
  }

  if (/^\d+$/.test(cc)) {
    return `+${cc}${digits}`
  }

  const mapped = ISO_CALLING_CODES[cc.toUpperCase()]
  if (mapped) {
    return `+${mapped}${digits}`
  }

  return `+${digits}`
}

export function fullNameFromLead(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}
