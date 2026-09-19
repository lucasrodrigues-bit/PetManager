import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProdutos } from "../queries";
import { getCurrentUserRole } from "../../auth/queries";

vi.mock("../../auth/queries", () => ({
  getCurrentUserRole: vi.fn(),
}));

let result: { data: unknown };

function makeBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.ilike = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return builder;
}

const from = vi.fn(() => makeBuilder());

vi.mock("../../../shared/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

describe("getProdutos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    result = { data: [] };
  });

  it("dono recebe a lista com estoqueBaixo calculado", async () => {
    vi.mocked(getCurrentUserRole).mockResolvedValue("dono");
    result = {
      data: [
        { id: 1, nome: "Ração", categoria: "Alimentos", preco_unitario: "50.00", saldo_estoque: 2, estoque_minimo: 5 },
        { id: 2, nome: "Shampoo", categoria: "Higiene", preco_unitario: "20.00", saldo_estoque: 10, estoque_minimo: 3 },
      ],
    };

    const produtos = await getProdutos();

    expect(produtos).toEqual([
      { id: 1, nome: "Ração", categoria: "Alimentos", precoUnitario: 50, saldoEstoque: 2, estoqueMinimo: 5, estoqueBaixo: true },
      { id: 2, nome: "Shampoo", categoria: "Higiene", precoUnitario: 20, saldoEstoque: 10, estoqueMinimo: 3, estoqueBaixo: false },
    ]);
  });

  it("recepcionista recebe lista vazia, sem consultar o banco", async () => {
    vi.mocked(getCurrentUserRole).mockResolvedValue("recepcionista");

    const produtos = await getProdutos();

    expect(produtos).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it("aplica busca e filtro de categoria combinados", async () => {
    vi.mocked(getCurrentUserRole).mockResolvedValue("dono");

    await getProdutos({ busca: "ração", categoria: "Alimentos" });

    const builder = from.mock.results[0].value;
    expect(builder.ilike).toHaveBeenCalledWith("nome", "%ração%");
    expect(builder.eq).toHaveBeenCalledWith("categoria", "Alimentos");
  });
});
