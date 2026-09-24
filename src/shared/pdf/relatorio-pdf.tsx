import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { RelatorioMensal } from "../../features/relatorios/queries";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 16, color: "#475569" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  sectionTitle: { fontSize: 13, marginTop: 16, marginBottom: 8 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
});

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function RelatorioDocument({ dados }: { dados: RelatorioMensal }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PetManager — Relatório Mensal</Text>
        <Text style={styles.subtitle}>
          {MESES[dados.mes - 1]} de {dados.ano}
        </Text>

        <View style={styles.row}>
          <Text>Agendamentos concluídos</Text>
          <Text>{dados.agendamentosConcluidos}</Text>
        </View>
        <View style={styles.row}>
          <Text>Agendamentos cancelados</Text>
          <Text>{dados.agendamentosCancelados}</Text>
        </View>
        <View style={styles.row}>
          <Text>Faturamento total</Text>
          <Text>{formatarMoeda(dados.faturamentoTotal)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Vendas do período</Text>
        {dados.vendas.map((v) => (
          <View key={v.id} style={styles.itemRow}>
            <Text>
              {v.itemNome} ({v.tipo === "produto" ? "Produto" : "Serviço"}) x{v.quantidade}
            </Text>
            <Text>{formatarMoeda(v.valorTotal)}</Text>
          </View>
        ))}
        {dados.vendas.length === 0 && <Text>Nenhuma venda neste período.</Text>}
      </Page>
    </Document>
  );
}

/**
 * Gera o PDF do relatório mensal (REL-06) com os mesmos números
 * exibidos na tela — mesma fonte de dados (`RelatorioMensal`, T38),
 * nada calculado de novo aqui.
 */
export async function renderRelatorioPdf(dados: RelatorioMensal): Promise<Buffer> {
  return renderToBuffer(<RelatorioDocument dados={dados} />);
}
