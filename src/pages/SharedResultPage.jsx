import { useEffect, useState } from 'react'
import { Hero } from '../components/layout/Hero'
import { SiteFooter } from '../components/layout/SiteFooter'
import { ReadingBody } from '../components/result/ReadingBody'
import { SectionHeading } from '../components/ui/SectionHeading'
import { supabase } from '../lib/supabase'

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
      <Hero titleId="shared-title" compact />

      <main className="shell shared-result-shell">
        {loading && <p className="sidebar-empty">해석을 불러오는 중</p>}

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
            <SectionHeading
              kicker="Reading"
              title="해석 결과"
              titleId="shared-result-title"
            />
            <img
              className="mascot mascot--body"
              src="/mascot.png"
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            <article className="result-panel reading">
              <header className="reading-header">
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

      <SiteFooter />
    </div>
  )
}
