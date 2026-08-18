import { useEffect, useRef, useState } from 'react'
import { comparePair, sortCircle } from '../lib/circlePair'
import { readCircleMine, writeCircleMine } from '../lib/circleStorage'
import { isOwnChart } from '../lib/natal'
import {
  joinBirth,
  normalizeBirthTime,
  onlyDigits,
  splitBirth,
  validateProfile,
} from '../lib/profile'
import { rankUrl } from '../lib/share'
import { supabase } from '../lib/supabase'
import { useToast } from './useToast'

function sourceFromForm({ name, year, month, day, time, gender, calendar }) {
  return {
    name: name.trim(),
    birth: joinBirth(year, month, day),
    time: normalizeBirthTime(time),
    gender,
    calendar,
  }
}

function entryFromPair(name, pair, extra = {}) {
  return {
    name,
    relation: pair.relation,
    score: pair.score,
    epithet: pair.rank.epithet,
    line: pair.rank.line,
    love_title: pair.love.title,
    love_line: pair.love.line,
    wealth_title: pair.wealth.title,
    wealth_line: pair.wealth.line,
    ...extra,
  }
}

export function useRankPage(hostId) {
  const [host, setHost] = useState(null)
  const [missing, setMissing] = useState(false)
  const [loadingHost, setLoadingHost] = useState(true)
  const [user, setUser] = useState(null)
  const [entries, setEntries] = useState([])
  const [mine, setMine] = useState(() => readCircleMine(hostId))
  const [tab, setTab] = useState('lineup')
  const [selectedId, setSelectedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { toast, toastLeaving, showToast } = useToast()

  const stored = splitBirth(mine?.birth ?? '')
  const [name, setName] = useState(mine?.name ?? '')
  const [year, setYear] = useState(stored.year)
  const [month, setMonth] = useState(stored.month)
  const [day, setDay] = useState(stored.day)
  const [time, setTime] = useState(mine?.birth_time ?? '')
  const [gender, setGender] = useState(mine?.gender ?? 'male')
  const [calendar, setCalendar] = useState(mine?.calendar ?? '양력')
  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)

  const isHost = Boolean(user && host && user.id === host.id)
  const canSeeRanks = Boolean(user)
  const ranked = sortCircle(user ? entries : [])
  const selected =
    ranked.find((row) => row.id === selectedId) ??
    ranked.find((row) => row.id === mine?.id) ??
    mine

  useEffect(() => {
    let cancelled = false
    supabase
      .rpc('get_circle_host', { p_host_id: hostId })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          console.error(fetchError)
          setMissing(true)
          setLoadingHost(false)
          return
        }
        const row = Array.isArray(data) ? data[0] : data
        if (!row?.id) {
          setMissing(true)
          setLoadingHost(false)
          return
        }
        setHost({
          ...row,
          birth: String(row.birth).slice(0, 10),
        })
        setLoadingHost(false)
      })
    return () => {
      cancelled = true
    }
  }, [hostId])

  useEffect(() => {
    let cancelled = false
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return undefined
    let cancelled = false
    supabase
      .from('circle_entries')
      .select(
        'id, name, relation, score, epithet, line, love_title, love_line, wealth_title, wealth_line, created_at',
      )
      .eq('host_id', hostId)
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          console.error(fetchError)
          setError('줄을 불러오지 못했습니다.')
          return
        }
        setEntries(data ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [user, hostId])

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

  async function handleGoogleLogin() {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    })
    if (oauthError) {
      console.error(oauthError)
      setError('Google 로그인에 실패했습니다.')
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (!host) return
    const source = sourceFromForm({
      name,
      year,
      month,
      day,
      time,
      gender,
      calendar,
    })
    const message = validateProfile({
      ...source,
      birth_time: source.time,
    })
    if (message) {
      setError(message)
      return
    }
    if (isOwnChart(host, source)) {
      setError('호스트와 같은 원국입니다. 내 사주 화면으로 가 주세요.')
      return
    }
    const pair = comparePair(host, source)
    if (pair.isSelf) {
      setError('호스트와 같은 원국입니다. 내 사주 화면으로 가 주세요.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      p_host_id: hostId,
      p_name: source.name,
      p_birth: source.birth,
      p_birth_time: source.time,
      p_gender: source.gender,
      p_calendar: source.calendar,
      p_relation: pair.relation,
      p_score: pair.score,
      p_epithet: pair.rank.epithet,
      p_line: pair.rank.line,
      p_love_title: pair.love.title,
      p_love_line: pair.love.line,
      p_wealth_title: pair.wealth.title,
      p_wealth_line: pair.wealth.line,
    }
    const { data, error: saveError } = await supabase.rpc(
      'submit_circle_entry',
      payload,
    )
    setSaving(false)
    if (saveError) {
      console.error(saveError)
      setError('줄에 서지 못했습니다. 잠시 후 다시 시도해 주세요.')
      return
    }
    const row = Array.isArray(data) ? data[0] : data
    const saved = entryFromPair(source.name, pair, {
      id: row?.id,
      birth: source.birth,
      birth_time: source.time,
      gender: source.gender,
      calendar: source.calendar,
    })
    setMine(saved)
    writeCircleMine(hostId, saved)
    setSelectedId(saved.id ?? null)
    if (user) {
      setEntries((prev) => {
        const next = prev.filter((item) => item.id !== saved.id)
        return [...next, saved]
      })
    }
  }

  async function handleShareInvite() {
    const url = rankUrl(window.location.origin, hostId)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${host?.name ?? ''}님의 줄 세우기`,
          text: `${host?.name ?? ''}님의 줄에 서 보세요`,
          url,
        })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('초대 링크를 복사했습니다')
    } catch {
      showToast('링크 복사에 실패했습니다')
    }
  }

  return {
    host,
    missing,
    loadingHost,
    user,
    isHost,
    canSeeRanks,
    ranked,
    mine,
    selected,
    tab,
    setTab,
    setSelectedId,
    saving,
    error,
    toast,
    toastLeaving,
    name,
    setName,
    year,
    month,
    day,
    time,
    setTime,
    gender,
    setGender,
    calendar,
    setCalendar,
    yearRef,
    monthRef,
    dayRef,
    handleYearChange,
    handleMonthChange,
    handleDayChange,
    handleBirthKeyDown,
    handleGoogleLogin,
    handleSubmit,
    handleShareInvite,
  }
}
