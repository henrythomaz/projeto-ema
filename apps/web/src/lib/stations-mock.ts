export type Station = {
  id: string;
  nome: string;
  cidade: string;
  lat: number;
  lng: number;
  precipitacao: number;
  temperatura: number;
  ativa: boolean;
};

export const mockStations: Station[] = [
  { id: "1", nome: "EMA Campus Central", cidade: "São Paulo, SP", lat: -23.5558, lng: -46.6396, precipitacao: 2.4, temperatura: 22.1, ativa: true },
  { id: "2", nome: "EMA Litoral Norte", cidade: "Ubatuba, SP", lat: -23.4336, lng: -45.0838, precipitacao: 12.8, temperatura: 26.3, ativa: true },
  { id: "3", nome: "EMA Serra", cidade: "Campos do Jordão, SP", lat: -22.7395, lng: -45.5911, precipitacao: 0.6, temperatura: 14.7, ativa: true },
  { id: "4", nome: "EMA Sul", cidade: "Curitiba, PR", lat: -25.4284, lng: -49.2733, precipitacao: 5.1, temperatura: 17.9, ativa: false },
  { id: "5", nome: "EMA Nordeste", cidade: "Recife, PE", lat: -8.0476, lng: -34.877, precipitacao: 18.3, temperatura: 29.4, ativa: true },
  { id: "6", nome: "EMA Amazônia", cidade: "Manaus, AM", lat: -3.119, lng: -60.0217, precipitacao: 24.9, temperatura: 31.2, ativa: true },
];

