import { useEffect, useRef, useState } from 'react'
import { buildSajuPrompt } from './buildSajuPrompt'
import { formatSajuText } from './formatSajuText'
import { supabase } from './lib/supabase'
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
  const [resultName, setResultName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const [readings, setReadings] = useState([])
  const [activeReadingId, setActiveReadingId] = useState(null)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)
  const resultRef = useRef(null)

  const birth =
    year.length === 4 && month.length === 2 && day.length === 2
      ? `${year}-${month}-${day}`
      : ''

  async function loadReadings() {
    const { data, error: fetchError } = await supabase
      .from('readings')
      .select('id, name, result, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error(fetchError)
      setError('기록을 불러오지 못했습니다.')
      return
    }

    setReadings(data ?? [])
  }

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authReady) return
    if (!user) {
      setReadings([])
      setActiveReadingId(null)
      return
    }
    loadReadings()
  }, [authReady, user])

  async function handleGoogleLogin() {
    setError('')
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (oauthError) {
      console.error(oauthError)
      setError('Google 로그인에 실패했습니다.')
    }
  }

  async function handleLogout() {
    setError('')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error(signOutError)
      setError('로그아웃에 실패했습니다.')
      return
    }
    setReply('')
    setResultName('')
    setActiveReadingId(null)
    setReadings([])
  }

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

  function handleSelectReading(reading) {
    setActiveReadingId(reading.id)
    setResultName(reading.name)
    setReply(reading.result)
    setError('')
    setLoading(false)
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function handleRenameReading(reading, e) {
    e.stopPropagation()
    if (!user) {
      setError('로그인한 뒤에만 수정할 수 있습니다.')
      return
    }
    const next = window.prompt('이름을 수정하세요', reading.name)
    if (next == null) return
    const trimmed = next.trim()
    if (!trimmed || trimmed === reading.name) return

    const { data, error: updateError } = await supabase
      .from('readings')
      .update({ name: trimmed })
      .eq('id', reading.id)
      .select('id, name, result, created_at')
      .single()

    if (updateError) {
      console.error(updateError)
      setError('이름 수정에 실패했습니다.')
      return
    }

    setReadings((prev) =>
      prev.map((item) => (item.id === reading.id ? data : item)),
    )
    if (activeReadingId === reading.id) {
      setResultName(data.name)
    }
  }

  async function handleDeleteReading(reading, e) {
    e.stopPropagation()
    if (!user) {
      setError('로그인한 뒤에만 삭제할 수 있습니다.')
      return
    }
    const ok = window.confirm(`「${reading.name}」기록을 삭제할까요?`)
    if (!ok) return

    const { error: deleteError } = await supabase
      .from('readings')
      .delete()
      .eq('id', reading.id)

    if (deleteError) {
      console.error(deleteError)
      setError('삭제에 실패했습니다.')
      return
    }

    setReadings((prev) => prev.filter((item) => item.id !== reading.id))
    if (activeReadingId === reading.id) {
      setActiveReadingId(null)
      setReply('')
      setResultName('')
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
    setResultName('')
    setActiveReadingId(null)

    try {
      const trimmedName = name.trim()
      const prompt = buildSajuPrompt({
        name: trimmedName,
        birth,
        time,
        gender,
        calendar,
      })
      const text = await askGemini(prompt)
      setReply(text)
      setResultName(trimmedName)

      if (!user) {
        return
      }

      const { data, error: saveError } = await supabase
        .from('readings')
        .insert({
          name: trimmedName,
          birth,
          birth_time: time || '',
          gender,
          calendar,
          result: text,
          user_id: user.id,
        })
        .select('id, name, result, created_at')
        .single()

      if (saveError) {
        console.error(saveError)
        setError('해석은 완료됐지만 저장에 실패했습니다. 다시 로그인해 보세요.')
      } else if (data) {
        setActiveReadingId(data.id)
        setReadings((prev) => [data, ...prev])
      }
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

      <div className="layout">
        <aside className="sidebar" aria-labelledby="sidebar-title">
          <div className="auth-bar">
            {user ? (
              <>
                <p className="auth-email" title={user.email ?? ''}>
                  {user.email ?? '로그인됨'}
                </p>
                <button
                  type="button"
                  className="auth-button"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                type="button"
                className="auth-button is-primary"
                onClick={handleGoogleLogin}
              >
                Google로 로그인
              </button>
            )}
          </div>

          <p className="section-kicker">Saved</p>
          <h2 id="sidebar-title" className="sidebar-title">
            저장된 사주
          </h2>
          {!user ? (
            <p className="sidebar-empty">
              로그인하면 과거 기록이 여기에 남습니다. 비로그인 해석은 새로고침 후
              사라집니다.
            </p>
          ) : readings.length === 0 ? (
            <p className="sidebar-empty">아직 저장된 기록이 없습니다.</p>
          ) : (
            <ul className="reading-list">
              {readings.map((reading) => (
                <li key={reading.id} className="reading-row">
                  <button
                    type="button"
                    className={
                      reading.id === activeReadingId
                        ? 'reading-item is-active'
                        : 'reading-item'
                    }
                    onClick={() => handleSelectReading(reading)}
                  >
                    {reading.name}
                  </button>
                  <div className="reading-actions">
                    <button
                      type="button"
                      className="reading-action"
                      onClick={(e) => handleRenameReading(reading, e)}
                      aria-label={`${reading.name} 이름 수정`}
                      title="이름 수정"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="reading-action is-danger"
                      onClick={(e) => handleDeleteReading(reading, e)}
                      aria-label={`${reading.name} 삭제`}
                      title="삭제"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

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

              <article
                key={activeReadingId ?? 'live'}
                className="result-panel reading"
              >
                <header className="reading-header">
                  <p className="reading-kicker">기본 차트 해석</p>
                  <h3 className="reading-title">
                    {resultName ? `${resultName}님의 사주` : '사주 해석'}
                  </h3>
                </header>
                <ReadingBody reply={reply} />
              </article>
            </section>
          )}
        </main>
      </div>

      <footer className="site-footer">
        <p>사주 해석은 참고용이며, 절대적인 미래 예언이 아닙니다.</p>
      </footer>
    </div>
  )
}

export default App
