import { AuthBar } from './AuthBar'
import { ReadingList } from './ReadingList'

export function Sidebar({
  user,
  profile,
  readings,
  activeReadingId,
  onLogin,
  onLogout,
  onEditProfile,
  onNewReading,
  onSelectReading,
  onDeleteReading,
}) {
  return (
    <aside className="sidebar" aria-labelledby="sidebar-title">
      <AuthBar
        user={user}
        profile={profile}
        onLogin={onLogin}
        onLogout={onLogout}
        onEditProfile={onEditProfile}
      />

      {user && (
        <button
          type="button"
          className="auth-button is-primary new-reading-button"
          onClick={onNewReading}
        >
          새 사주 해석
        </button>
      )}

      <p className="section-kicker">Saved</p>
      <h2 id="sidebar-title" className="sidebar-title">
        저장된 사주
      </h2>
      <ReadingList
        user={user}
        readings={readings}
        activeReadingId={activeReadingId}
        onSelect={onSelectReading}
        onDelete={onDeleteReading}
      />
    </aside>
  )
}
