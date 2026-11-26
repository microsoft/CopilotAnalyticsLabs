import { useLayoutEffect, useSyncExternalStore, type ReactNode } from 'react'
import { FluentProvider, teamsHighContrastTheme, webDarkTheme, webLightTheme, type Theme } from '@fluentui/react-components'
import { typography } from './typography'
import './base.css'

/* Replaces <FluentProvider theme={webLightTheme}>. Fluent keeps behavior and accessibility; the
   portal's tokens and type roles own appearance. Bold maps to semibold (600) everywhere. */

export type PortalAppearance = 'light' | 'dark' | 'high-contrast' | 'system'
type ResolvedTheme = 'light' | 'dark' | 'high-contrast' | 'forced-colors'

const emphasisTypography = {
  fontWeightBold: webLightTheme.fontWeightSemibold,
  fontWeightMedium: webLightTheme.fontWeightRegular,
}

const roleTypography = {
  fontFamilyBase: 'var(--type-family)',
  fontFamilyNumeric: 'var(--type-family)',
  fontSizeBase100: 'var(--type-metadata-size)',
  lineHeightBase100: 'var(--type-metadata-line-height)',
  fontSizeBase200: 'var(--type-metadata-size)',
  lineHeightBase200: 'var(--type-metadata-line-height)',
  fontSizeBase300: 'var(--type-support-size)',
  lineHeightBase300: 'var(--type-support-line-height)',
  fontSizeBase400: 'var(--type-reading-size)',
  lineHeightBase400: 'var(--type-reading-line-height)',
}

function accentRoles(hover: string, pressed: string) {
  return {
    colorBrandForegroundLink: 'var(--color-brand)',
    colorBrandForegroundLinkHover: hover,
    colorBrandForegroundLinkPressed: pressed,
    colorBrandForegroundLinkSelected: 'var(--color-brand)',
    colorCompoundBrandForeground1: 'var(--color-brand)',
    colorCompoundBrandForeground1Hover: hover,
    colorCompoundBrandForeground1Pressed: pressed,
    colorCompoundBrandBackground: 'var(--color-brand)',
    colorCompoundBrandBackgroundHover: hover,
    colorCompoundBrandBackgroundPressed: pressed,
    colorCompoundBrandStroke: 'var(--color-brand)',
    colorCompoundBrandStrokeHover: hover,
    colorCompoundBrandStrokePressed: pressed,
  }
}

const lightTheme: Theme = {
  ...webLightTheme,
  ...emphasisTypography,
  ...roleTypography,
  ...accentRoles(webLightTheme.colorBrandForegroundLink, webLightTheme.colorBrandForegroundLinkHover),
}

const highContrastTheme: Theme = {
  ...teamsHighContrastTheme,
  ...emphasisTypography,
  ...roleTypography,
}

const darkTheme: Theme = {
  ...webDarkTheme,
  ...emphasisTypography,
  ...roleTypography,
  ...accentRoles(webDarkTheme.colorBrandForeground2Hover, webDarkTheme.colorBrandForegroundLinkHover),
  colorNeutralBackground1: 'var(--color-surface-raised)',
  colorNeutralBackground1Hover: 'var(--color-hover)',
  colorNeutralBackground1Pressed: 'var(--color-pressed)',
  colorNeutralBackground1Selected: 'var(--color-hover)',
  colorNeutralBackground2: 'var(--color-surface-subtle)',
  colorNeutralBackground2Hover: 'var(--color-hover)',
  colorNeutralBackground2Pressed: 'var(--color-pressed)',
  colorNeutralBackground2Selected: 'var(--color-hover)',
  colorNeutralBackground3: 'var(--color-surface)',
  colorNeutralBackground3Hover: 'var(--color-hover)',
  colorNeutralBackground3Pressed: 'var(--color-pressed)',
  colorNeutralBackground3Selected: 'var(--color-hover)',
  colorNeutralBackground4: 'var(--color-page)',
  colorNeutralForeground1: 'var(--color-text)',
  colorNeutralForeground2: 'var(--color-text-secondary)',
  colorNeutralForeground3: 'var(--color-text-muted)',
  colorNeutralStroke1: 'var(--color-border-strong)',
  colorNeutralStroke2: 'var(--color-border)',
  colorSubtleBackgroundHover: 'var(--color-hover)',
  colorSubtleBackgroundPressed: 'var(--color-pressed)',
  colorSubtleBackgroundSelected: 'var(--color-hover)',
}

// Preserve the preset's role pairings, but never replace a user's forced-colors palette.
const forcedColorsTheme = Object.fromEntries(Object.entries(highContrastTheme).map(([key, value]) => {
  if (value === '#ffff00') return [key, 'LinkText']
  if (value === '#1aebff') return [key, 'Highlight']
  if (value === '#3ff23f') return [key, 'GrayText']
  if (value === '#ffffff') return [key,
    ['colorBrandBackground', 'colorBrandBackgroundInverted', 'colorScrollbarOverlay'].includes(key) ? 'ButtonFace' : 'CanvasText']
  if (value === '#000000') {
    if (['colorNeutralForegroundOnBrand', 'colorBrandForegroundOnLight'].includes(key)) return [key, 'ButtonText']
    return [key, key.includes('Foreground') && key !== 'colorNeutralForeground1Static' ? 'HighlightText' : 'Canvas']
  }
  return [key, value]
})) as Theme

const themes: Record<ResolvedTheme, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  'high-contrast': highContrastTheme,
  'forced-colors': forcedColorsTheme,
}

function subscribeSystemTheme(onChange: () => void) {
  const queries = ['(prefers-color-scheme: dark)', '(forced-colors: active)'].map(query => window.matchMedia(query))
  queries.forEach(query => query.addEventListener('change', onChange))
  return () => queries.forEach(query => query.removeEventListener('change', onChange))
}

const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
const systemForcesColors = () => window.matchMedia('(forced-colors: active)').matches

function resolveTheme(appearance: PortalAppearance, systemDark: boolean, forcedColors: boolean): ResolvedTheme {
  if (forcedColors) return 'forced-colors'
  if (appearance === 'system') return systemDark ? 'dark' : 'light'
  return appearance
}

const colorScheme = (theme: ResolvedTheme) =>
  theme === 'forced-colors' ? 'light dark' : theme === 'high-contrast' ? 'dark' : theme

/** Wrap the app once. `appearance` defaults to light; use "system" to follow the visitor's OS setting. */
export function PortalThemeProvider({ appearance = 'light', children }: { appearance?: PortalAppearance; children: ReactNode }) {
  const systemDark = useSyncExternalStore(subscribeSystemTheme, systemPrefersDark, () => false)
  const forcedColors = useSyncExternalStore(subscribeSystemTheme, systemForcesColors, () => false)
  const theme = resolveTheme(appearance, systemDark, forcedColors)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = colorScheme(theme)
  }, [theme])

  return (
    <FluentProvider theme={themes[theme]} {...typography('reading', undefined, { colorScheme: colorScheme(theme) })}>
      {children}
    </FluentProvider>
  )
}
