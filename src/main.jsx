import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SharedResultPage } from './components/SharedResultPage.jsx'
import { parseShareIdFromPath } from './lib/share.js'
import './index.css'
import App from './App.jsx'

const shareId = parseShareIdFromPath(window.location.pathname)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {shareId ? <SharedResultPage shareId={shareId} /> : <App />}
  </StrictMode>,
)
