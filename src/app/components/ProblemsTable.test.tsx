import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProblemsTable from "./ProblemsTable";

describe("ProblemsTable", () => {
  it("opens the selected problem from the keyboard", async () => {
    const user = userEvent.setup();
    const onProblemClick = vi.fn();

    render(
      <ProblemsTable
        onProblemClick={onProblemClick}
        problems={[
          {
            id: "problem-1",
            title: "KNN Classifier on Iris",
            difficulty: "Easy",
            category: "Supervised Learning",
            acceptance: 74,
            acceptanceRate: 74,
            status: "unsolved",
            tags: ["classification"],
          },
        ]}
      />
    );

    const [openButton] = screen.getAllByRole("button", {
      name: "Open KNN Classifier on Iris",
    });
    openButton.focus();
    await user.keyboard("{Enter}");

    expect(onProblemClick).toHaveBeenCalledWith("problem-1");
  });

  it("explains an empty result set", () => {
    render(<ProblemsTable problems={[]} />);

    expect(screen.getByText(/no problems match your current filters/i)).toBeVisible();
  });
});
