import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("emits updated query on each keystroke", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(
      screen.getByPlaceholderText(/search problems, topics, or algorithms/i),
      "knn"
    );

    expect(onSearch).toHaveBeenLastCalledWith("knn");
  });
});
