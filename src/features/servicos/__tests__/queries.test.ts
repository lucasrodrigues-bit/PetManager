import { describe, it, expect, vi, beforeEach } from "vitest";
import { getServicosParaAgendamento, getServicosComPreco } from "../queries";

let result: { data: unknown };

function makeBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return builder;
}

const from = vi.fn(() => makeBuilder());

vi.mock("../../../shared/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

describe("getServicosParaAgendamento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pede explicitamente só id e nome ao banco", async () => {
    result = { data: [] };

    await getServicosParaAgendamento();

    const usedBuilder = from.mock.results[0].value;
    expect(usedBuilder.select).toHaveBeenCalledWith("id, nome");
  });

  it("nunca retorna o preço, mesmo que o banco devolva o campo por engano", async () => {
    result = { data: [{ id: 1, nome: "Banho", preco_interno: 40 }] };

    const servicos = await getServicosParaAgendamento();

    expect(servicos).toEqual([{ id: 1, nome: "Banho" }]);
    expect(servicos[0]).not.toHaveProperty("precoInterno");
    expect(servicos[0]).not.toHaveProperty("preco_interno");
  });
});

describe("getServicosComPreco", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna o preço corretamente", async () => {
    result = { data: [{ id: 1, nome: "Banho", preco_interno: "40.00" }] };

    const servicos = await getServicosComPreco();

    expect(servicos).toEqual([{ id: 1, nome: "Banho", precoInterno: 40 }]);
  });
});
