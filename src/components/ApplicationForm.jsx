import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ApplicationForm({ onSubmit }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('applied')
  const [notes, setNotes] = useState('')
  const [appliedDate, setAppliedDate] = useState(
    new Date().toISOString().slice(0, 10)
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!company.trim()) return
    onSubmit({
      company: company.trim(),
      role: role.trim(),
      status,
      notes: notes.trim(),
      appliedDate: appliedDate || new Date().toISOString().slice(0, 10),
    })
    setCompany('')
    setRole('')
    setStatus('applied')
    setNotes('')
    setAppliedDate(new Date().toISOString().slice(0, 10))
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2>Add application</h2>
      <div className="form-group">
        <label htmlFor="company">Company *</label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="role">Role</label>
        <input
          id="role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Job title / role"
        />
      </div>
      <div className="form-group">
        <label htmlFor="appliedDate">Date applied</label>
        <input
          id="appliedDate"
          type="date"
          value={appliedDate}
          onChange={(e) => setAppliedDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          rows={2}
        />
      </div>
      <button type="submit" className="primary">
        Add application
      </button>
    </form>
  )
}
