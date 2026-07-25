import { useEffect, useState } from 'react'
import App from './App.tsx'
import TemplatesPage from './TemplatesPage.tsx'
import CodesPage from './CodesPage.tsx'
import ResearchPage from './ResearchPage.tsx'
import { DisclaimerBar } from './DisclaimerBar.tsx'
import { SiteHeader } from './SiteHeader.tsx'
import { SiteFooter } from './SiteFooter.tsx'

function getRoute(): string {
  return window.location.hash.replace(/^#/, '')
}

// Auto-reload the page once it has been left open for a full day so users
// always land on fresh content.
const RELOAD_AFTER_MS = 24 * 60 * 60 * 1000

export default function Root() {
  const [route, setRoute] = useState(getRoute())

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

  let page
  if (route === '/templates') page = <TemplatesPage />
  else if (route === '/codes') page = <CodesPage />
  else if (route === '/research') page = <ResearchPage />
  else page = <App />

  return (
    <>
      <DisclaimerBar />
      <SiteHeader />
      {page}
      <SiteFooter />
    </>
  )
}
