import Map from "../../Map";
import type { EstacaoResumo } from "../types";

interface MapSectionProps {
  estacao: EstacaoResumo;
}

export function MapSection({
  estacao
}: MapSectionProps) {
  return (
    <section className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
      <div className="mb-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      </div>

      <div className="">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Map
            altura="500px"
            center={[
              estacao.localizacao.coordinates[1],
              estacao.localizacao.coordinates[0],
            ]}
          />
        </div>
      </div>
    </section>
  );
}
