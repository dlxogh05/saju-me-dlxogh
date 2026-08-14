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
      <p className="section-kicker">Continue</p>
      <p className="topic-gate-label">
        {user
          ? '같은 명식으로 다른 해석'
          : '로그인하면 연애·재물 해석도 열립니다'}
      </p>
      <div className="topic-seg" role="group" aria-label="이어서 볼 해석">
        {currentKind !== 'basic' && (
          <button type="button" className="topic-seg-item" onClick={() => request('basic')}>
            성격
          </button>
        )}
        {currentKind !== 'love' && (
          <button type="button" className="topic-seg-item" onClick={() => request('love')}>
            연애
          </button>
        )}
        {currentKind !== 'wealth' && (
          <button type="button" className="topic-seg-item" onClick={() => request('wealth')}>
            재물
          </button>
        )}
      </div>
    </div>
  )
}
