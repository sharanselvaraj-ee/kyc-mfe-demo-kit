// SLIDE: "Intermediate representation: Mitosis" (display-only: a step or section title)
export interface HeadingProps {
  text: string;
}

export default function Heading(props: HeadingProps) {
  return <h2>{props.text}</h2>;
}
