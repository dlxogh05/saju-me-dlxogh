import { ReadingBody } from './ReadingBody'
import { SectionHeading } from '../ui/SectionHeading'
import { TopicGate } from './TopicGate'
import { READING_KICKERS } from '../../lib/readingSubject'

export function ResultSection({
  resultRef,
  user,
  resultName,
  activeReadingId,
  reply,
  kind = 'basic',
  onShare,
  onLogin,
  onTopic,
  onRank,
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
        className="result-panel reading"
      >
        <header className="reading-header">
          <div className="reading-header-text">
            <p className="reading-kicker">
              {READING_KICKERS[kind] ?? READING_KICKERS.basic}
            </p>
            <h3 className="reading-title">
              {resultName ? `${resultName}님의 사주` : '사주 해석'}
            </h3>
          </div>
          <div className="reading-header-tools">
            <button
              type="button"
              className="auth-button share-button"
              onClick={onShare}
            >
              공유
            </button>
            {onRank && (
              <button
                type="button"
                className="auth-button is-primary share-button"
                onClick={onRank}
              >
                궁합 순위
              </button>
            )}
          </div>
        </header>
        <ReadingBody reply={reply} />
        <TopicGate
          user={user}
          currentKind={kind}
          onLogin={onLogin}
          onTopic={onTopic}
        />
      </article>
    </section>
  )
}
