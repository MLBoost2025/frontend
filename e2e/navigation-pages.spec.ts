import { expect, test } from "@playwright/test";

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
    .getByRole("button", { name: "Open KNN Classifier on Iris" })
    .click();

  await expect(page).toHaveURL(/\/problems\/knn-classifier-iris/);
  await expect(
    page.getByRole("heading", { name: /knn classifier on iris/i })
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
