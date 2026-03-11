import ApplicationItem from './ApplicationItem.jsx'
import { STATUS_OPTIONS_WITH_ALL } from '../schema.js'

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
        {STATUS_OPTIONS_WITH_ALL.map((opt) => (
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
