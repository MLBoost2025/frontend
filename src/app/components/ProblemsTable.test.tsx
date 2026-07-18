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

  it("labels an enforced premium problem without hiding it", () => {
    render(
      <ProblemsTable
        onProblemClick={vi.fn()}
        problems={[
          {
            id: "premium-problem",
            title: "Weighted Least Squares",
            difficulty: "Hard",
            category: "Supervised Learning",
            acceptance: 42,
            acceptanceRate: 42,
            status: "unsolved",
            tags: ["regression"],
            accessTier: "plus",
            locked: true,
          },
        ]}
      />
    );

    expect(screen.getAllByText("Weighted Least Squares")).toHaveLength(2);
    expect(screen.getByText("Plus")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Open Weighted Least Squares" }))
      .not.toHaveLength(0);
  });
});
