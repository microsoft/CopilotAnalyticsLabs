# Portal design guidelines

Copilot Analytics Labs is opened from inside Microsoft's in-product analytics
portal. Labs pages should look and behave like part of that same product. This
document is the design contract for every Labs page. The code that implements it
lives in [`src/portal-design`](../src/portal-design).

## 1. Principles

- **Fluent UI React v9 owns behavior and accessibility; the portal kit owns
  appearance.** Use `src/portal-design` components and tokens. Do not restyle
  with `webLightTheme` defaults, hard-coded hex colors in `makeStyles`, or the
  Fluent 2 web UI kit's visuals from Figma.
- **Calm and data-first.** White cards on a light-gray page, neutral gray text,
  one blue accent, and semibold (600) for emphasis. Never use bold weights above
  600, decorative gradients on UI chrome, or colored icons for ordinary actions.
- **Page CSS arranges; tokens paint.** Page stylesheets may set layout (grid,
  flex, gaps, widths, ordering). Colors, borders, radii, typography and shadows
  come from the kit's tokens and components.
- **Preserve content and behavior.** Restyling never changes copy, links,
  routes, telemetry, votes, feeds or data.

## 2. Foundations

### Typography

Segoe UI 400 and 600, loaded by `base.css`. Use `PortalText textRole="…"` or
`font: var(--type-<role>)`.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `page-title` | 28 / 36 | 600 | The single page `h1` |
| `section-title` | 24 / 32 | 600 | Large section headings on long pages |
| `story-title` | 20 / 28 | 400 | Editorial lead-ins |
| `step-title` | 18 / 24 | 600 | Numbered step headings |
| `card-title` | 16 / 22 | 600 | Card and section headings |
| `reading` | 14 / 20 | 400 | Paragraphs and descriptions |
| `support` / `control` / `table` | 14 / 20 | 400 (controls 600) | UI text, buttons, tables |
| `metadata` | 12 / 16 | 400 | Captions, timestamps, helper text |
| `badge` | 12 / 16 | 600 | Badges and counts |
| `metric` | 28 / 36 | 600 | Headline numbers |

Text colors: primary `--color-text`, secondary `--color-text-secondary`
(descriptions), muted `--color-text-muted` (metadata). Use sentence case.

### Color tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-page` | `#f9f9f9` | `#141820` | Page background |
| `--color-surface` | `#fff` | `#1c2129` | Cards |
| `--color-surface-subtle` | `#f5f5f5` | `#20262e` | Subtle panels, disabled fills |
| `--color-hover` / `--color-pressed` | `#f0f0f0` / `#e0e0e0` | `#2c3541` / `#354252` | Interactive states |
| `--color-text` | `#242424` | `#f3f6fa` | Primary text |
| `--color-text-secondary` | `#424242` | `#d1d9e3` | Secondary text, icons |
| `--color-text-muted` | `#616161` | `#b3bdca` | Metadata |
| `--color-border` | `#e0e0e0` | `#424c5b` | Dividers, nested cards |
| `--color-brand` | `#0f6cbd` | `#75b9ed` | Links, selection, focus |
| `--color-brand-soft` | `#ebf3fc` | `#173650` | Selected pill fill |
| `--color-success` / `--color-warning` / `--color-danger` | `#107c10` / `#8a5100` / `#c42b1c` | `#7cce7c` / `#f5c26b` / `#ff9990` | Status only |

High contrast and Windows forced colors remap every token automatically
(`PortalThemeProvider` sets `:root[data-theme]`). Never hard-code a hex color in
a page; if a new color is needed, add a token to `theme.css` with light, dark and
high-contrast values.

### Spacing, shape and elevation

- 4px grid. Common values: 4, 8, 12, 16, 20, 24, 32.
- Page gutters 32px (16px on narrow screens); content max width 1440px.
- 32px between page sections; 12–16px from a heading to its content.
- Cards: 20px inset for tables and lists, 24px for content cards; 16–24px
  between cards.
- Radii: 4px controls and inputs, 8px cards, 16px pills, 50% circular icon
  buttons and avatars.
- Raised card shadow: `0 1px 2px rgb(0 0 0 / 14%), 0 0 2px rgb(0 0 0 / 12%)`.
  Cards inside cards use a 1px `--color-border` border and no shadow.
- Focus: 2px solid `--color-focus` outline with a 2px offset; never remove it.

## 3. Components (`src/portal-design`)

