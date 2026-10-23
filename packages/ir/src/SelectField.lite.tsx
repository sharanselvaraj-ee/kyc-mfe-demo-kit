// SLIDE: "Intermediate representation: Mitosis" (generic: options come from the policy, not a bespoke component)
export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  fieldId: string;
  label: string;
  hint?: string;
  value?: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
}

export default function SelectField(props: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={props.fieldId}>{props.label}</label>
      <select
        id={props.fieldId}
        value={props.value}
        aria-describedby={props.hint ? `${props.fieldId}-hint` : undefined}
        onChange={(event) => props.onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {props.hint ? <p id={`${props.fieldId}-hint`}>{props.hint}</p> : null}
    </div>
  );
}
