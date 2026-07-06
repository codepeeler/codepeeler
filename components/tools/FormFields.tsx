type CheckboxOptionProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

/** The single checkbox+label control reused in every settings row across tool pages. */
export function CheckboxOption({ label, checked, onChange }: CheckboxOptionProps) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  width?: string;
};

/** The single labeled number-input control reused for lengths, counts, limits, etc. */
export function NumberField({ label, value, onChange, min, max, suffix, width = "w-16" }: NumberFieldProps) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value) || 0;
          onChange(min !== undefined ? Math.max(min, max !== undefined ? Math.min(max, n) : n) : n);
        }}
        className={`${width} rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]`}
      />
      {suffix}
    </label>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width?: string;
  placeholder?: string;
};

/** The single labeled short text-input control reused for separators, suffixes, etc. */
export function TextField({ label, value, onChange, width = "w-16", placeholder }: TextFieldProps) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${width} rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)] placeholder:text-[var(--text-faint)]`}
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

/** The single labeled dropdown control reused for algorithm/indent/separator/size selectors. */
export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
