import { test, expect } from "@playwright/test";

test.describe("cadastro de horário de funcionamento", () => {
  test("cadastra horário válido para um dia", async ({ page }) => {
    await page.goto("/horario-funcionamento");

    const segundaForm = page.locator("form", { hasText: "Segunda-feira" });
    await segundaForm.getByLabel("Abertura").fill("09:00");
    await segundaForm.getByLabel("Fechamento").fill("18:00");
    await segundaForm.getByRole("button", { name: "Salvar" }).click();

    await expect(segundaForm.getByText("Salvo.")).toBeVisible();
  });

  test("erro de fechamento antes de abertura aparece na UI", async ({ page }) => {
    await page.goto("/horario-funcionamento");

    const tercaForm = page.locator("form", { hasText: "Terça-feira" });
    await tercaForm.getByLabel("Abertura").fill("18:00");
    await tercaForm.getByLabel("Fechamento").fill("09:00");
    await tercaForm.getByRole("button", { name: "Salvar" }).click();

    await expect(tercaForm.getByRole("alert")).toHaveText(
      "O horário de fechamento deve ser depois do horário de abertura.",
    );
  });
});
