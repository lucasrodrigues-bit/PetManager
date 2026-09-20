import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAgendamentosPorDia } from "../queries";

let result: { data: unknown };

function makeBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.gte = vi.fn(chain);
  builder.lte = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return builder;
}

const from = vi.fn(() => makeBuilder());

vi.mock("../../../shared/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

describe("getAgendamentosPorDia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna lista vazia num dia sem agendamentos", async () => {
    result = { data: [] };

    const agendamentos = await getAgendamentosPorDia("2026-09-21");

    expect(agendamentos).toEqual([]);
  });

  it("retorna múltiplos agendamentos do dia, incluindo cancelados", async () => {
    result = {
      data: [
        {
          id: 1,
          pet_id: 10,
          data_hora: "2026-09-21T09:00:00",
          status: "agendado",
          pets: { nome: "Rex" },
          agendamento_servicos: [{ servicos: { nome: "Banho" } }],
        },
        {
          id: 2,
          pet_id: 11,
          data_hora: "2026-09-21T11:00:00",
          status: "cancelado",
          pets: { nome: "Bidu" },
          agendamento_servicos: [{ servicos: { nome: "Tosa" } }],
        },
      ],
    };

    const agendamentos = await getAgendamentosPorDia("2026-09-21");

    expect(agendamentos).toEqual([
      {
        id: 1,
        petId: 10,
        petNome: "Rex",
        dataHora: "2026-09-21T09:00:00",
        status: "agendado",
        servicoNomes: ["Banho"],
      },
      {
        id: 2,
        petId: 11,
        petNome: "Bidu",
        dataHora: "2026-09-21T11:00:00",
        status: "cancelado",
        servicoNomes: ["Tosa"],
      },
    ]);
  });
});
