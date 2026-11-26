import type { ReactNode } from "react";
import { ChevronRight16Regular } from "@fluentui/react-icons";
import { PortalText } from "./portal-design";

interface PageHeaderProps {
  /** Breadcrumb label for this page. */
  crumb: string;
  title: string;
  description: ReactNode;
}

/** Subpage header: a breadcrumb back to the Labs home page, then the page's own h1 and description. */
export function PageHeader({ crumb, title, description }: PageHeaderProps) {
  return (
    <header className="labs-page-header">
      <nav aria-label="Breadcrumb" className="labs-breadcrumb">
        <ol>
          <li>
            <a href={`${import.meta.env.BASE_URL}#/`}>Labs</a>
            <ChevronRight16Regular aria-hidden="true" />
          </li>
          <li aria-current="page">{crumb}</li>
        </ol>
      </nav>
      <PortalText as="h1" textRole="page-title">
        {title}
      </PortalText>
      <PortalText as="p" textRole="reading" tone="secondary" className="labs-page-header__description">
        {description}
      </PortalText>
    </header>
  );
}
