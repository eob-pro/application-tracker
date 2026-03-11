import { useState, useEffect } from 'react'
import ApplicationForm from './components/ApplicationForm.jsx'
import ApplicationList from './components/ApplicationList.jsx'

const STORAGE_KEY = 'application-tracker-applications'

const DEFAULT_APPLICATIONS = []

function loadApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load applications', e)
  }
  return DEFAULT_APPLICATIONS
}

function saveApplications(apps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
  } catch (e) {
    console.warn('Failed to save applications', e)
  }
}

export default function App() {
  const [applications, setApplications] = useState(loadApplications)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    saveApplications(applications)
  }, [applications])

  function addApplication(application) {
    setApplications((prev) => [
      {
        id: crypto.randomUUID(),
        ...application,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  function updateApplication(id, updates) {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    )
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
      <ApplicationForm onSubmit={addApplication} />
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
