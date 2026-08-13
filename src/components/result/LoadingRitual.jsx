export function LoadingRitual({ resultRef, message }) {
  return (
    <section
      ref={resultRef}
      className="section section-result"
      aria-labelledby="loading-section-title"
      aria-busy="true"
    >
      <div className="result-panel loading-ritual">
        <div className="ink-ring" aria-hidden="true">
          <span className="ink-ring-spin" />
        </div>
        <h2 id="loading-section-title" className="loading-title">
          {message}
        </h2>
        <p className="loading-lead">
          잠시만 기다려 주세요. 성격과 기질을 읽는 중입니다.
        </p>
        <div className="loading-lines" aria-hidden="true">
          <div className="skeleton" />
          <div className="skeleton mid" />
          <div className="skeleton short" />
        </div>
      </div>
    </section>
  )
}
