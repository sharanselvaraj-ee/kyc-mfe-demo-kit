// SLIDE: "Intermediate representation: Mitosis" (generic: the policy says date of birth, not this component)
export interface DateFieldProps {
  fieldId: string;
  label: string;
  hint?: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function DateField(props: DateFieldProps) {
  return (
    <div>
      <label htmlFor={props.fieldId}>{props.label}</label>
      <input
        id={props.fieldId}
        type="date"
        value={props.value}
        aria-describedby={props.hint ? `${props.fieldId}-hint` : undefined}
        onChange={(event) => props.onChange(event.target.value)}
      />
      {props.hint ? <p id={`${props.fieldId}-hint`}>{props.hint}</p> : null}
    </div>
  );
}
