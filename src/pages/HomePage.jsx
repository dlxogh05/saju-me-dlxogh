import { FormSection } from '../components/form/FormSection'
import { Hero } from '../components/layout/Hero'
import { SiteFooter } from '../components/layout/SiteFooter'
import { Toast } from '../components/layout/Toast'
import { ProfileModal } from '../components/profile/ProfileModal'
import { LoadingRitual } from '../components/result/LoadingRitual'
import { ResultSection } from '../components/result/ResultSection'
import { Sidebar } from '../components/sidebar/Sidebar'
import { useHomePage } from '../hooks/useHomePage'

export function HomePage() {
  const {
    name,
    setName,
    year,
    month,
    day,
    time,
    setTime,
    gender,
    setGender,
    calendar,
    setCalendar,
    reply,
    resultName,
    loading,
    error,
    loadingMessage,
    readings,
    activeReadingId,
    user,
    profile,
    profileReady,
    profileError,
    modalMode,
    setModalMode,
    profileSaving,
    toast,
    toastLeaving,
    readingsCount,
    yearRef,
    monthRef,
    dayRef,
    resultRef,
    formSectionRef,
    showGuestOnboarding,
    isOnboarding,
    heroOffset,
    teaser,
    handleGoogleLogin,
    handleLogout,
    handleYearChange,
    handleMonthChange,
    handleDayChange,
    handleBirthKeyDown,
    handleNewReading,
    handleSelectReading,
    handleDeleteReading,
    handleSaveProfile,
    handleGuestOnboardingSave,
    handleCancelEdit,
    handleShare,
    handleAsk,
  } = useHomePage()

  return (
    <div className={isOnboarding ? 'page is-onboarding' : 'page'}>
      <Hero offset={heroOffset} atmosphere={isOnboarding} />

      <div className="layout">
        <Sidebar
          user={user}
          profile={profile}
          readings={readings}
          activeReadingId={activeReadingId}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          onEditProfile={() => setModalMode('edit')}
          onNewReading={handleNewReading}
          onSelectReading={handleSelectReading}
          onDeleteReading={handleDeleteReading}
        />

        <main className="shell">
          <FormSection
            formSectionRef={formSectionRef}
            user={user}
            profile={profile}
            profileReady={profileReady}
            profileError={profileError}
            error={error}
            loading={loading}
            name={name}
            onNameChange={(e) => setName(e.target.value)}
            yearRef={yearRef}
            monthRef={monthRef}
            dayRef={dayRef}
            year={year}
            month={month}
            day={day}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            onDayChange={handleDayChange}
            onBirthKeyDown={handleBirthKeyDown}
            time={time}
            onTimeChange={setTime}
            gender={gender}
            onGenderChange={(e) => setGender(e.target.value)}
            calendar={calendar}
            onCalendarChange={(e) => setCalendar(e.target.value)}
            onEditProfile={() => setModalMode('edit')}
            onAsk={handleAsk}
          />

          {loading && (
            <LoadingRitual resultRef={resultRef} message={loadingMessage} />
          )}

          {reply && !loading && (
            <ResultSection
              resultRef={resultRef}
              user={user}
              resultName={resultName}
              activeReadingId={activeReadingId}
              reply={reply}
              teaser={teaser}
              onShare={handleShare}
              onLogin={handleGoogleLogin}
            />
          )}
        </main>
      </div>

      <SiteFooter />

      {(showGuestOnboarding || (user && modalMode)) && (
        <ProfileModal
          key={user ? modalMode : 'guest'}
          mode={user ? modalMode : 'onboarding'}
          initialProfile={modalMode === 'edit' ? profile : null}
          saving={profileSaving}
          error={profileError}
          onSave={user ? handleSaveProfile : handleGuestOnboardingSave}
          onCancel={handleCancelEdit}
          submitLabel={user ? '저장' : '내 사주 보기'}
          readingsCount={readingsCount}
        />
      )}

      <Toast message={toast} leaving={toastLeaving} />
    </div>
  )
}
