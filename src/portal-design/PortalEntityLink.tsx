import { Link } from '@fluentui/react-components'
import type { ComponentPropsWithoutRef } from 'react'
import { typography, type TypographyLayoutStyle } from './typography'
import './PortalEntityLink.css'

type EntityLinkProps = (
  | (Omit<ComponentPropsWithoutRef<'a'>, 'style'> & { href: string })
  | (Omit<ComponentPropsWithoutRef<'button'>, 'style'> & { href?: never })
) & { style?: TypographyLayoutStyle; size?: 'medium' | 'small' }

// Entity destinations are links; in-place details remain native buttons.
export function PortalEntityLink({ className, size = 'medium', ...props }: EntityLinkProps) {
  const classes = ['portal-entity-link', className].filter(Boolean).join(' ')
  return typeof props.href === 'string'
    ? <Link {...props as ComponentPropsWithoutRef<'a'>} {...typography(size === 'small' ? 'metadata' : 'support', size === 'small' ? 'regular' : 'semibold', props.style)} className={classes} />
    : <Link {...props as ComponentPropsWithoutRef<'button'>} {...typography(size === 'small' ? 'metadata' : 'support', size === 'small' ? 'regular' : 'semibold', props.style)} as="button"
      type={props.type === 'submit' || props.type === 'reset' ? props.type : 'button'} className={classes} />
}
