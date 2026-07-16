import { expect, test } from "@playwright/test";

test("mobile navigation keeps content visible and supports keyboard problem navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/login");
  await page.getByLabel("Email").fill("responsive@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Problems" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open sidebar" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Difficulty" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Category" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Completion status" })).toBeVisible();

  await page.getByRole("button", { name: "Open sidebar" }).click();
  await expect(page.getByRole("button", { name: "Close sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Close sidebar" }).click();

  await page
    .getByRole("button", { name: "Open Healthcare Feature Mean" })
    .press("Enter");
  await expect(page).toHaveURL(/\/problems\/healthcare-feature-mean/);
  await expect(
    page.getByRole("heading", { name: "Healthcare Feature Mean" })
  ).toBeVisible();
});

test("theme menu exposes its choices and closes with Escape", async ({ page }) => {
  await page.goto("/login");
  const themeButton = page.getByRole("button", { name: "Theme options" });
  await themeButton.press("Enter");

  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitemradio", { name: "Light" })).toBeVisible();
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toBeVisible();
  await expect(page.getByRole("menuitemradio", { name: "System" })).toBeVisible();

  await themeButton.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
});
