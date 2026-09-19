import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTutores, getPets } from "../queries";

let result: { data: unknown };

function makeBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.or = vi.fn(chain);
  builder.ilike = vi.fn(chain);
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return builder;
}

const from = vi.fn(() => makeBuilder());

vi.mock("../../../shared/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

describe("getTutores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna a lista completa sem termo de busca", async () => {
    result = { data: [{ id: 1, nome: "Maria", telefone: "+5579999999999" }] };

    const tutores = await getTutores();

    expect(tutores).toHaveLength(1);
    expect(tutores[0].nome).toBe("Maria");
  });

  it("aplica busca por nome/telefone quando um termo é passado", async () => {
    result = { data: [] };

    await getTutores("maria");

    expect(from).toHaveBeenCalledWith("tutores");
    const usedBuilder = from.mock.results[from.mock.results.length - 1].value;
    expect(usedBuilder.or).toHaveBeenCalledWith("nome.ilike.%maria%,telefone.ilike.%maria%");
  });

  it("retorna lista vazia quando não há dados", async () => {
    result = { data: null };

    const tutores = await getTutores();

    expect(tutores).toEqual([]);
  });
});

describe("getPets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna pets ativos mapeados corretamente", async () => {
    result = {
      data: [{ id: 5, tutor_id: 1, nome: "Rex", raca: "Vira-lata", porte: "medio" }],
    };

    const pets = await getPets();

    expect(pets).toEqual([{ id: 5, tutorId: 1, nome: "Rex", raca: "Vira-lata", porte: "medio" }]);
  });

  it("aplica busca por nome quando um termo é passado", async () => {
    result = { data: [] };

    await getPets("rex");

    const usedBuilder = from.mock.results[from.mock.results.length - 1].value;
    expect(usedBuilder.ilike).toHaveBeenCalledWith("nome", "%rex%");
  });
});
