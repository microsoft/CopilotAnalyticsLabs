import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react'
import { typography, type TypographyEmphasis, type TypographyLayoutStyle, type TypographyRole } from './typography'

type TextElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'strong' | 'small' | 'dt' | 'dd'
type PortalTextProps<T extends TextElement> = Omit<ComponentPropsWithRef<T>, 'as' | 'style' | 'children'> & {
  as?: T
  textRole: TypographyRole
  emphasis?: TypographyEmphasis
  tone?: 'secondary' | 'muted'
  style?: TypographyLayoutStyle
  children?: ReactNode
}

/** Text with a complete portal type role; choose the element for semantics and the role for appearance. */
export function PortalText<T extends TextElement = 'span'>({
  as, textRole, emphasis, tone, style, children, ...props
}: PortalTextProps<T>) {
  return createElement(as ?? 'span', { ...props, ...typography(textRole, emphasis, style), 'data-text-tone': tone }, children)
}
