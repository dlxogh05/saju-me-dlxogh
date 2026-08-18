import { useEffect, useRef, useState } from 'react'
import { askGemini } from '../api/gemini'
import { LOADING_MESSAGES } from '../constants/reading'
import { buildSajuPrompt } from '../lib/buildSajuPrompt'
import {
  hasGuestOnboarded,
  readStoredGuest,
  writeStoredGuest,
} from '../lib/guestStorage'
import { findReusableReading, isOwnChart, pickDefaultReading } from '../lib/natal'
import { joinBirth, normalizeBirthTime, onlyDigits, splitBirth } from '../lib/profile'
import {
  READING_SELECT,
  displayNameFromReading,
  readingSubjectFromSource,
  sourceFromReading,
} from '../lib/readingSubject'
import {
  clearPendingResult,
  rankUrl,
  readPendingResult,
  resultShareUrl,
  writePendingResult,
} from '../lib/share'
import { fetchReadingsCount } from '../lib/stats'
import { supabase } from '../lib/supabase'
import { useToast } from './useToast'

export function useHomePage() {
  const storedGuest = readStoredGuest()
  const storedBirth = splitBirth(storedGuest?.birth ?? '')
  const [name, setName] = useState(storedGuest?.name ?? '')
  const [year, setYear] = useState(storedBirth.year)
  const [month, setMonth] = useState(storedBirth.month)
  const [day, setDay] = useState(storedBirth.day)
  const [time, setTime] = useState(storedGuest?.birth_time ?? '')
  const [gender, setGender] = useState(storedGuest?.gender ?? 'male')
  const [calendar, setCalendar] = useState(storedGuest?.calendar ?? '양력')
  const [reply, setReply] = useState(() => readPendingResult()?.reply ?? '')
  const [resultName, setResultName] = useState(
    () => readPendingResult()?.resultName ?? '',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const [readings, setReadings] = useState([])
  const [activeReadingId, setActiveReadingId] = useState(null)
  const [activeShareId, setActiveShareId] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileReady, setProfileReady] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [heroShift, setHeroShift] = useState(0)
  const [readingsCount, setReadingsCount] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [guestInfoReady, setGuestInfoReady] = useState(() => hasGuestOnboarded())
  const [subjectMode, setSubjectMode] = useState('me')
  const [activeKind, setActiveKind] = useState('basic')
  const { toast, toastLeaving, showToast } = useToast()

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)
  const resultRef = useRef(null)
  const formSectionRef = useRef(null)
  const pendingSavedRef = useRef(false)
  const lastSubjectRef = useRef(null)
  const profileGenRef = useRef(0)
  const didAutoOpenRef = useRef(false)
  const skipAutoOpenRef = useRef(Boolean(readPendingResult()?.reply))

  const birth = joinBirth(year, month, day)
  const showGuestOnboarding = Boolean(
    sessionReady && !user && !guestInfoReady,
  )
  const isOnboarding = Boolean(
    (user && profileReady && !profile && !profileError) || showGuestOnboarding,
  )
  const heroOffset = isOnboarding ? 0 : heroShift

  useEffect(() => {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  }, [])

  async function bootstrapUser(userId, gen) {
    setProfileReady(false)
    setProfileError('')
    const [profileRes, readingsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('name, birth, birth_time, gender, calendar')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('readings')
        .select(READING_SELECT)
        .order('created_at', { ascending: false }),
    ])

    if (gen !== profileGenRef.current) return

    if (readingsRes.error) {
      console.error(readingsRes.error)
      setError('기록을 불러오지 못했습니다.')
    }

    if (profileRes.error) {
      console.error(profileRes.error)
      setProfile(null)
      setProfileError('프로필을 불러오지 못했습니다.')
      setModalMode(null)
      setProfileReady(true)
      return
    }

    const nextProfile = profileRes.data ?? null
    const nextReadings = readingsRes.data ?? []
    setProfile(nextProfile)
    setProfileError('')
    setReadings(nextReadings)
    setModalMode(nextProfile ? null : 'onboarding')

    if (!didAutoOpenRef.current && !skipAutoOpenRef.current) {
      const picked = pickDefaultReading(nextReadings, nextProfile)
      if (picked) {
        didAutoOpenRef.current = true
        setActiveReadingId(picked.id)
        setActiveShareId(picked.share_id ?? null)
        setResultName(displayNameFromReading(picked))
        setReply(picked.result)
        setActiveKind(
          picked.kind === 'wealth' || picked.kind === 'love'
            ? picked.kind
            : 'basic',
        )
        lastSubjectRef.current = {
          subject_name: picked.subject_name,
          subject_birth: picked.subject_birth,
          subject_birth_time: picked.subject_birth_time,
          subject_gender: picked.subject_gender,
          subject_calendar: picked.subject_calendar,
        }
      }
    }

    setProfileReady(true)
  }

  useEffect(() => {
    let cancelled = false

    function applySession(session, event) {
      if (event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        setSessionReady(true)
        return
      }
      const nextUser = session?.user ?? null
      setUser(nextUser)
      setSessionReady(true)
      if (!nextUser) {
        setReadings([])
        setActiveReadingId(null)
        setActiveShareId(null)
        setProfile(null)
        setProfileReady(true)
        setModalMode(null)
        setProfileError('')
        setSubjectMode('me')
        didAutoOpenRef.current = false
        return
      }
      const gen = ++profileGenRef.current
      window.setTimeout(() => {
        if (cancelled || gen !== profileGenRef.current) return
        bootstrapUser(nextUser.id, gen)
      }, 0)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      applySession(session, event)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchReadingsCount(supabase).then((count) => {
      if (!cancelled) setReadingsCount(count)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isOnboarding) return undefined
    function onScroll() {
      setHeroShift(window.scrollY * 0.28)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isOnboarding])

  async function handleGoogleLogin() {
    setError('')
    if (reply) {
      writePendingResult(reply, resultName, lastSubjectRef.current)
    }
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
    setActiveShareId(null)
    setReadings([])
    setProfile(null)
    setModalMode(null)
    setProfileReady(true)
    setSubjectMode('me')
    setActiveKind('basic')
    lastSubjectRef.current = null
    clearPendingResult()
  }

  useEffect(() => {
    if (!loading) return undefined
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

  function handleNewReading() {
    if (!user) return
    if (activeReadingId === null && !reply) {
      showToast('이미 사주 해석 화면입니다')
      return
    }
    setActiveReadingId(null)
    setActiveShareId(null)
    setReply('')
    setResultName('')
    setError('')
    setSubjectMode('me')
    setActiveKind('basic')
    clearPendingResult()
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSelectReading(reading) {
    setActiveReadingId(reading.id)
    setActiveShareId(reading.share_id ?? null)
    setResultName(displayNameFromReading(reading))
    setReply(reading.result)
    setActiveKind(reading.kind === 'wealth' || reading.kind === 'love' ? reading.kind : 'basic')
    setError('')
    setLoading(false)
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function handleDeleteReading(reading, e) {
    e.stopPropagation()
    if (!user) {
      setError('로그인한 뒤에만 삭제할 수 있습니다.')
      return
    }
    const ok = window.confirm('이 기록을 삭제할까요?')
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
      setActiveShareId(null)
      setReply('')
      setResultName('')
      setActiveKind('basic')
    }
  }

  async function handleSaveProfile(payload) {
    if (!user) return
    setProfileSaving(true)
    setProfileError('')
    const { data, error: saveError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: payload.name,
        birth: payload.birth,
        birth_time: normalizeBirthTime(payload.birth_time),
        gender: payload.gender,
        calendar: payload.calendar,
      })
      .select('name, birth, birth_time, gender, calendar')
      .single()

    setProfileSaving(false)

    if (saveError) {
      console.error(saveError)
      setProfileError('프로필 저장에 실패했습니다.')
      return
    }

    setProfile(data)
    setModalMode(null)
  }

  function handleGuestOnboardingSave(payload) {
    const parts = splitBirth(payload.birth)
    setName(payload.name)
    setYear(parts.year)
    setMonth(parts.month)
    setDay(parts.day)
    setTime(normalizeBirthTime(payload.birth_time))
    setGender(payload.gender)
    setCalendar(payload.calendar)
    writeStoredGuest(payload)
    setGuestInfoReady(true)
    handleAsk(null, {
      name: payload.name,
      birth: payload.birth,
      time: normalizeBirthTime(payload.birth_time),
      gender: payload.gender,
      calendar: payload.calendar,
    })
  }

  function handleCancelEdit() {
    if (modalMode === 'edit') setModalMode(null)
  }

  function handleFriendMode() {
    setSubjectMode('friend')
    setName('')
    setYear('')
    setMonth('')
    setDay('')
    setTime('')
    setGender('male')
    setCalendar('양력')
    setError('')
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleBackToMe() {
    setSubjectMode('me')
    setError('')
  }

  useEffect(() => {
    if (!user || !profile || !reply || activeShareId || pendingSavedRef.current) {
      return undefined
    }
    const pending = readPendingResult()
    if (!pending?.reply || pending.reply !== reply) return undefined

    const pendingSubject = pending.subject ?? lastSubjectRef.current
    if (!pendingSubject?.subject_name || !pendingSubject?.subject_birth) {
      return undefined
    }
    lastSubjectRef.current = pendingSubject
    pendingSavedRef.current = true
    supabase
      .from('readings')
      .insert({
        result: reply,
        user_id: user.id,
        kind: 'basic',
        ...pendingSubject,
      })
      .select(READING_SELECT)
      .single()
      .then(({ data, error: saveError }) => {
        if (saveError) {
          console.error(saveError)
          pendingSavedRef.current = false
          setError('해석은 완료됐지만 저장에 실패했습니다. 다시 로그인해 보세요.')
          return
        }
        if (data) {
          setActiveReadingId(data.id)
          setActiveShareId(data.share_id ?? null)
          setReadings((prev) => [data, ...prev])
          clearPendingResult()
        }
      })
  }, [user, profile, reply, activeShareId])

  async function handleShare() {
    if (!user) {
      showToast('로그인하면 결과를 공유할 수 있습니다')
      return
    }
    if (!activeShareId) {
      showToast('저장된 결과만 공유할 수 있습니다')
      return
    }
    const url = resultShareUrl(window.location.origin, activeShareId)
    const title = resultName ? `${resultName}님의 사주` : '사주 해석'
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('공유 링크를 복사했습니다')
    } catch {
      showToast('링크 복사에 실패했습니다')
    }
  }

  function handleTopicAsk(kind) {
    if (!user) {
      handleGoogleLogin()
      return
    }
    const active = readings.find((item) => item.id === activeReadingId)
    const snapshot = active ?? lastSubjectRef.current
    const override = snapshot?.subject_name
      ? sourceFromReading(snapshot)
      : null
    handleAsk(null, override, kind)
  }

  async function handleAsk(e, sourceOverride, kind = 'basic') {
    e?.preventDefault?.()

    if ((kind === 'wealth' || kind === 'love') && !user) {
      handleGoogleLogin()
      return
    }

    const formSource = {
      name: name.trim(),
      birth,
      time: normalizeBirthTime(time),
      gender,
      calendar,
    }
    const source =
      sourceOverride ??
      (user && profile && subjectMode !== 'friend'
        ? {
            name: profile.name,
            birth: profile.birth,
            time: normalizeBirthTime(profile.birth_time),
            gender: profile.gender,
            calendar: profile.calendar,
          }
        : formSource)

    if (user && profile && isOwnChart(profile, source) && subjectMode === 'friend') {
      setSubjectMode('me')
    }

    if (!source.name || !source.birth) {
      setError('이름과 생년월일(연·월·일)을 입력해 주세요.')
      return
    }

    if (user && !profile) {
      setError('프로필을 먼저 저장해 주세요.')
      return
    }

    const reusable = user ? findReusableReading(readings, source, kind) : null
    if (reusable) {
      lastSubjectRef.current = readingSubjectFromSource(source)
      setActiveReadingId(reusable.id)
      setActiveShareId(reusable.share_id ?? null)
      setResultName(displayNameFromReading(reusable))
      setReply(reusable.result)
      setActiveKind(
        reusable.kind === 'wealth' || reusable.kind === 'love'
          ? reusable.kind
          : 'basic',
      )
      setError('')
      setLoading(false)
      return
    }

    const subject = readingSubjectFromSource(source)
    lastSubjectRef.current = subject

    setLoading(true)
    setLoadingMsgIndex(0)
    setError('')
    setReply('')
    setActiveReadingId(null)
    setActiveShareId(null)
    setActiveKind(kind)

    const pairOther =
      user &&
      profile &&
      (kind === 'love' || kind === 'wealth') &&
      !isOwnChart(profile, source)
        ? {
            name: profile.name,
            birth: profile.birth,
            time: normalizeBirthTime(profile.birth_time),
            gender: profile.gender,
            calendar: profile.calendar,
          }
        : undefined

    try {
      const prompt = buildSajuPrompt({ ...source, kind, other: pairOther })
      const text = await askGemini(prompt)
      setReply(text)
      setResultName(source.name)

      if (!user) {
        writePendingResult(text, source.name, subject)
        return
      }

      const { data, error: saveError } = await supabase
        .from('readings')
        .insert({
          result: text,
          user_id: user.id,
          kind,
          ...subject,
        })
        .select(READING_SELECT)
        .single()

      if (saveError) {
        console.error(saveError)
        setError('해석은 완료됐지만 저장에 실패했습니다. 다시 로그인해 보세요.')
        writePendingResult(text, source.name, subject)
      } else if (data) {
        setActiveReadingId(data.id)
        setActiveShareId(data.share_id ?? null)
        setReadings((prev) => [data, ...prev])
        clearPendingResult()
      }
    } catch (err) {
      setError(err.message ?? '요청에 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const activeReading = readings.find((item) => item.id === activeReadingId)
  const showingOwnBasic = Boolean(
    user &&
      profile &&
      activeKind === 'basic' &&
      reply &&
      activeReading &&
      isOwnChart(profile, sourceFromReading(activeReading)),
  )

  function handleOpenRank() {
    if (!user) return
    window.location.assign(rankUrl(window.location.origin, user.id))
  }

  return {
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
    reply,
    resultName,
    loading,
    error,
    loadingMessage: LOADING_MESSAGES[loadingMsgIndex],
    readings,
    activeReadingId,
    user,
    profile,
    profileReady,
    profileError,
    modalMode,
    setModalMode,
    profileSaving,
    toast,
    toastLeaving,
    readingsCount,
    guestInfoReady,
    subjectMode,
    activeKind,
    yearRef,
    monthRef,
    dayRef,
    resultRef,
    formSectionRef,
    showGuestOnboarding,
    isOnboarding,
    heroOffset,
    handleGoogleLogin,
    handleLogout,
    handleYearChange,
    handleMonthChange,
    handleDayChange,
    handleBirthKeyDown,
    handleNewReading,
    handleSelectReading,
    handleDeleteReading,
    handleSaveProfile,
    handleGuestOnboardingSave,
    handleCancelEdit,
    handleFriendMode,
    handleBackToMe,
    handleShare,
    handleAsk,
    handleTopicAsk,
    handleOpenRank,
    showingOwnBasic,
  }
}
