import { Suspense } from "react";
import { getProdutos } from "../../../features/estoque/queries";
import { SearchFilterBar } from "../../../shared/filters/search-filter-bar";
import { CriarProdutoForm } from "./criar-produto-form";
import { RegistrarEntradaForm } from "./registrar-entrada-form";

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; filtro?: string }>;
}) {
  const { busca, filtro } = await searchParams;
  const [produtosFiltrados, todosProdutos] = await Promise.all([
    getProdutos({ busca, categoria: filtro }),
    getProdutos(),
  ]);

  const categorias = Array.from(new Set(todosProdutos.map((p) => p.categoria))).sort();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-black">Estoque</h1>
      <p className="mt-2 text-sm text-slate-600">
        Cadastre produtos e registre entradas. Saída só acontece via venda.
      </p>

      <CriarProdutoForm />

      <div className="mt-6">
        <Suspense fallback={null}>
          <SearchFilterBar
            atributos={categorias}
            atributoLabels={Object.fromEntries(categorias.map((c) => [c, c]))}
            placeholder="Buscar produto..."
            filtroLabel="Todas as categorias"
          />
        </Suspense>
      </div>

      <ul className="mt-4 grid gap-3">
        {produtosFiltrados.map((p) => (
          <li key={p.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{p.nome}</p>
                <p className="text-sm text-slate-600">{p.categoria}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{p.saldoEstoque} un.</p>
                {p.estoqueBaixo && (
                  <p role="status" className="text-xs font-bold text-red-700">
                    Estoque baixo
                  </p>
                )}
              </div>
            </div>
            <RegistrarEntradaForm produtoId={p.id} />
          </li>
        ))}
        {produtosFiltrados.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum produto encontrado.</p>
        )}
      </ul>
    </div>
  );
}
