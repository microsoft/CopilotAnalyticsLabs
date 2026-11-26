import { Tooltip } from '@fluentui/react-components'
import { Info16Regular } from '@fluentui/react-icons'
import { PortalButton } from './PortalButton'
import './PortalInfo.css'

type PortalInfoProps = {
  /** What the help explains; the button is named "About {label}". */
  label: string
  content: string
  className?: string
}

/** Inline help: a 16px info icon placed right after the text it explains, with an arrowed tooltip. */
export function PortalInfo({ label, content, className = '' }: PortalInfoProps) {
  return (
    <Tooltip content={content} relationship="description" withArrow
      positioning={{ position: 'below', fallbackPositions: ['before', 'after', 'above'] }}>
      <PortalButton variant="chrome" type="button" className={`portal-info ${className}`.trim()}
        aria-label={`About ${label}`}>
        <Info16Regular aria-hidden="true" />
      </PortalButton>
    </Tooltip>
  )
}
