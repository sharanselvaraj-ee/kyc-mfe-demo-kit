// SLIDE: "Intermediate representation: Mitosis" (display-only: an inline note, e.g. a mocked-upload explainer)
export interface NoticeProps {
  text: string;
}

export default function Notice(props: NoticeProps) {
  return (
    <p role="status">
      <em>{props.text}</em>
    </p>
  );
}
