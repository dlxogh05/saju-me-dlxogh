export function Hero({
  titleId = 'hero-title',
  offset = 0,
  readingsCountCopy,
  showScrollHint = false,
  compact = false,
}) {
  return (
    <section
      className={compact ? 'hero hero--shared' : 'hero'}
      aria-labelledby={titleId}
    >
      <img
        className="hero-image"
        src="/hero-hanok.jpg"
        alt=""
        decoding="async"
        style={compact ? undefined : { transform: `translate3d(0, ${offset}px, 0)` }}
      />
      <div className="hero-veil" aria-hidden="true" />
      <div className="hero-content">
        <p className="brand">SAJU ME</p>
        <h1 id={titleId} className="hero-title">
          사주 해석
        </h1>
        {compact ? null : (
          <>
            <p className="hero-lead">
              명식을 펼치면, 성격과 기질이 한 편의 글처럼 읽힙니다.
            </p>
            {readingsCountCopy ? (
              <p className="hero-count">{readingsCountCopy}</p>
            ) : null}
            {showScrollHint ? (
              <p className="hero-scroll-hint">아래로 내려 정보를 입력해 주세요</p>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
