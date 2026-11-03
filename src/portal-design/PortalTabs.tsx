import { forwardRef, type ReactNode } from 'react'
import {
  renderTab_unstable,
  renderTabList_unstable,
  slot,
  useTab_unstable,
  useTabList_unstable,
  useTabListContextValues_unstable,
  type TabProps,
  type TabListProps,
} from '@fluentui/react-components'
import './PortalTabs.css'
import { typography, type TypographyLayoutStyle } from './typography'

// Fluent owns selection and keyboard navigation; existing portal classes own
// appearance. Automatic activation is the default, with manual opt-in per list.
export const PortalTabList = forwardRef<HTMLDivElement, TabListProps>(
  function PortalTabList({ selectTabOnFocus = true, ...props }, ref) {
    const state = {
      ...useTabList_unstable({ ...props, selectTabOnFocus }, ref),
      reserveSelectedTabSpace: false,
    }
    const contextValues = useTabListContextValues_unstable(state)
    return renderTabList_unstable(state, contextValues)
  },
)

function renderContent(_Component: unknown, props: { children?: ReactNode }) {
  return <>{props.children}</>
}

type PortalTabProps = Omit<TabProps, 'style'> & { style?: TypographyLayoutStyle }

export const PortalTab = forwardRef<HTMLButtonElement, PortalTabProps>(
  function PortalTab({ content, ...props }, ref) {
    const state = useTab_unstable({ ...props, ...typography('control', undefined, props.style) }, ref)
    // Compose the public content slot after state creation, so rich labels keep
    // their direct-child hooks without creating a reserved-width copy.
    return renderTab_unstable({
      ...state,
      icon: state.icon ? {
        ...state.icon,
        className: ['portal-tab-icon', state.icon.className].filter(Boolean).join(' '),
      } : state.icon,
      content: slot.always(content ?? { children: renderContent }, {
        defaultProps: state.content,
        elementType: 'span',
      }),
    })
  },
)
