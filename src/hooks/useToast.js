import { useEffect, useRef, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState('')
  const [toastLeaving, setToastLeaving] = useState(false)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current)
  }, [])

  function showToast(message) {
    setToast(message)
    setToastLeaving(false)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setToastLeaving(true)
      toastTimerRef.current = window.setTimeout(() => {
        setToast('')
        setToastLeaving(false)
      }, 280)
    }, 2400)
  }

  return { toast, toastLeaving, showToast }
}
