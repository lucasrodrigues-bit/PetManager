import { test, expect } from "@playwright/test";

test.describe("tela de agenda - fluxo completo de estados", () => {
  test("criar, editar, cancelar, reabrir, concluir e efeito em Vendas", async ({ page }) => {
    await page.goto("/agenda");

    // Criar
    await page.getByLabel("Pet").selectOption({ index: 1 });
    await page.getByLabel("Horário").fill("10:00");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: "Criar agendamento" }).click();

    const item = page.locator('[data-status]', { hasText: "10:00" }).first();
    await expect(item).toBeVisible();
    await expect(item).toHaveAttribute("data-status", "agendado");

    // Editar
    await item.getByRole("button", { name: "Editar" }).click();
    await item.locator('input[type="time"]').fill("11:00");
    await item.getByRole("button", { name: "Salvar" }).click();
    await expect(page.locator('[data-status]', { hasText: "11:00" })).toBeVisible();

    // Cancelar
    const itemEditado = page.locator('[data-status]', { hasText: "11:00" }).first();
    await itemEditado.getByRole("button", { name: "Cancelar" }).click();
    await expect(itemEditado).toHaveAttribute("data-status", "cancelado");

    // Reabrir (volta a agendado)
    await itemEditado.getByRole("button", { name: "Reabrir" }).click();
    await expect(itemEditado).toHaveAttribute("data-status", "agendado");

    // Concluir -> deve gerar venda
    await itemEditado.getByRole("button", { name: "Concluir" }).click();
    await expect(itemEditado).toHaveAttribute("data-status", "concluido");

    await page.goto("/vendas");
    await expect(page.getByText("Total do período:")).toBeVisible();
  });

  test("botão de ação desabilita imediatamente após o clique", async ({ page }) => {
    await page.goto("/agenda");

    await page.getByLabel("Pet").selectOption({ index: 1 });
    await page.getByLabel("Horário").fill("14:00");
    await page.getByRole("checkbox").first().check();

    const botao = page.getByRole("button", { name: "Criar agendamento" });
    await botao.click();

    await expect(botao).toBeDisabled();
  });
});
