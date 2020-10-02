import React from "react";
import ReactDOM from "react-dom";
import { mount, render } from "enzyme";
import App from "./App";

it("should render without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
});

test("snapshot", () => {
  const wrapper = render(<App />);
  expect(wrapper).toMatchSnapshot();
});

test("typing in the positive number field", () => {
  const wrapper = mount(<App />);
  const event = { target: { value: "5" } };
  wrapper.find("#positive-number").simulate("change", event);
});
