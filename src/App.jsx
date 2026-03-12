import { useState, useEffect } from 'react'
import ApplicationForm from './components/ApplicationForm.jsx'
import ApplicationList from './components/ApplicationList.jsx'
import {
  createStatusHistoryEntry,
  getDefaultApplication,
} from './schema.js'

const STORAGE_APPS = 'application-tracker-applications'
const STORAGE_COMPANIES = 'application-tracker-companies'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load', key, e)
  }
  return fallback
}

function saveJson(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save', key, e)
  }
}

// Migrate old app records to new schema
function migrateApplication(app) {
  if (app.statusHistory && Array.isArray(app.statusHistory)) return app
  const status = app.status || 'to_apply'
  const statusHistory = app.appliedDate
    ? [{ status: 'applied', date: new Date(app.appliedDate).toISOString() }]
    : [createStatusHistoryEntry(status)]
  const statusMap = { interviewing: 'interviewed', rejected: 'not_hired', offer: 'interviewed' }
  const mappedStatus = statusMap[app.status] || (['to_apply', 'applied', 'screened', 'interviewed', 'not_hired', 'closed'].includes(app.status) ? app.status : status)
  return {
    id: app.id,
    company: app.company || '',
    position: app.role || app.position || '',
    scope: app.scope ?? '',
    jobId: app.jobId ?? '',
    status: mappedStatus,
    statusHistory,
    sourceId: app.sourceId ?? 'linkedin',
    originalListingDate: app.originalListingDate ?? '',
    atsSystem: app.atsSystem ?? '',
    resumeVersion: app.resumeVersion ?? '',
    coverLetterUsed: app.coverLetterUsed ?? '',
    customCoverLetter: app.customCoverLetter ?? false,
    customResume: app.customResume ?? false,
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: app.updatedAt || new Date().toISOString(),
  }
}

function loadApplications() {
  const raw = loadJson(STORAGE_APPS, [])
  return raw.map(migrateApplication)
}

function loadCompanies() {
  const apps = loadApplications()
  const fromApps = [...new Set(apps.map((a) => a.company).filter(Boolean))]
  const stored = loadJson(STORAGE_COMPANIES, [])
  return [...new Set([...stored, ...fromApps])].sort((a, b) => a.localeCompare(b))
}

export default function App() {
  const [applications, setApplications] = useState(loadApplications)
  const [companies, setCompanies] = useState(loadCompanies)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    saveJson(STORAGE_APPS, applications)
  }, [applications])

  useEffect(() => {
    saveJson(STORAGE_COMPANIES, companies)
  }, [companies])

  function ensureCompany(name) {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    setCompanies((prev) => {
      if (prev.includes(trimmed)) return prev
      return [...prev, trimmed].sort((a, b) => a.localeCompare(b))
    })
  }

  function addApplication(application) {
    ensureCompany(application.company)
    const status = application.status || 'to_apply'
    const appliedDateStr = (application.appliedDate || '').trim()
    const firstDate = appliedDateStr
      ? (appliedDateStr.length === 10 ? appliedDateStr + 'T12:00:00.000Z' : appliedDateStr)
      : new Date().toISOString()
    const statusHistory = application.statusHistory || [{ status, date: firstDate }]
    setApplications((prev) => [
      {
        id: crypto.randomUUID(),
        company: (application.company || '').trim(),
        position: (application.position || '').trim(),
        scope: (application.scope || '').trim(),
        jobId: (application.jobId || '').trim(),
        status,
        statusHistory,
        sourceId: application.sourceId || 'linkedin',
        originalListingDate: (application.originalListingDate || '').trim() || undefined,
        atsSystem: (application.atsSystem || '').trim(),
        resumeVersion: (application.resumeVersion || '').trim(),
        coverLetterUsed: (application.coverLetterUsed || '').trim(),
        customCoverLetter: !!application.customCoverLetter,
        customResume: !!application.customResume,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  function updateApplication(id, updates) {
    const { appliedDate, ...rest } = updates
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        const next = { ...app, ...rest, updatedAt: new Date().toISOString() }
        if (updates.status != null && updates.status !== app.status) {
          next.statusHistory = [
            ...(app.statusHistory || []),
            createStatusHistoryEntry(updates.status),
          ]
        }
        if (appliedDate !== undefined) {
          const hist = next.statusHistory?.length ? [...next.statusHistory] : [{ status: next.status || 'applied', date: new Date().toISOString() }]
          hist[0] = { ...hist[0], date: appliedDate.length === 10 ? appliedDate + 'T12:00:00.000Z' : appliedDate }
          next.statusHistory = hist
        }
        return next
      })
    )
    if (updates.company) ensureCompany(updates.company)
  }

  function deleteApplication(id) {
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  const filtered =
    statusFilter === 'all'
      ? applications
      : applications.filter((app) => app.status === statusFilter)

  return (
    <>
      <h1>Application Tracker</h1>
      <ApplicationForm
        companies={companies}
        onSubmit={addApplication}
        onNewCompany={ensureCompany}
      />
      <ApplicationList
        applications={filtered}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onUpdate={updateApplication}
        onDelete={deleteApplication}
      />
    </>
  )
}
