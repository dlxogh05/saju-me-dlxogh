export function TopicGate({ user, currentKind = 'basic', onLogin, onTopic }) {
  function request(kind) {
    if (!user) {
      onLogin()
      return
    }
    onTopic(kind)
  }

  return (
    <div className="topic-gate">
      <p className="topic-gate-label">
        {user
          ? '같은 원국으로 이어서 보기'
          : '로그인하면 재물·관계 기질을 이어서 볼 수 있다냥'}
      </p>
      <div className="topic-gate-actions">
        {currentKind !== 'wealth' && (
          <button type="button" className="auth-button" onClick={() => request('wealth')}>
            재물운 보기
          </button>
        )}
        {currentKind !== 'love' && (
          <button type="button" className="auth-button" onClick={() => request('love')}>
            연애운 보기
          </button>
        )}
      </div>
    </div>
  )
}
