import { expect, test } from "@playwright/test";

const adminSession = {
  user: {
    id: "admin-playwright",
    name: "Playwright Admin",
    email: "admin@playwright.test",
    avatarUrl: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    roles: ["Admin"],
  },
  accessToken: "mock_playwright_admin",
  expiresAt: "2030-01-01T00:00:00.000Z",
};

async function startAsMockAdmin(page: import("@playwright/test").Page) {
  await page.context().addCookies([
    {
      name: "mlboost_auth",
      value: "1",
      url: "http://127.0.0.1:4173",
      sameSite: "Lax",
    },
  ]);
  await page.addInitScript((session) => {
    localStorage.setItem("mlboost.mock.session", JSON.stringify(session));
    localStorage.setItem("accessToken", session.accessToken);
  }, adminSession);
}

test("a learner can run, submit, and review a mock solution", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("critical-flow@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page
    .getByRole("button", { name: "Open KNN Classifier on Iris" })
    .click();
  await expect(page).toHaveURL(/\/problems\/knn-classifier-iris/);

  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Accepted", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/sample tests: 2\/2/i)).toBeVisible();

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Accepted", { exact: true }).last()).toBeVisible();
  await expect(page.getByText(/hidden tests: 6\/6/i)).toBeVisible();

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByText(/submit · accepted/i)).toBeVisible();
});

test("an admin can create, edit, and delete mock content", async ({ page }) => {
  await startAsMockAdmin(page);
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  await page.getByLabel("Title").fill("Playwright coverage problem");
  await page.getByLabel("Description").fill("A temporary problem used to verify authoring controls.");
  await page.getByRole("button", { name: "Create problem" }).click();
  await expect(page.getByRole("status")).toContainText("Problem created");

  await page.getByRole("button", { name: "manage", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  await page.getByLabel("Title").fill("Updated KNN problem");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("button", { name: "Edit" }).first()).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByRole("status")).toContainText("Problem deleted");
});
