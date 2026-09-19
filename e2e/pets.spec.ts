import { test, expect } from "@playwright/test";

test.describe("cadastro de tutor + pet", () => {
  test("cadastro completo: tutor válido, rejeita telefone inválido, cadastra pet", async ({ page }) => {
    await page.goto("/pets");

    // Telefone inválido é rejeitado
    await page.getByLabel("Nome").fill("Maria Teste");
    await page.getByLabel("Telefone").fill("123");
    await page.getByRole("button", { name: "Cadastrar tutor" }).click();
    await expect(page.getByRole("alert").first()).toContainText("formato brasileiro");

    // Telefone válido é aceito
    await page.getByLabel("Telefone").fill("(79) 99999-8888");
    await page.getByRole("button", { name: "Cadastrar tutor" }).click();
    await expect(page.getByText("Maria Teste")).toBeVisible();

    // Cadastra um pet vinculado ao tutor recém-criado
    await page.getByLabel("Tutor").selectOption({ label: "Maria Teste" });
    await page.getByLabel("Nome do pet").fill("Rex");
    await page.getByLabel("Raça").fill("Vira-lata");
    await page.getByRole("button", { name: "Cadastrar pet" }).click();
    await expect(page.getByText("Rex")).toBeVisible();
  });

  test("busca filtra a lista de tutores", async ({ page }) => {
    await page.goto("/pets?busca=zzz-inexistente");
    await expect(page.getByText("Nenhum resultado encontrado.").first()).toBeVisible();
  });
});
