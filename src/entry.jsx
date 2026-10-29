import { createPanel } from './panel.jsx'
import CSS from './styles.js'

const STYLE_ID = 'ge-workbench-electric-safety-style'

function installStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}

try {
  window.addEventListener('error', (event) => {
    try {
      window.__ESA_LAST_ERROR__ = { message: event?.message || String(event?.error || ''), at: new Date().toISOString() }
      console.error('[electric-safety] window error', event?.error || event?.message)
    } catch {
      /* diagnostics must never throw */
    }
  })
  window.addEventListener('unhandledrejection', (event) => {
    try {
      window.__ESA_LAST_ERROR__ = { message: String(event?.reason || ''), at: new Date().toISOString() }
      console.error('[electric-safety] unhandled rejection', event?.reason)
    } catch {
      /* diagnostics must never throw */
    }
  })
} catch {
  /* ignore listener registration failures */
}

window.__ModuleLoader__.load({
  id: 'ge-workbench-electric-safety',
  factory: (req) => {
    const React = req('react')
    installStyles()
    return createPanel(React)
  },
})