export function AuthBar({ user, profile, onLogin, onLogout, onEditProfile }) {
  if (!user) {
    return (
      <div className="auth-bar">
        <button type="button" className="auth-button is-primary" onClick={onLogin}>
          Google로 로그인
        </button>
      </div>
    )
  }

  return (
    <div className="auth-bar">
      <p className="auth-email" title={user.email ?? ''}>
        {user.email ?? '로그인됨'}
      </p>
      {profile && (
        <button type="button" className="auth-button" onClick={onEditProfile}>
          프로필 수정
        </button>
      )}
      <button type="button" className="auth-button" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  )
}
