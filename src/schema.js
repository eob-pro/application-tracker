// Status options; each change is timestamped in statusHistory
export const STATUS_OPTIONS = [
  { value: 'to_apply', label: 'To apply' },
  { value: 'applied', label: 'Applied' },
  { value: 'screened', label: 'Screened' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'not_hired', label: 'Not hired' },
]

export const STATUS_OPTIONS_WITH_ALL = [
  { value: 'all', label: 'All' },
  ...STATUS_OPTIONS,
]

// Where you found the listing
export const SOURCE_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'theladders', label: 'The Ladders' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'teamworks', label: 'Teamworks' },
  { value: 'glassdoor', label: 'Glassdoor' },
  { value: 'lensa', label: 'Lensa' },
]

// ATS / recruiting system used by the company
export const ATS_OPTIONS = [
  { value: '', label: '—' },
  { value: 'teamworks', label: 'Teamworks' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'workday', label: 'Workday' },
  { value: 'lever', label: 'Lever' },
  { value: 'rippling', label: 'Rippling' },
  { value: 'icims', label: 'iCIMS' },
  { value: 'taleo', label: 'Taleo' },
  { value: 'company_site', label: 'Company site' },
  { value: 'other', label: 'Other' },
]

export function createStatusHistoryEntry(status) {
  return { status, date: new Date().toISOString() }
}

export function getDefaultApplication() {
  const status = 'to_apply'
  return {
    position: '',
    scope: '',
    jobId: '',
    status,
    statusHistory: [createStatusHistoryEntry(status)],
    sourceId: 'linkedin',
    originalListingDate: '',
    atsSystem: '',
    resumeVersion: '',
    coverLetterUsed: '',
    customCoverLetter: false,
    customResume: false,
  }
}
