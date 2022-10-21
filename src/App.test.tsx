import { createRoot } from "react-dom/client";
import App from "./App";

it("should render without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<App />);
});

// test("typing in the positive number field", () => {
//   const wrapper = mount(<App />);
//   const event = { target: { value: "5" } };
//   wrapper.find("#positive-number").simulate("change", event);
// });

// test("New validator function should be used if it changes", async () => {
//   const onSubmit = jest.fn();
//   const wrapper = mount(<App onSubmit={onSubmit} />);
//   wrapper.find("#first-match").simulate("change", { target: { value: "100" } });
//   wrapper
//     .find("#second-match")
//     .simulate("change", { target: { value: "100" } });
//   wrapper.find("input#submit").simulate("click");
//   expect(onSubmit).toHaveBeenCalledTimes(0);
//   await wait(
//     () => {
//       wrapper.find("input#submit").simulate("click");
//       expect(onSubmit).toHaveBeenCalled();
//     },
//     { timeout: 1000 }
//   );
// });
