"use client";

import { useEffect, useState } from "react";
import { useListFilters } from "./use-list-filters";

interface SearchFilterBarProps<T extends string> {
  atributos: readonly T[];
  atributoLabels: Record<T, string>;
  placeholder?: string;
  filtroLabel?: string;
  debounceMs?: number;
}

/**
 * Barra de busca + filtro reutilizada em toda tela de listagem. A busca
 * é debounced localmente (não escreve na URL a cada tecla); o filtro de
 * atributo (select) escreve na URL imediatamente.
 */
export function SearchFilterBar<T extends string>({
  atributos,
  atributoLabels,
  placeholder = "Buscar...",
  filtroLabel = "Todos",
  debounceMs = 300,
}: SearchFilterBarProps<T>) {
  const { busca, filtro, setBusca, setFiltro } = useListFilters(atributos);
  const [inputValue, setInputValue] = useState(busca);

  useEffect(() => {
    setInputValue(busca);
  }, [busca]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue !== busca) {
        setBusca(inputValue);
      }
    }, debounceMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, debounceMs]);

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md border px-3 py-2 text-sm"
      />
      {atributos.length > 0 && (
        <select
          value={filtro ?? ""}
          onChange={(e) => setFiltro((e.target.value || null) as T | null)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{filtroLabel}</option>
          {atributos.map((a) => (
            <option key={a} value={a}>
              {atributoLabels[a]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
