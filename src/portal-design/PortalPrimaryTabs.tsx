import type { TabProps } from '@fluentui/react-components'
import { PortalTab, PortalTabList } from './PortalTabs'

/** Page or section tabs with the portal's 28px spacing and 3px selection indicator. Pair with a tabpanel whose id is `panelId`. */
export function PortalPrimaryTabs<Value extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  panelId,
  className = 'service-tabs primary-service-tabs',
}: {
  options: readonly { value: Value; label: string; id: string; icon?: TabProps['icon'] }[]
  value: Value
  onChange: (value: Value) => void
  ariaLabel: string
  panelId: string
  className?: string
}) {
  return (
    <PortalTabList
      className={className}
      aria-label={ariaLabel}
      selectedValue={value}
      onTabSelect={(_, data) => onChange(data.value as Value)}
    >
      {options.map(option => (
        <PortalTab
          className={`service-tab${option.icon ? ' service-tab-with-icon' : ''}${value === option.value ? ' active' : ''}`}
          icon={option.icon}
          value={option.value}
          id={option.id}
          aria-controls={panelId}
          key={option.value}
        >
          {option.label}
        </PortalTab>
      ))}
    </PortalTabList>
  )
}
