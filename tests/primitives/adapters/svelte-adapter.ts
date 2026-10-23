import { render, fireEvent } from "@testing-library/svelte";
import { TextField, DateField, CheckboxField, Heading } from "@kyc/gen-svelte";
import type { Adapter, PrimitiveHarness } from "../adapter.js";

function wrap(result: ReturnType<typeof render>): PrimitiveHarness {
  return {
    container: result.container,
    getByLabelText: (text) => result.getByLabelText(text),
    queryByText: (text) => result.queryByText(text),
    fireChange: (element, value) => {
      (element as HTMLInputElement).value = value;
      fireEvent.change(element);
    },
    fireClick: (element) => fireEvent.click(element),
    unmount: () => result.unmount(),
  };
}

export const svelteAdapter: Adapter = {
  name: "svelte",
  renderTextField: (props) => wrap(render(TextField, { props })),
  renderDateField: (props) => wrap(render(DateField, { props })),
  renderCheckboxField: (props) => wrap(render(CheckboxField, { props })),
  renderHeading: (props) => wrap(render(Heading, { props })),
};
