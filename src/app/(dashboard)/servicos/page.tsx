import { getServicosComPreco } from "../../../features/servicos/queries";
import { CriarServicoForm } from "./criar-servico-form";

export default async function ServicosPage() {
  const servicos = await getServicosComPreco();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-black">Serviços</h1>
      <p className="mt-2 text-sm text-slate-600">
        O preço interno nunca aparece na tela de agendamento.
      </p>

      <CriarServicoForm />

      <ul className="mt-6 grid gap-2">
        {servicos.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg border p-3">
            <span className="font-bold">{s.nome}</span>
            <span className="text-sm text-slate-600">
              {s.precoInterno.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </li>
        ))}
        {servicos.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum serviço cadastrado.</p>
        )}
      </ul>
    </div>
  );
}
