// SLIDE: "Intermediate representation: Mitosis" (the consent checkbox, ONB-SUBMIT-002)
export interface CheckboxFieldProps {
  fieldId: string;
  label: string;
  hint?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}

export default function CheckboxField(props: CheckboxFieldProps) {
  return (
    <div>
      <input
        id={props.fieldId}
        type="checkbox"
        checked={props.checked}
        aria-describedby={props.hint ? `${props.fieldId}-hint` : undefined}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      <label htmlFor={props.fieldId}>{props.label}</label>
      {props.hint ? <p id={`${props.fieldId}-hint`}>{props.hint}</p> : null}
    </div>
  );
}
