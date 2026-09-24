import { describe, it, expect } from "vitest";
import { renderRelatorioPdf } from "../relatorio-pdf";
import type { RelatorioMensal } from "../../../features/relatorios/queries";

const RELATORIO: RelatorioMensal = {
  ano: 2026,
  mes: 9,
  agendamentosConcluidos: 3,
  agendamentosCancelados: 1,
  faturamentoTotal: 150.5,
  vendas: [
    {
      id: 1,
      tipo: "servico",
      itemNome: "Banho",
      quantidade: 1,
      valorTotal: 40,
      criadoEm: "2026-09-10T12:00:00Z",
    },
  ],
};

describe("renderRelatorioPdf", () => {
  it("gera um buffer PDF válido e não vazio", async () => {
    const buffer = await renderRelatorioPdf(RELATORIO);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // Todo PDF começa com essa assinatura ("%PDF-") — garante que não
    // é um buffer corrompido/vazio disfarçado de sucesso.
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("gera PDF mesmo para um mês sem vendas", async () => {
    const buffer = await renderRelatorioPdf({ ...RELATORIO, vendas: [], faturamentoTotal: 0 });

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
