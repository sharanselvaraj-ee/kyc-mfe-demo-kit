// SLIDE: "Intermediate representation: Mitosis" (the mocked document upload, ONB-DOC-001)
export interface FileFieldProps {
  fieldId: string;
  label: string;
  hint?: string;
  value?: string;
  onChange: (filename: string) => void;
}

export default function FileField(props: FileFieldProps) {
  return (
    <div>
      <label htmlFor={props.fieldId}>{props.label}</label>
      <input
        id={props.fieldId}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        aria-describedby={props.hint ? `${props.fieldId}-hint` : undefined}
        onChange={(event) => props.onChange(event.target.files?.[0]?.name ?? "")}
      />
      {props.value ? <p>Selected: {props.value}</p> : null}
      {props.hint ? <p id={`${props.fieldId}-hint`}>{props.hint}</p> : null}
    </div>
  );
}
