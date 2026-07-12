import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProblemsTable from "./ProblemsTable";

describe("ProblemsTable", () => {
  it("opens the selected problem", () => {
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

    fireEvent.click(screen.getByText("KNN Classifier on Iris"));

    expect(onProblemClick).toHaveBeenCalledWith("problem-1");
  });

  it("explains an empty result set", () => {
    render(<ProblemsTable problems={[]} />);

    expect(screen.getByText(/no problems match your current filters/i)).toBeVisible();
  });
});
