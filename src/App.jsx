import { useEffect, useRef, useState } from 'react'
import { buildSajuPrompt } from './buildSajuPrompt'
import { formatSajuText } from './formatSajuText'
import './App.css'

const LOADING_MESSAGES = [
  '명식을 펼치는 중',
  '기질을 읽는 중',
  '흐름을 맞추는 중',
]

async function askGemini(prompt) {
  const KEY = import.meta.env.VITE_GEMINI_API_KEY
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    'gemini-3.6-flash:generateContent?key=' +
    KEY

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.candidates?.[0]) {
    throw new Error(data.error?.message ?? '사주 해석 요청에 실패했습니다.')
  }

  return data.candidates[0].content.parts[0].text
}

function onlyDigits(value, max) {
  return value.replace(/\D/g, '').slice(0, max)
}

function ReadingBody({ reply }) {
  return (
    <div className="reading-body">
      {formatSajuText(reply).map((item, i) =>
        item.type === 'heading' ? (
          <h4 key={`h-${i}`} className="reading-subhead" style={{ '--i': i }}>
            {item.text}
          </h4>
        ) : (
          <p key={`p-${i}`} style={{ '--i': i }}>
            {item.parts.map((part, j) =>
              part.bold ? (
                <strong key={j}>{part.text}</strong>
              ) : (
                <span key={j}>{part.text}</span>
              ),
            )}
          </p>
        ),
      )}
    </div>
  )
}

function App() {
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [gender, setGender] = useState('male')
  const [calendar, setCalendar] = useState('양력')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)
  const resultRef = useRef(null)

  const birth =
    year.length === 4 && month.length === 2 && day.length === 2
      ? `${year}-${month}-${day}`
      : ''

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0)
      return undefined
    }
    const id = window.setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [loading])

  useEffect(() => {
    if (!(loading || reply)) return
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, reply])

  function handleYearChange(e) {
    const next = onlyDigits(e.target.value, 4)
    setYear(next)
    if (next.length === 4) monthRef.current?.focus()
  }

  function handleMonthChange(e) {
    const next = onlyDigits(e.target.value, 2)
    setMonth(next)
    if (next.length === 2) dayRef.current?.focus()
  }

  function handleDayChange(e) {
    setDay(onlyDigits(e.target.value, 2))
  }

  function handleBirthKeyDown(part, e) {
    if (e.key !== 'Backspace') return
    if (part === 'month' && month === '') {
      e.preventDefault()
      yearRef.current?.focus()
    }
    if (part === 'day' && day === '') {
      e.preventDefault()
      monthRef.current?.focus()
    }
  }

  async function handleAsk(e) {
    e.preventDefault()

    if (!name.trim() || !birth) {
      setError('이름과 생년월일(연·월·일)을 입력해 주세요.')
      return
    }

    setLoading(true)
    setError('')
    setReply('')

    try {
      const prompt = buildSajuPrompt({ name, birth, time, gender, calendar })
      const text = await askGemini(prompt)
      setReply(text)
    } catch (err) {
      setError(err.message ?? '요청에 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src="/hero-hanok.jpg"
          alt=""
          decoding="async"
        />
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-content">
          <p className="brand">SAJU ME</p>
          <h1 id="hero-title" className="hero-title">
            사주 해석
          </h1>
          <p className="hero-lead">
            명식을 펼치면, 성격과 기질이 한 편의 글처럼 읽힙니다.
          </p>
        </div>
      </section>

      <main className="shell">
        <section
          className="section section-form"
          aria-labelledby="form-section-title"
        >
          <div className="section-heading">
            <p className="section-kicker">Input</p>
            <h2 id="form-section-title" className="section-title">
              정보 입력
            </h2>
          </div>

          <form className="form" onSubmit={handleAsk}>
            <fieldset className="form-block" aria-labelledby="basic-info-title">
              <p id="basic-info-title" className="form-block-title">
                기본 정보
              </p>
              <div className="field">
                <label htmlFor="name">이름</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                />
              </div>
              {name.trim() && (
                <p className="name-preview">{name.trim()}님의 사주</p>
              )}
            </fieldset>

            <fieldset className="form-block" aria-labelledby="birth-info-title">
              <p id="birth-info-title" className="form-block-title">
                출생 정보
              </p>

              <div className="field">
                <span className="field-label" id="birth-label">
                  생년월일
                </span>
                <div
                  className="birth-group"
                  role="group"
                  aria-labelledby="birth-label"
                >
                  <input
                    ref={yearRef}
                    id="birth-year"
                    className="birth-year"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-year"
                    placeholder="YYYY"
                    maxLength={4}
                    value={year}
                    onChange={handleYearChange}
                    aria-label="연도 4자리"
                  />
                  <span className="birth-sep" aria-hidden="true">
                    .
                  </span>
                  <input
                    ref={monthRef}
                    id="birth-month"
                    className="birth-month"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-month"
                    placeholder="MM"
                    maxLength={2}
                    value={month}
                    onChange={handleMonthChange}
                    onKeyDown={(e) => handleBirthKeyDown('month', e)}
                    aria-label="월 2자리"
                  />
                  <span className="birth-sep" aria-hidden="true">
                    .
                  </span>
                  <input
                    ref={dayRef}
                    id="birth-day"
                    className="birth-day"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-day"
                    placeholder="DD"
                    maxLength={2}
                    value={day}
                    onChange={handleDayChange}
                    onKeyDown={(e) => handleBirthKeyDown('day', e)}
                    aria-label="일 2자리"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="time">태어난 시간</label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="gender">성별</label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="calendar">달력</label>
                  <select
                    id="calendar"
                    value={calendar}
                    onChange={(e) => setCalendar(e.target.value)}
                  >
                    <option value="양력">양력</option>
                    <option value="음력">음력</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button className="submit" type="submit" disabled={loading}>
              {loading ? '해석 중…' : '내 사주 보기'}
            </button>
          </form>
        </section>

        {loading && (
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
                {LOADING_MESSAGES[loadingMsgIndex]}
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
        )}

        {reply && !loading && (
          <section
            ref={resultRef}
            className="section section-result"
            aria-labelledby="result-section-title"
            aria-live="polite"
          >
            <div className="section-heading">
              <p className="section-kicker">Reading</p>
              <h2 id="result-section-title" className="section-title">
                해석 결과
              </h2>
            </div>

            <article className="result-panel reading">
              <header className="reading-header">
                <p className="reading-kicker">기본 차트 해석</p>
                <h3 className="reading-title">
                  {name.trim() ? `${name.trim()}님의 사주` : '사주 해석'}
                </h3>
              </header>
              <ReadingBody reply={reply} />
            </article>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>사주 해석은 참고용이며, 절대적인 미래 예언이 아닙니다.</p>
      </footer>
    </div>
  )
}

export default App
