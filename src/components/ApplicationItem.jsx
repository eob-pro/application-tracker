import { useState } from 'react'
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  ATS_OPTIONS,
} from '../schema.js'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString()
}

function getSourceLabel(value) {
  return SOURCE_OPTIONS.find((o) => o.value === value)?.label ?? value || '—'
}

function getAtsLabel(value) {
  if (!value) return '—'
  const opt = ATS_OPTIONS.find((o) => o.value === value)
  return opt ? opt.label : value
}

function getAppliedDateValue(application) {
  const d = (application.statusHistory?.[0]?.date) || application.createdAt
  if (!d) return ''
  const str = typeof d === 'string' ? d : new Date(d).toISOString()
  return str.slice(0, 10)
}

export default function ApplicationItem({ application, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [company, setCompany] = useState(application.company)
  const [position, setPosition] = useState(application.position || '')
  const [scope, setScope] = useState(application.scope || '')
  const [jobId, setJobId] = useState(application.jobId || '')
  const [status, setStatus] = useState(application.status)
  const [sourceId, setSourceId] = useState(application.sourceId || 'linkedin')
  const [appliedDate, setAppliedDate] = useState(getAppliedDateValue(application))
  const [originalListingDate, setOriginalListingDate] = useState(
    application.originalListingDate || ''
  )
  const [atsSystem, setAtsSystem] = useState(application.atsSystem || '')
  const [resumeVersion, setResumeVersion] = useState(
    application.resumeVersion || ''
  )
  const [coverLetterUsed, setCoverLetterUsed] = useState(
    application.coverLetterUsed || ''
  )
  const [customCoverLetter, setCustomCoverLetter] = useState(
    !!application.customCoverLetter
  )
  const [customResume, setCustomResume] = useState(!!application.customResume)

  function handleSave() {
    onUpdate(application.id, {
      company: company.trim(),
      position: position.trim(),
      scope: scope.trim(),
      jobId: jobId.trim(),
      status,
      sourceId,
      appliedDate: appliedDate.trim() || undefined,
      originalListingDate: originalListingDate.trim() || undefined,
      atsSystem: atsSystem.trim(),
      resumeVersion: resumeVersion.trim(),
      coverLetterUsed: coverLetterUsed.trim(),
      customCoverLetter,
      customResume,
    })
    setEditing(false)
  }

  function handleCancel() {
    setCompany(application.company)
    setPosition(application.position || '')
    setScope(application.scope || '')
    setJobId(application.jobId || '')
    setStatus(application.status)
    setSourceId(application.sourceId || 'linkedin')
    setAppliedDate(getAppliedDateValue(application))
    setOriginalListingDate(application.originalListingDate || '')
    setAtsSystem(application.atsSystem || '')
    setResumeVersion(application.resumeVersion || '')
    setCoverLetterUsed(application.coverLetterUsed || '')
    setCustomCoverLetter(!!application.customCoverLetter)
    setCustomResume(!!application.customResume)
    setEditing(false)
  }

  const statusLabel =
    STATUS_OPTIONS.find((o) => o.value === application.status)?.label ??
    application.status

  if (editing) {
    return (
      <li className="application-item editing">
        <div className="edit-fields">
          <div className="form-group">
            <label>Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Job title"
            />
          </div>
          <div className="form-group">
            <label>Scope</label>
            <input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Department, product"
            />
          </div>
          <div className="form-group">
            <label>Job ID</label>
            <input
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Requisition ID"
            />
          </div>
          <div className="form-row">
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
              <label>Source</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Applied date</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Original listing date</label>
              <input
                type="date"
                value={originalListingDate}
                onChange={(e) => setOriginalListingDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>ATS</label>
              <select
                value={atsSystem}
                onChange={(e) => setAtsSystem(e.target.value)}
              >
                {ATS_OPTIONS.map((opt) => (
                  <option key={opt.value || 'none'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Resume version</label>
            <input
              value={resumeVersion}
              onChange={(e) => setResumeVersion(e.target.value)}
              placeholder="Filename or LinkedIn"
            />
          </div>
          <div className="form-group">
            <label>Cover letter used</label>
            <input
              value={coverLetterUsed}
              onChange={(e) => setCoverLetterUsed(e.target.value)}
              placeholder="Filename or description"
            />
          </div>
          <div className="form-group checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={customCoverLetter}
                onChange={(e) => setCustomCoverLetter(e.target.checked)}
              />
              Custom cover letter
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={customResume}
                onChange={(e) => setCustomResume(e.target.checked)}
              />
              Custom resume
            </label>
          </div>
          <div className="actions">
            <button type="button" className="primary" onClick={handleSave}>
              Save
            </button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="application-item">
      <div className="meta">
        <strong>{application.company}</strong>
        {application.position && (
          <span className="position">{application.position}</span>
        )}
        {application.scope && (
          <span className="scope">Scope: {application.scope}</span>
        )}
        {application.jobId && (
          <span className="job-id">Job ID: {application.jobId}</span>
        )}
        <div className="status-history">
          {(application.statusHistory || []).map((entry, i) => (
            <span key={i} className="status-date">
              {STATUS_OPTIONS.find((o) => o.value === entry.status)?.label ??
                entry.status}
              : {formatDate(entry.date)}
            </span>
          ))}
        </div>
        <div className="tags">
          <span className="tag source">{getSourceLabel(application.sourceId)}</span>
          {application.atsSystem && (
            <span className="tag ats">{getAtsLabel(application.atsSystem)}</span>
          )}
          {application.originalListingDate && (
            <span className="tag">Listed: {formatDate(application.originalListingDate)}</span>
          )}
          {application.resumeVersion && (
            <span className="tag">Resume: {application.resumeVersion}</span>
          )}
          {application.coverLetterUsed && (
            <span className="tag">CL: {application.coverLetterUsed}</span>
          )}
          {application.customCoverLetter && (
            <span className="tag">Custom CL</span>
          )}
          {application.customResume && (
            <span className="tag">Custom resume</span>
          )}
        </div>
      </div>
      <div className="item-actions">
        <span className={`status-badge status-${application.status}`}>
          {statusLabel}
        </span>
        <div className="actions">
          <button type="button" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this application?'))
                onDelete(application.id)
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}
