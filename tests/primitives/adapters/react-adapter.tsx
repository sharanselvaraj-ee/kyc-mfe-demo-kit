import { render, fireEvent } from "@testing-library/react";
import { TextField, DateField, CheckboxField, Heading } from "@kyc/gen-react";
import type { Adapter, PrimitiveHarness } from "../adapter.js";

function wrap(result: ReturnType<typeof render>): PrimitiveHarness {
  return {
    container: result.container,
    getByLabelText: (text) => result.getByLabelText(text),
    queryByText: (text) => result.queryByText(text),
    fireChange: (element, value) => fireEvent.change(element, { target: { value } }),
    fireClick: (element) => fireEvent.click(element),
    unmount: () => result.unmount(),
  };
}

export const reactAdapter: Adapter = {
  name: "react",
  renderTextField: (props) => wrap(render(<TextField {...props} />)),
  renderDateField: (props) => wrap(render(<DateField {...props} />)),
  renderCheckboxField: (props) => wrap(render(<CheckboxField {...props} />)),
  renderHeading: (props) => wrap(render(<Heading {...props} />)),
};
