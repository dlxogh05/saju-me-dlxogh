import { parseShareIdFromPath } from './lib/share'
import { HomePage } from './pages/HomePage'
import { SharedResultPage } from './pages/SharedResultPage'

export default function App() {
  const shareId = parseShareIdFromPath(window.location.pathname)
  return shareId ? <SharedResultPage shareId={shareId} /> : <HomePage />
}
