import { PortalText } from "./portal-design";

interface FilterGroupProps<T extends string> {
  /** Visible label shown before the options. */
  label: string;
  /** Accessible name for the group of options, e.g. "Filter by type". */
  groupLabel: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/** A labelled row of single-select filter pills, using the kit's segmented control. */
export function FilterGroup<T extends string>({ label, groupLabel, options, value, onChange }: FilterGroupProps<T>) {
  return (
    <div className="labs-filter-group">
      <PortalText textRole="support" emphasis="semibold" tone="secondary">
        {label}
      </PortalText>
      <div className="portal-segmented-control" role="group" aria-label={groupLabel}>
        {options.map((option) => (
          <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
