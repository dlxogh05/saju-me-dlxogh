import { useEffect, useState } from 'react'
import { isKnownTime } from '../../lib/profile'

export function TimeField({ id, value, onChange }) {
  const [unknown, setUnknown] = useState(!isKnownTime(value))

  useEffect(() => {
    if (isKnownTime(value)) setUnknown(false)
  }, [value])

  function handleTimeChange(e) {
    const next = e.target.value
    setUnknown(false)
    onChange(next)
  }

  function handleUnknownChange(e) {
    const nextUnknown = e.target.checked
    setUnknown(nextUnknown)
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
