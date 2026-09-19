import { getHorarios } from "../../../features/horario-funcionamento/queries";
import { HorarioDiaForm } from "./horario-dia-form";

const DIAS_DA_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default async function HorarioFuncionamentoPage() {
  const horarios = await getHorarios();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-black">Horário de funcionamento</h1>
      <p className="mt-2 text-sm text-slate-600">
        Cadastre o horário de cada dia. Dias sem horário ficam fechados na
        agenda.
      </p>

      <div className="mt-6 grid gap-3">
        {DIAS_DA_SEMANA.map((nomeDia, diaSemana) => {
          const horario = horarios.find((h) => h.diaSemana === diaSemana) ?? null;
          return (
            <HorarioDiaForm
              key={diaSemana}
              diaSemana={diaSemana}
              nomeDia={nomeDia}
              horario={horario}
            />
          );
        })}
      </div>
    </div>
  );
}
