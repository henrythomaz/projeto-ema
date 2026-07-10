import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TableLeituras from "../TableLeituras";
import { useCurrentUserId } from "./hooks/useCurrentUserId";
import { useEstacao } from "./hooks/useEstacao";
import { useLeituras } from "./hooks/useLeituras";
import { EstacaoHeader } from "./components/EstacaoHeader";
import { MapSection } from "./components/MapSection";
import { SmallFiltersPanel } from "./components/SmallFiltersPanel";
import { MetricChartPanel } from "./components/MetricChartPanel";
import { StationInfo } from "./components/StationInfo";
import { buildOverlaySeries } from "./utils/builders";
import { formatNumber, formatDate } from "./utils/formatters";
import type { MetricTab, LogEntry } from "./types";
import SobreEstacao from "../SobreEstacao.tsx"

export default function Main() {
  const { id } = useParams();
  const {
    estacao,
    ultimaLeitura,
    todasEstacoes,
    loading,
    error
  } = useEstacao(id);
  const {
    filters,
    setFilters,
    queryState,
    setQueryState,
    leituras,
    rawResponse,
    loading: loadingLeituras,
  } = useLeituras(id);
  const currentUserId = useCurrentUserId();

  const [selectedStations] = useState<number[]>([]);

  // @ts-ignore
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeMetric, setActiveMetric] = useState<MetricTab>("temperatura");

  useEffect(() => {
    if (currentUserId)
      (window as { __CURRENT_USER_ID__?: number }).__CURRENT_USER_ID__ =
        currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!estacao || !ultimaLeitura) return;
    setLogs([
      {
        id: 1,
        tipo: "LEITURA",
        titulo: "Nova leitura registrada",
        descricao: `Temperatura ${formatNumber(ultimaLeitura.temperatura)}°C às ${formatDate(
          ultimaLeitura.data_leitura,
        )}`,
      },
      {
        id: 2,
        tipo: "ALERTA",
        titulo: "Análise de extremo térmico",
        descricao:
          ultimaLeitura.temperatura > 40
            ? "Temperatura acima da faixa operacional recomendada."
            : "Sem extremos críticos recentes para temperatura.",
      },
      {
        id: 3,
        tipo: "SISTEMA",
        titulo: "Sincronização concluída",
        descricao:
          "Leituras e contexto espacial carregados para a estação atual.",
      },
    ]);
  }, [estacao, ultimaLeitura]);

  const selectedStationObjects = useMemo(
    () =>
      todasEstacoes.filter(
        (station) =>
          selectedStations.includes(station.id) && station.id !== Number(id),
      ),
    [todasEstacoes, selectedStations, id],
  );

  const chartData = useMemo(
    () =>
      leituras
        .slice()
        .sort(
          (a, b) =>
            new Date(a.data_leitura).getTime() -
            new Date(b.data_leitura).getTime(),
        )
        .map((item) => ({
          ...item,
          timestampLabel: new Date(item.data_leitura).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
    [leituras],
  );

  const overlayData = useMemo(
    () => buildOverlaySeries(leituras, selectedStationObjects, activeMetric),
    [leituras, selectedStationObjects, activeMetric],
  );

  if (loading) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
    </div>
  );
}

if (error || !estacao) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
      {error || "Estação não encontrada."}
    </div>
  );
}

  return (
    <div className="space-y-8 pb-8">
      <EstacaoHeader
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
          <MapSection
            estacao={estacao}
          />

          <SobreEstacao />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 2xl:grid-cols-[0.62fr_1.38fr]">
        <div className="space-y-6">
          <SmallFiltersPanel
            filters={filters}
            queryState={queryState}
            onChangeFilters={setFilters}
            onChangeQueryState={setQueryState}
            onReset={() => {
              setFilters({
                criadaDepois: "",
                criadaAntes: "",
                temperatura_min: "",
                temperatura_max: "",
                umidade_min: "",
                umidade_max: "",
                pressao_atmosferica_min: "",
                pressao_atmosferica_max: "",
                velocidade_vento_min: "",
                velocidade_vento_max: "",
                precipitacao_min: "",
                precipitacao_max: "",
              });
              setQueryState({ page: 1, limit: 10, sort: "data_leitura:desc" });
            }}
          />
          <StationInfo estacao={estacao} ultimaLeitura={ultimaLeitura} />
        </div>

        <MetricChartPanel
          chartData={chartData}
          overlayData={overlayData}
          overlayStations={[estacao, ...selectedStationObjects]}
          activeMetric={activeMetric}
          onMetricChange={setActiveMetric}
          loading={loadingLeituras}
        />
      </section>

      <TableLeituras
        leituras={leituras}
        rawResponse={rawResponse}
        queryState={queryState}
        onChangeQueryState={setQueryState}
      />
    </div>
  );
}
