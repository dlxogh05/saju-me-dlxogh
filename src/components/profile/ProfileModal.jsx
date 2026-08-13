import { useRef, useState } from 'react'
import { BirthFields } from '../form/BirthFields'
import {
  joinBirth,
  onlyDigits,
  splitBirth,
  validateProfile,
} from '../../lib/profile'

export function ProfileModal({
  mode,
  initialProfile,
  saving,
  error,
  submitLabel,
  readingsCount,
  onSave,
  onCancel,
}) {
  const parts = splitBirth(initialProfile?.birth ?? '')
  const [name, setName] = useState(initialProfile?.name ?? '')
  const [year, setYear] = useState(parts.year)
  const [month, setMonth] = useState(parts.month)
  const [day, setDay] = useState(parts.day)
  const [time, setTime] = useState(initialProfile?.birth_time ?? '')
  const [gender, setGender] = useState(initialProfile?.gender ?? 'male')
  const [calendar, setCalendar] = useState(initialProfile?.calendar ?? '양력')
  const [localError, setLocalError] = useState('')

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)
  const isOnboarding = mode === 'onboarding'

  function handleYearChange(e) {
    const next = onlyDigits(e.target.value, 4)
    setYear(next)
    if (next.length === 4) monthRef.current?.focus()
  }

  function handleMonthChange(e) {
    const next = onlyDigits(e.target.value, 2)
    setMonth(next)
    if (next.length === 2) dayRef.current?.focus()
  }

  function handleBirthKeyDown(part, e) {
    if (e.key !== 'Backspace') return
    if (part === 'month' && month === '') {
      e.preventDefault()
      yearRef.current?.focus()
    }
    if (part === 'day' && day === '') {
      e.preventDefault()
      monthRef.current?.focus()
    }
  }

  function handleBackdropClick() {
    if (!isOnboarding) onCancel?.()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      birth: joinBirth(year, month, day),
      birth_time: time,
      gender,
      calendar,
    }
    const message = validateProfile(payload)
    if (message) {
      setLocalError(message)
      return
    }
    setLocalError('')
    onSave(payload)
  }

  const title = isOnboarding ? '사주에 쓸 정보를 입력해 주세요' : '프로필 수정'
  const displayError = localError || error
  const countNumber = Number(readingsCount)
  const showCount = isOnboarding && Number.isFinite(countNumber) && countNumber >= 1

  return (
    <div className={isOnboarding ? 'profile-modal-layer is-landing' : 'profile-modal-layer'}>
      <button
        type="button"
        className="profile-modal-backdrop"
        aria-label={isOnboarding ? undefined : '닫기'}
        tabIndex={isOnboarding ? -1 : 0}
        onClick={handleBackdropClick}
      />
      <div
        className="profile-modal-stack"
        role={isOnboarding ? 'region' : 'dialog'}
        aria-modal={isOnboarding ? undefined : 'true'}
        aria-labelledby="profile-modal-title"
      >
        <img
          className="mascot mascot--modal"
          src="/mascot.png"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <div className="profile-modal">
          <p className="section-kicker">
            {isOnboarding ? 'Welcome' : 'Profile'}
          </p>
          <h2 id="profile-modal-title" className="profile-modal-title">
            {title}
          </h2>
          {showCount ? (
            <p className="profile-modal-count">
              지금까지{' '}
              <span>{countNumber.toLocaleString('ko-KR')}</span>
              개의 사주가 펼쳐졌습니다.
            </p>
          ) : null}
          <form className="form profile-modal-form" onSubmit={handleSubmit}>
            <fieldset className="form-block">
              <p className="form-block-title">기본 정보</p>
              <div className="field">
                <label htmlFor="profile-name">이름</label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </fieldset>
            <fieldset className="form-block">
              <p className="form-block-title">출생 정보</p>
              <BirthFields
                labelId="profile-birth-label"
                yearRef={yearRef}
                monthRef={monthRef}
                dayRef={dayRef}
                year={year}
                month={month}
                day={day}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                onDayChange={(e) => setDay(onlyDigits(e.target.value, 2))}
                onBirthKeyDown={handleBirthKeyDown}
              />
              <div className="field">
                <label htmlFor="profile-time">태어난 시간</label>
                <input
                  id="profile-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="profile-gender">성별</label>
                  <select
                    id="profile-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="profile-calendar">달력</label>
                  <select
                    id="profile-calendar"
                    value={calendar}
                    onChange={(e) => setCalendar(e.target.value)}
                  >
                    <option value="양력">양력</option>
                    <option value="음력">음력</option>
                  </select>
                </div>
              </div>
            </fieldset>
            {displayError && (
              <p className="form-error" role="alert">
                {displayError}
              </p>
            )}
            <div className="profile-modal-actions">
              {!isOnboarding && (
                <button
                  type="button"
                  className="auth-button"
                  onClick={onCancel}
                  disabled={saving}
                >
                  취소
                </button>
              )}
              <button className="submit" type="submit" disabled={saving}>
                {saving
                  ? '저장 중…'
                  : submitLabel || (isOnboarding ? '내 사주 보기' : '저장')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
