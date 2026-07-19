import { expect, test } from "@playwright/test";

test("legal and support policies are publicly reachable", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "Terms of use" })).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy notice" })).toBeVisible();
  await page.goto("/refunds");
  await expect(page.getByRole("heading", { name: "Cancellation and refund policy" })).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Contact Katalume" })).toBeVisible();
});

test("checkout requires explicit policy and renewal consent", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("billing-consent@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/problems$/);
  await page.goto("/pricing");
  await page.getByRole("button", { name: "Preview plan" }).first().click();
  const continueButton = page.getByRole("button", { name: "Continue securely" });
  await expect(continueButton).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(continueButton).toBeEnabled();
  await expect(page.getByText(/renews every week until I cancel it/i)).toBeVisible();
});

test("all primary pages load and are not blank", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("navigation@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  const checks = [
    { link: "Dashboard", pathSuffix: "/", heading: /^dashboard$/i },
    { link: "Problems", pathSuffix: "/problems", heading: /^problems$/i },
    {
      link: "Competitions",
      pathSuffix: "/competitions",
      heading: /^competitions$/i,
    },
    { link: "Learn", pathSuffix: "/learn", heading: /^learn$/i },
    { link: "Progress", pathSuffix: "/progress", heading: /^progress$/i },
  ];

  for (const item of checks) {
    await page.getByRole("link", { name: item.link }).click();
    await expect(page).toHaveURL(new RegExp(`${item.pathSuffix}$`));
    await expect(page.getByRole("heading", { name: item.heading })).toBeVisible();
  }
});

test("problem arena route opens from problems list", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("arena@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("link", { name: "Problems" }).click();
  await page
    .getByRole("button", { name: "Open Healthcare Feature Mean" })
    .click();

  await expect(page).toHaveURL(/\/problems\/healthcare-feature-mean/);
  await expect(
    page.getByRole("heading", { name: /healthcare feature mean/i })
  ).toBeVisible();
});

test("topics in sidebar navigate to filtered problems", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("topics@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("link", { name: "Learn" }).click();
  await page.getByRole("button", { name: "Data Preprocessing" }).click();

  await expect(page).toHaveURL(/\/problems\?category=Data\+Preprocessing$/);
  await expect(page.getByRole("heading", { name: /^problems$/i })).toBeVisible();
});
