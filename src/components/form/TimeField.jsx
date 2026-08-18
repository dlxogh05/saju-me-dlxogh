import { useState } from 'react'
import { isKnownTime } from '../../lib/profile'

export function TimeField({ id, value, onChange }) {
  const known = isKnownTime(value)
  const [cleared, setCleared] = useState(!known)
  const unknown = !known && cleared

  function handleTimeChange(e) {
    const next = e.target.value
    setCleared(false)
    onChange(next)
  }

  function handleUnknownChange(e) {
    const nextUnknown = e.target.checked
    setCleared(nextUnknown)
    if (nextUnknown) onChange('')
  }

  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id}>태어난 시간</label>
        <label className="time-unknown">
          <input
            type="checkbox"
            checked={unknown}
            onChange={handleUnknownChange}
          />
          시간 모름
        </label>
      </div>
      <input
        id={id}
        type="time"
        value={unknown ? '' : value}
        onChange={handleTimeChange}
        disabled={unknown}
        aria-label={unknown ? '태어난 시간 (모름)' : '태어난 시간'}
      />
    </div>
  )
}
