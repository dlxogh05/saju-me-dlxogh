import { useRef, useState } from 'react'
import { BirthFields } from '../form/BirthFields'
import { TimeField } from '../form/TimeField'
import { GoogleMark } from '../icons/GoogleMark'
import {
  joinBirth,
  normalizeBirthTime,
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
  onLogin,
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

  function handleLayerClick(e) {
    if (!isOnboarding && e.target === e.currentTarget) onCancel?.()
  }

  function handleBackdropClick() {
    if (!isOnboarding) onCancel?.()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      birth: joinBirth(year, month, day),
      birth_time: normalizeBirthTime(time),
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

  const displayError = localError || error
  const countNumber = Number(readingsCount)
  const showCount = isOnboarding && Number.isFinite(countNumber) && countNumber >= 1

  return (
    <div
      className={isOnboarding ? 'profile-landing' : 'profile-modal-layer'}
      onClick={handleLayerClick}
    >
      <button
        type="button"
        className="profile-modal-backdrop"
        aria-label={isOnboarding ? undefined : '닫기'}
        tabIndex={-1}
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
        <div className={isOnboarding ? 'profile-modal is-landing' : 'profile-modal'}>
          {isOnboarding ? (
            <header className="profile-landing-intro">
              <p className="brand">SAJU ME</p>
              <h1 id="profile-modal-title" className="profile-landing-title">
                사주 해석
              </h1>
              <p className="profile-landing-lead">
                명식을 펼치면, 성격과 기질이 한 편의 글처럼 읽힙니다.
              </p>
              {showCount ? (
                <p className="profile-modal-count">
                  지금까지{' '}
                  <span>{countNumber.toLocaleString('ko-KR')}</span>
                  개의 사주가 펼쳐졌습니다.
                </p>
              ) : null}
              {onLogin ? (
                <div className="profile-landing-login">
                  <button
                    type="button"
                    className="submit result-lock-button"
                    onClick={onLogin}
                  >
                    <GoogleMark />
                    Google로 로그인
                  </button>
                  <p className="profile-landing-or">또는 이름만 넣고 먼저 보기</p>
                </div>
              ) : null}
            </header>
          ) : (
            <>
              <p className="section-kicker">Profile</p>
              <h2 id="profile-modal-title" className="profile-modal-title">
                프로필 수정
              </h2>
            </>
          )}
          <form className="form profile-modal-form" onSubmit={handleSubmit}>
            <fieldset className="form-block">
              {isOnboarding ? null : (
                <p className="form-block-title">기본 정보</p>
              )}
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
              {isOnboarding ? null : (
                <p className="form-block-title">출생 정보</p>
              )}
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
              <TimeField
                id="profile-time"
                value={time}
                onChange={setTime}
              />
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
