import { BirthFields } from './BirthFields'

export function GuestForm({
  name,
  onNameChange,
  yearRef,
  monthRef,
  dayRef,
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  onBirthKeyDown,
  time,
  onTimeChange,
  gender,
  onGenderChange,
  calendar,
  onCalendarChange,
  error,
  loading,
  onSubmit,
}) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <fieldset className="form-block" aria-labelledby="basic-info-title">
        <p id="basic-info-title" className="form-block-title">
          기본 정보
        </p>
        <div className="field">
          <label htmlFor="name">이름</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={onNameChange}
            placeholder="이름을 입력하세요"
            autoComplete="name"
          />
        </div>
        {name.trim() && (
          <p className="name-preview">{name.trim()}님의 사주</p>
        )}
      </fieldset>

      <fieldset className="form-block" aria-labelledby="birth-info-title">
        <p id="birth-info-title" className="form-block-title">
          출생 정보
        </p>
        <BirthFields
          labelId="birth-label"
          yearId="birth-year"
          monthId="birth-month"
          dayId="birth-day"
          yearRef={yearRef}
          monthRef={monthRef}
          dayRef={dayRef}
          year={year}
          month={month}
          day={day}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onDayChange={onDayChange}
          onBirthKeyDown={onBirthKeyDown}
          autoComplete
        />
        <div className="field">
          <label htmlFor="time">태어난 시간</label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={onTimeChange}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="gender">성별</label>
            <select id="gender" value={gender} onChange={onGenderChange}>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="calendar">달력</label>
            <select id="calendar" value={calendar} onChange={onCalendarChange}>
              <option value="양력">양력</option>
              <option value="음력">음력</option>
            </select>
          </div>
        </div>
      </fieldset>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="submit" type="submit" disabled={loading}>
        {loading ? '해석 중…' : '내 사주 보기'}
      </button>
    </form>
  )
}
