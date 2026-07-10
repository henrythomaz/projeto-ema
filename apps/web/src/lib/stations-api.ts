import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";

/** Formato retornado pelo backend (rota GET /estacoes). */
export type ApiEstacao = {
  id: number;
  nome: string;
  status: "ATIVA" | "INATIVA" | "MANUTENCAO";
  endereco: string | null;
  api_key?: string;
  usuario_proprietario_id: number;
  localizacao: {
    type: "Point";
    // [longitude, latitude]
    coordinates: [number, number];
  } | null;
  criado_em: string;
  atualizado_em: string;
  leituras?: Array<{ id: string | number }>;
};

export type ApiLeitura = {
  id?: number;
  estacao_id: number;
  temperatura: number;
  umidade: number;
  precipitacao: number;
  data_leitura: string;
};

/** Formato usado pela UI da landing (mapa, cards). */
export type UiStation = {
  id: string;
  nome: string;
  cidade: string;
  lat: number;
  lng: number;
  precipitacao: number;
  temperatura: number;
  ativa: boolean;
};

function toUi(e: ApiEstacao, leitura?: ApiLeitura | null): UiStation {
  const [lng, lat] = e.localizacao?.coordinates ?? [0, 0];
  return {
    id: String(e.id),
    nome: e.nome,
    cidade: e.endereco ?? "Sem endereço",
    lat,
    lng,
    precipitacao: leitura?.precipitacao ?? 0,
    temperatura: leitura?.temperatura ?? 0,
    ativa: e.status === "ATIVA",
  };
}

/** Busca todas as estações e a última leitura de cada uma. */
export function useStations() {
  return useQuery({
    queryKey: ["stations", "landing"],
    staleTime: 60_000,
    queryFn: async (): Promise<UiStation[]> => {
      const estacoes = await api<ApiEstacao[]>("/estacoes");
      const withReadings = await Promise.all(
        estacoes.map(async (e) => {
          try {
            const ultima = await api<ApiLeitura>(`/estacoes/${e.id}/leituras/ultima`);
            return toUi(e, ultima);
          } catch {
            return toUi(e, null);
          }
        }),
      );
      // Descarta estações sem coordenadas válidas
      return withReadings.filter((s) => s.lat !== 0 || s.lng !== 0);
    },
  });
}

