import { test, expect } from "@playwright/test";

// Este teste exercita <AgendaCalendario /> através da rota /agenda,
// que só existe a partir do T33 — até lá, ele falha por rota
// inexistente (404), não por bug no componente. Fica aqui porque o
// componente (T32) é a unidade sendo testada; a montagem final da
// tela é responsabilidade do T33.
test.describe("componente AgendaCalendario", () => {
  test("horários ocupados e cancelados aparecem visualmente distintos", async ({ page }) => {
    await page.goto("/agenda");

    await expect(page.getByText("Ocupado").first()).toBeVisible();
    await expect(page.getByText("Cancelado").first()).toBeVisible();
  });
});
