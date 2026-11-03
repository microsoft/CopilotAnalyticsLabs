# Copilot Analytics Labs: agent instructions

Labs is opened from inside Microsoft's in-product analytics portal and must look
like part of it. Every UI change follows the portal design language.

## Read first

1. [`docs/portal-design-guidelines.md`](docs/portal-design-guidelines.md): tokens,
   type roles, spacing, components, page anatomy and the done checklist.
2. [`src/portal-design`](src/portal-design): the implementation. Import from
   `./portal-design` (or the relative path) instead of restyling Fluent yourself.
3. `.design-reference/` if it exists locally: screenshots of the portal and its
   own Labs page source, for visual comparison only. It is git-ignored and must
   never be committed, quoted into source, or published.

## Rules

- The app root uses `PortalThemeProvider`, not `FluentProvider` with
  `webLightTheme`. Import `src/portal-design/base.css` once (the provider
  does this) after `src/index.css`.
- Use `PortalText`, `PortalButton`, `PortalCard`, `PortalPrimaryTabs`,
  `PortalEntityLink`, `PortalInfo`, `portal-standard-table` and
  `portal-segmented-control` before writing new styles. Otherwise use Fluent UI
  React v9 components with kit tokens.
- Page CSS and `makeStyles` may arrange layout only. Colors, borders, radii,
  typography and shadows come from `var(--color-…)`, `var(--type-…)` and the
  kit components. Replace hard-coded hex values when you touch a component.
- Preserve every page's content, routes (`#/templates`, `#/codes`,
  `#/research`, `#/updates`), external links, telemetry, votes and the RSS feed.
  Restyle; don't rewrite content or behavior.
- Keep one `h1` per page, keyboard access, visible focus, accessible names for
  icon-only controls and `alt=""` for decorative images.
- Don't add dependencies, change build or deploy settings, or edit
  `src/portal-design` to suit one page. Extend the kit only when a pattern is
  needed in several places, and update the guidelines with it.

## Verify before handing back

- `npm run build` and `npm run lint` pass.
- Check the page in `npm run dev` at 1440px, 390px and 320px wide. Compare it
  with `.design-reference/screenshots` when available.
- Report anything that couldn't match the portal and why.
