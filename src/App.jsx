import { parseRankIdFromPath, parseShareIdFromPath } from './lib/share'
import { HomePage } from './pages/HomePage'
import { RankPage } from './pages/RankPage'
import { SharedResultPage } from './pages/SharedResultPage'

export default function App() {
  const pathname = window.location.pathname
  const rankId = parseRankIdFromPath(pathname)
  if (rankId) return <RankPage hostId={rankId} />
  const shareId = parseShareIdFromPath(pathname)
  return shareId ? <SharedResultPage shareId={shareId} /> : <HomePage />
}
