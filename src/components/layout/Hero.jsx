export function Hero({
  titleId = 'hero-title',
  offset = 0,
  atmosphere = false,
  compact = false,
}) {
  const showCopy = !atmosphere && !compact

  return (
    <section
      className={[
        'hero',
        compact ? 'hero--shared' : '',
        atmosphere ? 'hero--atmosphere' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={showCopy ? titleId : undefined}
      aria-hidden={atmosphere ? true : undefined}
    >
      <img
        className="hero-image"
        src="/hero-hanok.jpg"
        alt=""
        decoding="async"
        style={
          compact || atmosphere || !offset
            ? undefined
            : { transform: `translate3d(0, ${offset}px, 0)` }
        }
      />
      <div className="hero-veil" aria-hidden="true" />
      {showCopy ? (
        <div className="hero-content">
          <p className="brand">SAJU ME</p>
          <h1 id={titleId} className="hero-title">
            사주 해석
          </h1>
        </div>
      ) : null}
    </section>
  )
}
