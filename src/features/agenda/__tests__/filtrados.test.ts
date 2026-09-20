import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAgendamentosFiltrados } from "../queries";

let result: { data: unknown };

function makeBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return builder;
}

const from = vi.fn(() => makeBuilder());

vi.mock("../../../shared/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

const ROWS = [
  {
    id: 1,
    data_hora: "2026-09-21T09:00:00",
    status: "agendado",
    pets: { nome: "Rex", tutores: { nome: "Maria" } },
  },
  {
    id: 2,
    data_hora: "2026-09-20T09:00:00",
    status: "cancelado",
    pets: { nome: "Bidu", tutores: { nome: "João" } },
  },
];

describe("getAgendamentosFiltrados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("busca vazia retorna todos os agendamentos resolvidos", async () => {
    result = { data: ROWS };

    const agendamentos = await getAgendamentosFiltrados();

    expect(agendamentos).toEqual([
      { id: 1, petNome: "Rex", tutorNome: "Maria", dataHora: "2026-09-21T09:00:00", status: "agendado" },
      { id: 2, petNome: "Bidu", tutorNome: "João", dataHora: "2026-09-20T09:00:00", status: "cancelado" },
    ]);
  });

  it("combina busca por tutor com filtro de status", async () => {
    result = { data: ROWS };

    const agendamentos = await getAgendamentosFiltrados({ busca: "maria", status: "agendado" });

    const builder = from.mock.results[0].value;
    expect(builder.eq).toHaveBeenCalledWith("status", "agendado");
    expect(agendamentos).toEqual([
      { id: 1, petNome: "Rex", tutorNome: "Maria", dataHora: "2026-09-21T09:00:00", status: "agendado" },
    ]);
  });

  it("busca também encontra por nome do pet", async () => {
    result = { data: ROWS };

    const agendamentos = await getAgendamentosFiltrados({ busca: "bidu" });

    expect(agendamentos).toEqual([
      { id: 2, petNome: "Bidu", tutorNome: "João", dataHora: "2026-09-20T09:00:00", status: "cancelado" },
    ]);
  });
});
