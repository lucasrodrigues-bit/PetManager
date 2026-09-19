import { Suspense } from "react";
import { getPets, getTutores } from "../../../features/pets/queries";
import { SearchFilterBar } from "../../../shared/filters/search-filter-bar";
import { CriarPetForm } from "./criar-pet-form";
import { CriarTutorForm } from "./criar-tutor-form";

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const { busca } = await searchParams;
  const [tutoresFiltrados, pets, todosTutores] = await Promise.all([
    getTutores(busca),
    getPets(busca),
    getTutores(),
  ]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-black">Clientes e Pets</h1>
      <p className="mt-2 text-sm text-slate-600">
        Cadastre tutores e seus pets. A busca abaixo filtra as duas listas.
      </p>

      <div className="mt-4">
        <Suspense fallback={null}>
          <SearchFilterBar atributos={[]} atributoLabels={{}} placeholder="Buscar por nome ou telefone..." />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold">Tutores</h2>
          <CriarTutorForm />
          <ul className="mt-4 grid gap-2">
            {tutoresFiltrados.map((t) => (
              <li key={t.id} className="rounded-lg border p-3">
                <p className="font-bold">{t.nome}</p>
                <p className="text-sm text-slate-600">{t.telefone}</p>
              </li>
            ))}
            {tutoresFiltrados.length === 0 && (
              <p className="text-sm text-slate-500">Nenhum resultado encontrado.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">Pets</h2>
          <CriarPetForm tutores={todosTutores} />
          <ul className="mt-4 grid gap-2">
            {pets.map((p) => (
              <li key={p.id} className="rounded-lg border p-3">
                <p className="font-bold">{p.nome}</p>
                <p className="text-sm text-slate-600">
                  {p.raca} · {p.porte}
                </p>
              </li>
            ))}
            {pets.length === 0 && (
              <p className="text-sm text-slate-500">Nenhum resultado encontrado.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
