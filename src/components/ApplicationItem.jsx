import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString()
}

export default function ApplicationItem({ application, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [company, setCompany] = useState(application.company)
  const [role, setRole] = useState(application.role || '')
  const [status, setStatus] = useState(application.status)
  const [notes, setNotes] = useState(application.notes || '')

  function handleSave() {
    onUpdate(application.id, { company, role, status, notes })
    setEditing(false)
  }

  function handleCancel() {
    setCompany(application.company)
    setRole(application.role || '')
    setStatus(application.status)
    setNotes(application.notes || '')
    setEditing(false)
  }

  if (editing) {
    return (
      <li style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-group">
          <label>Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Job title"
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        <div className="actions">
          <button type="button" className="primary" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </li>
    )
  }

  return (
    <li>
      <div className="meta">
        <strong>{application.company}</strong>
        {application.role && (
          <span>{application.role}</span>
        )}
        <span>Applied: {formatDate(application.appliedDate)}</span>
        {application.notes && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#555' }}>
            {application.notes}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className={`status-badge status-${application.status}`}>
          {STATUS_OPTIONS.find((o) => o.value === application.status)?.label ?? application.status}
        </span>
        <div className="actions">
          <button type="button" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this application?')) onDelete(application.id)
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}
