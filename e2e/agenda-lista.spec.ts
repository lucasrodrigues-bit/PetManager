import { test, expect } from "@playwright/test";

test.describe("listagem de agendamentos com filtros", () => {
  test("lista carrega e mostra o campo de busca", async ({ page }) => {
    await page.goto("/agenda/lista");
    await expect(page.getByPlaceholder("Buscar por pet ou tutor...")).toBeVisible();
  });

  test("busca e filtro de status combinados atualizam a URL sem recarregar", async ({ page }) => {
    await page.goto("/agenda/lista");

    await page.getByPlaceholder("Buscar por pet ou tutor...").fill("rex");
    await page.getByRole("combobox").selectOption("cancelado");

    await page.waitForURL(/busca=rex/);
    await expect(page).toHaveURL(/filtro=cancelado/);
  });
});
