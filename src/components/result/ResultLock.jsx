import { GoogleMark } from '../icons/GoogleMark'

export function ResultLock({ lockedTitles, onLogin }) {
  return (
    <div className="result-lock">
      <div className="result-lock-veil" aria-hidden="true">
        <span className="result-lock-line" />
        <span className="result-lock-line" />
        <span className="result-lock-line" />
        <span className="result-lock-line" />
      </div>
      <div className="result-lock-card">
        <p className="result-lock-badge">여기부터 잠겨 있다냥</p>
        <h3 className="result-lock-title">쓴소리는 아직 시작도 안 했다냥</h3>
        <p className="result-lock-desc">
          로그인하면 남은 해석이 바로 열리고, 지금 본 내용도 그대로 저장된다냥.
        </p>
        {lockedTitles.length > 0 && (
          <ul className="result-lock-list">
            {lockedTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="submit result-lock-button"
          onClick={onLogin}
        >
          <GoogleMark />
          Google로 나머지 보기
        </button>
        <p className="result-lock-note">10초면 끝난다냥. 결제는 없다냥.</p>
      </div>
    </div>
  )
}
