import Leitura from "../models/Leitura.js";

interface LeituraData {
  estacao_id: number;
  temperatura: number;
  umidade: number;
  precipitacao: number;
  data_leitura: Date;
}

class SaveLeituraJob {
  get key(): string {
    return "SaveLeitura";
  }

  async handle({ data }: { data: LeituraData }): Promise<void> {
    await Leitura.create({
      estacao_id: data.estacao_id,
      temperatura: data.temperatura,
      umidade: data.umidade,
      precipitacao: data.precipitacao,
      data_leitura: data.data_leitura || new Date(),
    });
  }
}

export default new SaveLeituraJob();
