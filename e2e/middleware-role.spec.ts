import { test, expect } from "@playwright/test";

const ROTAS_RESTRITAS = ["/estoque", "/vendas/produto", "/relatorios"];

test.describe("middleware de proteção por papel", () => {
  for (const rota of ROTAS_RESTRITAS) {
    test(`sem sessão, ${rota} redireciona para /login`, async ({ page }) => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});

// NOTA: os casos "recepcionista é redirecionado" / "dono acessa
// normalmente" (com sessão real autenticada) dependem da página de
// login existir (T8) e de haver contas de teste dono/recepcionista
// seedadas — ver Notas de execução no tasks.md desta task. Este
// arquivo ganha esses dois cenários assim que T8-T14 estiverem prontos.
