export function Toast({ message, leaving }) {
  if (!message) return null

  return (
    <div className={leaving ? 'app-toast is-leaving' : 'app-toast'} role="status">
      {message}
    </div>
  )
}
