import { GuestForm } from './GuestForm'
import { ProfileSummary } from './ProfileSummary'
import { SectionHeading } from '../ui/SectionHeading'

export function FormSection({
  formSectionRef,
  user,
  profile,
  profileReady,
  profileError,
  error,
  loading,
  subjectMode,
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
  onEditProfile,
  onFriend,
  onRank,
  onBackToMe,
  onAsk,
}) {
  const friendMode = Boolean(user && profile && subjectMode === 'friend')

  function renderBody() {
    if (user && !profileReady) {
      return <p className="sidebar-empty">프로필을 확인하는 중</p>
    }

    if (friendMode) {
      return (
        <>
          <GuestForm
            name={name}
            onNameChange={onNameChange}
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
            time={time}
            onTimeChange={onTimeChange}
            gender={gender}
            onGenderChange={onGenderChange}
            calendar={calendar}
            onCalendarChange={onCalendarChange}
            error={error}
            loading={loading}
            onSubmit={onAsk}
            submitLabel="친구 사주 보기"
            showTopics
            onPickTopic={(kind) => onAsk(null, null, kind)}
          />
          <button type="button" className="auth-button" onClick={onBackToMe}>
            내 사주로 돌아가기
          </button>
        </>
      )
    }

    if (user && profile) {
      return (
        <ProfileSummary
          profile={profile}
          error={error}
          profileError={profileError}
          loading={loading}
          onEdit={onEditProfile}
          onFriend={onFriend}
          onRank={onRank}
          onAsk={(kind) => onAsk(null, null, kind)}
        />
      )
    }

    if (user && profileError) {
      return (
        <p className="form-error" role="alert">
          {profileError}
        </p>
      )
    }

    if (user) return null

    return (
      <GuestForm
        name={name}
        onNameChange={onNameChange}
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
        time={time}
        onTimeChange={onTimeChange}
        gender={gender}
        onGenderChange={onGenderChange}
        calendar={calendar}
        onCalendarChange={onCalendarChange}
        error={error}
        loading={loading}
        onSubmit={onAsk}
      />
    )
  }

  return (
    <section
      ref={formSectionRef}
      className="section section-form"
      aria-labelledby="form-section-title"
    >
      <SectionHeading
        kicker="Input"
        title={
          friendMode ? '친구 사주' : user && profile ? '내 사주' : '정보 입력'
        }
        titleId="form-section-title"
      />
      {renderBody()}
    </section>
  )
}
