import { useEffect, useState } from 'react'
import { ReadingBody } from './ReadingBody'
import { supabase } from '../lib/supabase'
import '../App.css'

export function SharedResultPage({ shareId }) {
  const [name, setName] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_shared_reading', { p_share_id: shareId })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error(error)
          setMissing(true)
          setLoading(false)
          return
        }
        const row = Array.isArray(data) ? data[0] : data
        if (!row?.result) {
          setMissing(true)
          setLoading(false)
          return
        }
        setName(row.name ?? '')
        setResult(row.result)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [shareId])

  return (
    <div className="page shared-result-page">
      <section className="hero hero--shared" aria-labelledby="shared-title">
        <img
          className="hero-image"
          src="/hero-hanok.jpg"
          alt=""
          decoding="async"
        />
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-content">
          <p className="brand">SAJU ME</p>
          <h1 id="shared-title" className="hero-title">
            사주 해석
          </h1>
        </div>
      </section>

      <main className="shell shared-result-shell">
        {loading && (
          <p className="sidebar-empty">해석을 불러오는 중</p>
        )}

        {!loading && missing && (
          <section className="section">
            <p className="form-error" role="alert">
              공유된 사주를 찾지 못했습니다. 링크가 잘못되었거나 삭제된 기록입니다.
            </p>
            <p>
              <a className="auth-button is-primary" href="/">
                SAJU ME 열기
              </a>
            </p>
          </section>
        )}

        {!loading && result && (
          <section
            className="section section-result"
            aria-labelledby="shared-result-title"
          >
            <div className="section-heading">
              <p className="section-kicker">Reading</p>
              <h2 id="shared-result-title" className="section-title">
                해석 결과
              </h2>
            </div>
            <article className="result-panel reading">
              <header className="reading-header">
                <img
                  className="mascot mascot--reading"
                  src="/mascot.png"
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                />
                <div className="reading-header-text">
                  <p className="reading-kicker">기본 차트 해석</p>
                  <h3 className="reading-title">
                    {name ? `${name}님의 사주` : '사주 해석'}
                  </h3>
                </div>
              </header>
              <ReadingBody reply={result} />
            </article>
            <p className="shared-result-cta">
              <a className="submit shared-result-home" href="/">
                내 사주도 보기
              </a>
            </p>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>사주 해석은 참고용이며, 절대적인 미래 예언이 아닙니다.</p>
      </footer>
    </div>
  )
}
