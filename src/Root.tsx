import { useEffect, useRef, useState } from 'react'
import App from './App.tsx'
import TemplatesPage from './TemplatesPage.tsx'
import CodesPage from './CodesPage.tsx'
import ResearchPage from './ResearchPage.tsx'
import UpdatesPage from './UpdatesPage.tsx'
import { DisclaimerBar } from './DisclaimerBar.tsx'
import { SiteHeader } from './SiteHeader.tsx'
import { SiteFooter } from './SiteFooter.tsx'
import { trackPageview } from './telemetry.ts'

function getRoute(): string {
  return window.location.hash.replace(/^#/, '')
}

function resolvePage(route: string) {
  switch (route) {
    case '/templates': return { path: route, content: <TemplatesPage /> }
    case '/codes': return { path: route, content: <CodesPage /> }
    case '/research': return { path: route, content: <ResearchPage /> }
    case '/updates': return { path: route, content: <UpdatesPage /> }
    default: return { path: '/', content: <App /> }
  }
}

// Auto-reload the page once it has been left open for a full day so users
// always land on fresh content.
const RELOAD_AFTER_MS = 24 * 60 * 60 * 1000

export default function Root() {
  const [route, setRoute] = useState(getRoute())
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    const onHashChange = () => {
      window.scrollTo(0, 0)
      setRoute(getRoute())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.reload()
    }, RELOAD_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const { path, content } = resolvePage(route)
  useEffect(() => {
    if (lastTrackedPath.current === path) return
    trackPageview(path, lastTrackedPath.current === null)
    lastTrackedPath.current = path
  }, [path])

  return (
    <div className="labs-app">
      <DisclaimerBar />
      <SiteHeader />
      <main className="labs-main">{content}</main>
      <SiteFooter />
    </div>
  )
}
