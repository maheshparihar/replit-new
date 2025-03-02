
            import React from "react";
            import { render, screen, fireEvent } from "@testing-library/react";
            import "@testing-library/jest-dom";
            import React from 'react';
const App = () => <h1>Hello, API!</h1>;
export default App;
            
            test("Component renders", () => {
                render(<Counter />);
                expect(screen.getByTestId("counter-value")).toHaveTextContent("Count: 0");
            });

            test("Click Increment Button", () => {
                render(<Counter />);
                const button = screen.getByTestId("increment-btn");
                fireEvent.click(button);
                expect(screen.getByTestId("counter-value")).toHaveTextContent("Count: 1");
            });

            test("Click Decrement Button", () => {
                render(<Counter />);
                const button = screen.getByTestId("decrement-btn");
                fireEvent.click(button);
                expect(screen.getByTestId("counter-value")).toHaveTextContent("Count: -1");
            });
        