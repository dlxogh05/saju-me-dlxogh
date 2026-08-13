export function BirthFields({
  labelId,
  yearId,
  monthId,
  dayId,
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
  autoComplete = false,
}) {
  return (
    <div className="field">
      <span className="field-label" id={labelId}>
        생년월일
      </span>
      <div className="birth-group" role="group" aria-labelledby={labelId}>
        <input
          ref={yearRef}
          id={yearId}
          className="birth-year"
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete ? 'bday-year' : undefined}
          placeholder="YYYY"
          maxLength={4}
          value={year}
          onChange={onYearChange}
          aria-label="연도 4자리"
        />
        <span className="birth-sep" aria-hidden="true">
          .
        </span>
        <input
          ref={monthRef}
          id={monthId}
          className="birth-month"
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete ? 'bday-month' : undefined}
          placeholder="MM"
          maxLength={2}
          value={month}
          onChange={onMonthChange}
          onKeyDown={(e) => onBirthKeyDown('month', e)}
          aria-label="월 2자리"
        />
        <span className="birth-sep" aria-hidden="true">
          .
        </span>
        <input
          ref={dayRef}
          id={dayId}
          className="birth-day"
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete ? 'bday-day' : undefined}
          placeholder="DD"
          maxLength={2}
          value={day}
          onChange={onDayChange}
          onKeyDown={(e) => onBirthKeyDown('day', e)}
          aria-label="일 2자리"
        />
      </div>
    </div>
  )
}
