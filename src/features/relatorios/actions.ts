"use server";

import { getRelatorioMensal } from "./queries";
import { renderRelatorioPdf } from "../../shared/pdf/relatorio-pdf";

interface GerarRelatorioPdfResult {
  error?: string;
  base64?: string;
  fileName?: string;
}

/**
 * Gera o PDF do relatório mensal (REL-06) chamando `getRelatorioMensal`
 * (T38) + `renderRelatorioPdf` (T39). Retorna o PDF como base64 (Server
 * Actions não serializam `Buffer` binário direto pro client) — quem
 * consome decodifica e dispara o download.
 *
 * Qualquer falha na geração é capturada e vira `{ error }` — nunca
 * lança, pra tela do relatório continuar funcionando normalmente
 * mesmo se o PDF falhar (REL-07).
 */
export async function gerarRelatorioPdf(ano: number, mes: number): Promise<GerarRelatorioPdfResult> {
  try {
    const dados = await getRelatorioMensal(ano, mes);
    const buffer = await renderRelatorioPdf(dados);

    return {
      base64: buffer.toString("base64"),
      fileName: `relatorio-${ano}-${String(mes).padStart(2, "0")}.pdf`,
    };
  } catch {
    return { error: "Não foi possível gerar o PDF. Tente novamente." };
  }
}
