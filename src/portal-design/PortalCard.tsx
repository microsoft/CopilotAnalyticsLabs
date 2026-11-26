import { forwardRef } from 'react'
import { renderCard_unstable, useCard_unstable, type CardProps } from '@fluentui/react-components'
import './CardSurface.css'

export type PortalCardProps = Omit<CardProps,
  'appearance' | 'size' | 'orientation' | 'focusMode' | 'selected' | 'defaultSelected' |
  'onSelectionChange' | 'checkbox' | 'floatingAction'> & { nested?: boolean | 'filled'; cornerRadius?: 'large' }

// Content cards preserve normal document/tab order; their nested actions remain independent.
export const PortalCard = forwardRef<HTMLDivElement, PortalCardProps>(
  function PortalCard({ role, className, nested = false, cornerRadius, ...props }, ref) {
    const cardProps: CardProps & { 'data-card-surface': 'nested' | 'nested-filled' | 'raised'; 'data-card-radius'?: 'large' } = { ...props, role, focusMode: 'off',
      className: [className, 'portal-card'].filter(Boolean).join(' '),
      'data-card-surface': nested === 'filled' ? 'nested-filled' : nested ? 'nested' : 'raised',
      'data-card-radius': cornerRadius,
    }
    const state = useCard_unstable(cardProps, ref)
    return renderCard_unstable(state, { selectableA11yProps: state.selectableA11yProps })
  },
)
