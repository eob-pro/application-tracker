import { useState } from 'react'
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  ATS_OPTIONS,
} from '../schema.js'

export default function ApplicationForm({ companies, onSubmit, onNewCompany }) {
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [scope, setScope] = useState('')
  const [jobId, setJobId] = useState('')
  const [status, setStatus] = useState('to_apply')
  const [sourceId, setSourceId] = useState('linkedin')
  const [appliedDate, setAppliedDate] = useState('')
  const [originalListingDate, setOriginalListingDate] = useState('')
  const [atsSystem, setAtsSystem] = useState('')
  const [resumeVersion, setResumeVersion] = useState('')
  const [coverLetterUsed, setCoverLetterUsed] = useState('')
  const [customCoverLetter, setCustomCoverLetter] = useState(false)
  const [customResume, setCustomResume] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const companyTrimmed = company.trim()
    if (!companyTrimmed) return
    onNewCompany(companyTrimmed)
    onSubmit({
      company: companyTrimmed,
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
    setCompany('')
    setPosition('')
    setScope('')
    setJobId('')
    setStatus('to_apply')
    setSourceId('linkedin')
    setAppliedDate('')
    setOriginalListingDate('')
    setAtsSystem('')
    setResumeVersion('')
    setCoverLetterUsed('')
    setCustomCoverLetter(false)
    setCustomResume(false)
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
          list="company-list"
          placeholder="Company name (adds to index if new)"
          required
        />
        <datalist id="company-list">
          {companies.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="form-group">
        <label htmlFor="position">Position</label>
        <input
          id="position"
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Job title / role"
        />
      </div>

      <div className="form-group">
        <label htmlFor="scope">Scope</label>
        <input
          id="scope"
          type="text"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder="Department, product, etc."
        />
      </div>

      <div className="form-group">
        <label htmlFor="jobId">Job ID</label>
        <input
          id="jobId"
          type="text"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="Requisition ID from career site"
        />
      </div>

      <div className="form-row">
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
          <label htmlFor="sourceId">Source</label>
          <select
            id="sourceId"
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
          <label htmlFor="appliedDate">Applied date</label>
          <input
            id="appliedDate"
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            title="When you applied (leave blank for today)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="originalListingDate">Original listing date</label>
          <input
            id="originalListingDate"
            type="date"
            value={originalListingDate}
            onChange={(e) => setOriginalListingDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="atsSystem">ATS / Recruiting system</label>
          <select
            id="atsSystem"
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
        <label htmlFor="resumeVersion">Resume version</label>
        <input
          id="resumeVersion"
          type="text"
          value={resumeVersion}
          onChange={(e) => setResumeVersion(e.target.value)}
          placeholder="Filename or e.g. LinkedIn"
        />
      </div>

      <div className="form-group">
        <label htmlFor="coverLetterUsed">Cover letter used</label>
        <input
          id="coverLetterUsed"
          type="text"
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

      <button type="submit" className="primary">
        Add application
      </button>
    </form>
  )
}
