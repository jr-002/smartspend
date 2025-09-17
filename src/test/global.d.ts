/// <reference types="@testing-library/jest-dom" />

declare namespace Vi {
  interface JestAssertion<T = unknown> extends jest.Matchers<void, T> {
    toBeInTheDocument(): boolean;
    toHaveTextContent(text: string | RegExp): boolean;
    toBeVisible(): boolean;
    toBeEnabled(): boolean;
    toHaveClass(className: string): boolean;
  }
}