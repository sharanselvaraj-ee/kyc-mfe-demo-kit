// SLIDE: "Intermediate representation: Mitosis" (written once from the spec, presentational: props in, events out)
export interface TextFieldProps {
  fieldId: string;
  label: string;
  hint?: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function TextField(props: TextFieldProps) {
  return (
    <div>
      <label htmlFor={props.fieldId}>{props.label}</label>
      <input
        id={props.fieldId}
        type="text"
        value={props.value}
        aria-describedby={props.hint ? `${props.fieldId}-hint` : undefined}
        onChange={(event) => props.onChange(event.target.value)}
      />
      {props.hint ? <p id={`${props.fieldId}-hint`}>{props.hint}</p> : null}
    </div>
  );
}
