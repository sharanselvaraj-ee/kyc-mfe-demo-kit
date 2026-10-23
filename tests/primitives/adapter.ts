// SLIDE: "The harness is the real guarantee" (one suite, one adapter per target — IR-002)
export interface PrimitiveHarness {
  container: HTMLElement;
  getByLabelText(text: string | RegExp): HTMLElement;
  queryByText(text: string | RegExp): HTMLElement | null;
  fireChange(element: HTMLElement, value: string): void;
  fireClick(element: HTMLElement): void;
  unmount(): void;
}

export interface Adapter {
  name: "react" | "svelte";
  renderTextField(props: { fieldId: string; label: string; hint?: string; value?: string; onChange: (v: string) => void }): PrimitiveHarness;
  renderDateField(props: { fieldId: string; label: string; hint?: string; value?: string; onChange: (v: string) => void }): PrimitiveHarness;
  renderCheckboxField(props: { fieldId: string; label: string; hint?: string; checked?: boolean; onChange: (v: boolean) => void }): PrimitiveHarness;
  renderHeading(props: { text: string }): PrimitiveHarness;
}
