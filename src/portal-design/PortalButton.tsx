import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { renderButton_unstable, useButton_unstable } from '@fluentui/react-components'
import { typography, type TypographyEmphasis, type TypographyLayoutStyle } from './typography'

export type PortalButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'style'> & {
  style?: TypographyLayoutStyle
  variant?: 'primary' | 'secondary' | 'subtle' | 'chrome' | 'inline'
  emphasis?: TypographyEmphasis
  tone?: 'brand'
  disabledAppearance?: 'brand'
  disabledFocusable?: boolean
  iconOnly?: boolean
  shape?: 'circular'
}

const variantClasses = {
  primary: 'primary-button',
  secondary: 'secondary-button',
  subtle: 'tertiary-button',
  inline: 'inline-action-button',
  chrome: '',
} as const

// Fluent owns button behavior and rendering; portal variants own the approved styling.
export const PortalButton = forwardRef<HTMLButtonElement, PortalButtonProps>(
  function PortalButton({ variant = 'secondary', emphasis, tone, disabledAppearance, iconOnly = false, className, ...props }, ref) {
    const buttonProps = {
      ...props,
      ...typography(variant === 'inline' ? 'reading' : 'control',
        emphasis ?? (variant === 'chrome' ? undefined : variant === 'inline' ? 'regular' : 'semibold'), props.style),
      'data-icon-only': iconOnly || undefined,
      'data-disabled-appearance': variant === 'inline' && tone === 'brand' ? disabledAppearance : undefined,
      'data-shape': props.shape,
      className: [variantClasses[variant], tone === 'brand' && 'portal-brand-action', className].filter(Boolean).join(' ') || undefined,
    }
    const state = useButton_unstable(buttonProps, ref)
    return renderButton_unstable(state)
  },
)
