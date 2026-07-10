import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useStations, type UiStation } from "@/lib/stations-api";
import 'leaflet/dist/leaflet.css';

function stationIcon(active: boolean) {
  const color = active ? "oklch(0.58 0.16 150)" : "oklch(0.5 0.03 250)";
  const html = `
    <div style="position:relative;width:32px;height:32px;">
      <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.25;animation:pulse 2s infinite;"></span>
      <span style="position:absolute;inset:6px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,.2);"></span>
    </div>
  `;
  return L.divIcon({ html, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
}

function MapInner({ stations }: { stations: UiStation[] }) {
  const bounds = useMemo(() => {
    if (stations.length === 0) return null;
    return L.latLngBounds(stations.map((s) => [s.lat, s.lng] as [number, number])).pad(0.3);
  }, [stations]);

  return (
    <MapContainer
      {...(bounds
        ? { bounds }
        : { center: [-15.78, -47.93] as [number, number], zoom: 4 })}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="rounded-3xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={stationIcon(s.ativa)}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-bold text-sm">{s.nome}</p>
              <p className="text-xs text-neutral-500">{s.cidade}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span>🌧 {s.precipitacao} mm</span>
                <span>🌡 {s.temperatura}°C</span>
              </div>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  s.ativa ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {s.ativa ? "Ativa" : "Inativa"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export function StationsMap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: stations, isLoading, error } = useStations();

  return (
    <section id="mapa" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Rede de estações
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Nossa cobertura em tempo real
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Cada marcador representa uma estação enviando leituras. Clique para ver a última
          precipitação e temperatura.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="h-[520px] overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-elegant)]"
      >
        {!mounted || isLoading ? (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Carregando mapa...
          </div>
        ) : error ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted p-6 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Não foi possível carregar as estações</p>
            <p className="text-xs">{(error as Error).message}</p>
          </div>
        ) : (
          <MapInner stations={stations ?? []} />
        )}
      </motion.div>

      {stations && stations.length > 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {stations.length} estação(ões) carregada(s) da API.
        </p>
      )}
    </section>
  );
}

