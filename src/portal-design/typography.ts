import type { CSSProperties } from 'react'

export const typographyRoles = [
  'page-title', 'section-title', 'card-title', 'reading', 'control', 'table',
  'support', 'metadata', 'badge', 'metric', 'metric-unit', 'metric-compact', 'story-title',
  'metric-featured', 'metric-featured-compact', 'metric-editorial', 'step-title',
] as const

export type TypographyRole = typeof typographyRoles[number]
export type TypographyEmphasis = 'regular' | 'semibold'
export type TypographyLayoutStyle = Omit<CSSProperties,
  'font' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'fontStyle' | 'lineHeight'>

const typeProperties = new Set(['font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight'])

// A complete role owns the font; layout styles pass through but cannot repaint it.
export function typography(role: TypographyRole, emphasis?: TypographyEmphasis, layout?: TypographyLayoutStyle) {
  const arrangement = Object.fromEntries(
    Object.entries(layout ?? {}).filter(([property]) => !typeProperties.has(property)),
  ) as CSSProperties
  const stateful = role === 'control' || role === 'table'
  return {
    'data-typography': role,
    style: {
      ...arrangement,
      ...(stateful ? {
        fontFamily: 'var(--type-family)',
        fontSize: 'var(--type-support-size)',
        lineHeight: 'var(--type-support-line-height)',
      } : { font: `var(--type-${role})` }),
      ...(emphasis ? { fontWeight: `var(--type-weight-${emphasis})` } : {}),
    } satisfies CSSProperties,
  }
}
