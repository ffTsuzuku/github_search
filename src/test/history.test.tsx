import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("Search History", () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  test("Shows Searched item", async () => {
    render(<App />);

    const searchButton = screen.getByTestId("searchButton");
    fireEvent.click(searchButton);
    await waitFor(() => {
      const microsoftDiv = screen.getByRole("listitem");
      expect(microsoftDiv).toBeInTheDocument();
    });
  });
});
