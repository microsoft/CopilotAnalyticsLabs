import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PortalThemeProvider } from './portal-design'
import './labs.css'
import Root from './Root.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalThemeProvider>
      <Root />
    </PortalThemeProvider>
  </StrictMode>,
)
