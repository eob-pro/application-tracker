import { useState } from 'react'
import ApplicationItem from './ApplicationItem.jsx'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ApplicationList({
  applications,
  statusFilter,
  onStatusFilterChange,
  onUpdate,
  onDelete,
}) {
  return (
    <>
      <div className="filter-bar">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={statusFilter === opt.value ? 'active' : ''}
            onClick={() => onStatusFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {applications.length === 0 ? (
        <div className="empty-state">
          No applications yet. Add one above to get started.
        </div>
      ) : (
        <ul className="applications-list">
          {applications.map((app) => (
            <ApplicationItem
              key={app.id}
              application={app}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </>
  )
}
