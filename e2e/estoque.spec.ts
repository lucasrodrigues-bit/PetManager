import { test, expect } from "@playwright/test";

test.describe("tela de estoque", () => {
  test("sem sessão, /estoque redireciona para /login", async ({ page }) => {
    await page.goto("/estoque");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("cadastro de produto + entrada de estoque + alerta de estoque baixo", async ({ page }) => {
    await page.goto("/estoque");

    await page.getByLabel("Nome").fill("Ração premium");
    await page.getByLabel("Categoria").fill("Alimentos");
    await page.getByLabel("Preço unitário (R$)").fill("89.90");
    await page.getByLabel("Estoque mínimo").fill("5");
    await page.getByLabel("Saldo inicial").fill("2");
    await page.getByRole("button", { name: "Cadastrar produto" }).click();

    await expect(page.getByText("Ração premium")).toBeVisible();
    await expect(page.getByText("Estoque baixo")).toBeVisible();

    await page.getByLabel("Entrada").fill("10");
    await page.getByRole("button", { name: "Registrar" }).click();

    await expect(page.getByText("12 un.")).toBeVisible();
  });

  // NOTA: "recepcionista não vê o menu nem acessa a rota diretamente"
  // é coberto pela lógica do middleware (T7, já testado ali) + pela
  // checagem de papel em getProdutos (T19, retorna [] pra
  // recepcionista). O cenário de ponta a ponta com uma sessão real de
  // recepcionista depende de conta de teste seedada — mesmo TODO já
  // registrado desde o T7/T8.
});