| Need | Use | Notes |
| --- | --- | --- |
| App root | `PortalThemeProvider` | Replaces `<FluentProvider theme={webLightTheme}>`. `appearance` defaults to `light`; `system` follows the OS. |
| Text | `PortalText` | Pick the element for semantics (`as="h2"`) and `textRole` for appearance. |
| Actions | `PortalButton` | `primary`, `secondary` (default), `subtle`. 32px tall, 4px radius, 14px semibold, 16px leading icon. `iconOnly` gives a 32px square with a 20px icon and needs an `aria-label`; add `shape="circular"` for circular. |
| Link-style CTA | `<a className="primary-button">` or `secondary-button` | For navigation to another page or site. External links open in a new tab, end with `Open16Regular`, and say "(opens in a new tab)" in `aria-label`. |
| Cards | `PortalCard className="data-table-card"` | White, 8px radius, raised shadow. Use `nested` for a card inside a card. |
| Tables | `table.portal-standard-table` in `div.data-table-scroll` in a `data-table-card` | 48px rows, 12px header padding, semibold headers, 1px dividers, none under the last row. Add `portal-standard-table--interactive` for hover/focus row fill. |
| Page or section tabs | `PortalPrimaryTabs` | 28px gap, 3px brand indicator, semibold 14px labels. Keyboard and selection come from Fluent. |
| Filters and small choices | Buttons inside `.portal-segmented-control` | 32px pills, 16px radius; selected uses `aria-pressed="true"` (brand border, text and soft fill). |
| Links to items | `PortalEntityLink` | Semibold 14px link; small variant for metadata. |
| Inline help | `PortalInfo` | 16px info icon directly after the text it explains, with an arrowed tooltip. Never at the far edge of a card. |
| Icons | `@fluentui/react-icons` Regular | 20px in icon-only buttons, 16px in labeled buttons and inline. Neutral (`--color-text-secondary`) unless they are a selected or brand state. |

Prefer an existing kit component, then a Fluent UI React v9 component with kit
tokens. Do not use Fluent v8, Fluent 2 web kit styling, or another UI library.

## 4. Page anatomy

1. **Header:** one `h1` (`page-title`), then a one- or two-sentence description
   (`reading`, secondary color) 4–8px below. Primary page actions sit at the
   top right of the header or below the description, never inside cards.
2. **Sections:** a heading (`card-title`, or `section-title` on long editorial
   pages) followed by a card or grid 12–16px below. 32px between sections.
3. **Subpages:** a breadcrumb back to the parent page (14px, subdued current
   item), then the subpage's own `h1`. Never repeat the parent page's title or
   description on a subpage.
4. **Footer and disclaimers:** a full-width subtle band (`#fafafa` light), a
   1px top border and 12/16 metadata text.
5. **Responsive:** columns stack below about 900px; card rows wrap; tables
   scroll inside their card. No horizontal page scrolling at 320px.

### Labs home pattern

The in-product portal already presents Labs this way:

- A hero with the 28/36 title, a 14/20 intro in secondary text with key phrases
  in semibold, and one primary CTA. Decorative artwork sits at the top right on
  wide screens and is hidden below about 1040px.
- Numbered sections: a 22px circular step badge (inverse colors) beside a
  `card-title` heading.
- "What you can build": one raised card with three equal columns (64px
  illustrations, `card-title` headings, `metadata` descriptions) separated by
  thin vertical rules. It stacks below about 900px.
- "How it works": one raised card with a 128px illustration, a description, a
  horizontal chain of steps joined by small arrow badges, and a secondary CTA.
- Sections use 80% of the content width on wide screens and 100% below about
  1240px.

### Illustrations

Labs uses the Fluent Spot Illustration Library in its **Blue** color theme
(navy `#294482` outlines, `#5C8DF8` / `#CEDEFF` blues, `#FFE4B4` accent,
`#F5F5F5` light shapes). Dashboard screenshots stay as they are.

- **Cards:** one spot illustration per card, in `public/images/spot`, on a
  `--color-brand-soft` band (`.labs-card__media--contain`). Outlines are 1px
  at card size, as the library draws its 128px assets.
- **Hero:** a large-scale illustration (`public/images/hero-illustration.svg`)
  built from a spot illustration that no card uses (currently Content Table),
  with a product-inspired pattern (table rows), on a blueprint tile whose grid
  is aligned to the illustration. Hatched blocks, selection handles and accent
  dots snap to grid intersections, and the Fluent cursor icon shows the work in
  progress. Outlines are 2px.
- Don't recolor illustrations outside the library's themes, and don't mix
  themes on one page.

## 5. Interaction and accessibility

- One `h1` per page; headings in order; landmarks (`header`, `main`, `nav`,
  `footer`).
- Every control is reachable and operable by keyboard with a visible focus ring.
- Icon-only controls have an accessible name; decorative images use `alt=""`.
- Actions revealed on hover also appear on keyboard focus and are always
  visible on touch (`@media (hover: none)`).
- Information tooltips use Fluent's `withArrow`; menus and pickers do not.
- Respect `prefers-reduced-motion`; avoid animation that conveys meaning.
- Maintain WCAG 2.1 AA contrast; the tokens already meet it in every theme.

## 6. Writing

- Sentence case for titles, buttons and labels.
- Buttons start with a verb ("Explore Labs", "Get started").
- Keep descriptions to one or two short sentences; use semibold, not bold or
  italics, for emphasis.
- External links: the visible label names the destination; the accessible name
  adds "(opens in a new tab)".

## 7. Do and don't

| Do | Don't |
| --- | --- |
| Use kit components and `var(--…)` tokens | Hard-code hex colors, fonts or shadows in pages |
| One primary action per area; secondary for the rest | Several primary buttons side by side |
| Border-only nested cards | Shadows on cards inside cards |
| Place info icons next to their text | Detach help icons to the far edge |
| Keep real content, links and behavior | Invent data, links or integrations |
| Check light, narrow (390px) and keyboard use | Ship a change seen only at desktop width |

## 8. Done checklist

- `npm run build` and `npm run lint` pass.
- The page matches the portal reference at 1440px and works at 390px and 320px.
- Keyboard focus is visible on every control; no console errors.
- No hard-coded colors outside `src/portal-design/theme.css`.
