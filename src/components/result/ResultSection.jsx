import { ReadingBody } from './ReadingBody'
import { ResultLock } from './ResultLock'
import { SectionHeading } from '../ui/SectionHeading'

export function ResultSection({
  resultRef,
  user,
  resultName,
  activeReadingId,
  reply,
  teaser,
  onShare,
  onLogin,
}) {
  return (
    <section
      ref={resultRef}
      className="section section-result"
      aria-labelledby="result-section-title"
      aria-live="polite"
    >
      <SectionHeading
        kicker="Reading"
        title="해석 결과"
        titleId="result-section-title"
      />

      <img
        className="mascot mascot--body"
        src="/mascot.png"
        alt=""
        aria-hidden="true"
        decoding="async"
      />

      <article
        key={activeReadingId ?? 'live'}
        className={user ? 'result-panel reading' : 'result-panel reading is-teaser'}
      >
        <header className="reading-header">
          <div className="reading-header-text">
            <p className="reading-kicker">기본 차트 해석</p>
            <h3 className="reading-title">
              {resultName ? `${resultName}님의 사주` : '사주 해석'}
            </h3>
          </div>
          <button
            type="button"
            className="auth-button share-button"
            onClick={onShare}
          >
            공유
          </button>
        </header>
        <ReadingBody reply={user ? reply : teaser.preview} />
        {!user && teaser && (
          <ResultLock lockedTitles={teaser.lockedTitles} onLogin={onLogin} />
        )}
      </article>
    </section>
  )
}
