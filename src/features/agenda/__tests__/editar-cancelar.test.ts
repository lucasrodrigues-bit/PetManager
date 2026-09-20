import { describe, it, expect, vi, beforeEach } from "vitest";
import { editarAgendamento, cancelarAgendamento } from "../actions";

const eqUpdate = vi.fn();
const update = vi.fn(() => ({ eq: eqUpdate }));
const eqDelete = vi.fn();
const del = vi.fn(() => ({ eq: eqDelete }));
const insertServicos = vi.fn();

const from = vi.fn((table: string) => {
  if (table === "agendamentos") return { update };
  if (table === "agendamento_servicos") return { delete: del, insert: insertServicos };
  throw new Error(`tabela inesperada: ${table}`);
});

vi.mock("../../../shared/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

describe("editarAgendamento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eqUpdate.mockResolvedValue({ error: null });
    eqDelete.mockResolvedValue({ error: null });
    insertServicos.mockResolvedValue({ error: null });
  });

  it("preserva o id e atualiza pet/data corretamente", async () => {
    const result = await editarAgendamento({ id: 7, petId: 2, dataHora: "2026-09-21T11:00:00" });

    expect(result.error).toBeUndefined();
    expect(update).toHaveBeenCalledWith({ pet_id: 2, data_hora: "2026-09-21T11:00:00" });
    expect(eqUpdate).toHaveBeenCalledWith("id", 7);
  });

  it("substitui os serviços quando servicoIds é informado", async () => {
    const result = await editarAgendamento({ id: 7, servicoIds: [3, 4] });

    expect(result.error).toBeUndefined();
    expect(eqDelete).toHaveBeenCalledWith("agendamento_id", 7);
    expect(insertServicos).toHaveBeenCalledWith([
      { agendamento_id: 7, servico_id: 3 },
      { agendamento_id: 7, servico_id: 4 },
    ]);
  });
});

describe("cancelarAgendamento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eqUpdate.mockResolvedValue({ error: null });
  });

  it("muda o status sem excluir o registro nem tocar em vendas", async () => {
    const result = await cancelarAgendamento(7);

    expect(result.error).toBeUndefined();
    expect(update).toHaveBeenCalledWith({ status: "cancelado" });
    expect(eqUpdate).toHaveBeenCalledWith("id", 7);
    expect(del).not.toHaveBeenCalled();
  });
});
