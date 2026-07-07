import { useState } from "react";
import { Link } from "react-router-dom";
import HourlyForecast from "../components/HourlyForecast";
import type { DadoPrevisao } from "../components/HourlyForecast";
import { FaGithub, FaTimes } from "react-icons/fa";
import logoIcon from "../assets/icone.png";
import Img1 from "../assets/home-img1.png";
import Map from "../components/Map";
import PlanoPesquisa from "../components/PlanoPesquisa";
import { motion } from "motion/react";

const Home = () => {
  const [openPDF, setOpenPDF] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [dadosPrevisao, setDadosPrevisao] = useState<DadoPrevisao[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [estacaoSelecionada, setEstacaoSelecionada] = useState<string | null>(
    null,
  );

  return (
    <div className="flex font-sans">
      <div
        className={`bg-white text-gray-800 min-h-screen transition-all duration-300 ${
          openPDF ? "w-1/2" : "w-full"
        }`}
      >
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <img src={logoIcon} alt="Logo EMA" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-gray-800">EMA</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/henryifms/projeto-ema"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-green-600 transition"
            >
              <FaGithub size={22} />
            </a>
            <Link
              to="/docs"
              className="text-gray-700 hover:text-green-600 transition"
            >
              Documentação
            </Link>
            </div>
        </header>

        <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white min-h-screen">

  {/* Círculo */}
  <motion.div
  initial={{ opacity: 0, scale: 0.85 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 1,
    delay: 0.2,
  }}
  className="absolute right-[-120px] -top-52 w-[800px] h-[800px] rounded-full overflow-hidden shadow-2xl border-8 border-white"
>
    <img
      src={Img1}
      alt="Imagem"
      className="w-full h-full object-cover"
    />
  </motion.div>

  {/* Conteúdo */}
  <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="relative z-10 max-w-7xl mx-auto min-h-screen flex items-center px-10"
>

    <div className="max-w-xl pb-10">
      <h2 className="text-6xl font-extrabold leading-tight text-gray-900">
        Monitoramento
        <br />
        meteorológico
        <br />
        inteligente
      </h2>

      <p className="mt-8 text-xl text-gray-600 leading-8">
        Crie sua conta gratuitamente e acompanhe dados climáticos em tempo real
        através das estações meteorológicas do Projeto EMA.
      </p>

      <div className="flex gap-4 mt-10">
        <Link
          to="/login"
          className="bg-green-600 text-white px-7 py-3 rounded-xl hover:bg-green-700 transition"
        >
          Começar agora
        </Link>

        <Link
          to="/sobre"
          className="border border-gray-300 px-7 py-3 rounded-xl hover:bg-gray-100 transition"
        >
          Saiba mais
        </Link>
      </div>
    </div>

  </motion.div>

</section>

{/* MAPA */}
        <motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7 }}
  className="p-6 max-w-6xl mx-auto"
>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-2xl font-semibold text-green-600">
              Estações em tempo real
            </h3>
            <button
              onClick={() => setOpenMap(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition underline decoration-2 underline-offset-4"
            >
              Ampliar Mapa
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative group">
            <div className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-xs font-bold text-gray-600">
                Clique para expandir
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative z-0">
              <Map altura="500px" onSelectEstacao={setEstacaoSelecionada} />
            </div>
          </div>

          </motion.section>


<motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7 }}
  className="py-24 bg-white"
>
  <div className="max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-center gap-20">

    {/* Imagem */}
    <motion.div
  initial={{ opacity: 0, x: -80 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full lg:w-1/2"
>
      <img
        src={Img1}
        alt="Estação meteorológica"
        className="w-full rounded-3xl shadow-2xl"
      />
    </motion.div>

    {/* Texto */}
    <div className="w-full lg:w-1/2">
      <h2 className="text-5xl font-bold text-gray-900 leading-tight">
        Dados climáticos em tempo real
      </h2>

      <p className="mt-6 text-xl text-gray-600 leading-8">
        Acompanhe temperatura, umidade, pressão atmosférica e diversas outras
        informações coletadas pelas estações meteorológicas do Projeto EMA,
        permitindo um monitoramento preciso e confiável.
      </p>
    </div>

  </div>
</motion.section>

<section className="py-32 bg-gray-50 overflow-hidden">
  <div className="max-w-7xl mx-auto px-10 flex flex-col-reverse lg:flex-row items-center">

    {/* Texto */}
    <div className="w-full lg:w-2/5 lg:pl-16 z-10">
      <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
        Monitoramento
        <br />
        preciso e contínuo
      </h2>

      <p className="mt-6 text-lg text-gray-600 leading-8">
        Tenha acesso a informações detalhadas sobre as condições climáticas,
        permitindo acompanhar as variações do tempo de forma simples,
        confiável e em tempo real.
      </p>
    </div>

    {/* Imagem */}
    <div className="relative w-full lg:w-3/5 flex justify-end">
  <img
    src={Img1}
    alt="Monitoramento climático"
    className="w-[750px] rounded-[40px] shadow-2xl"
  />

  <div className="absolute inset-0 rounded-[40px] bg-gradient-to-l from-transparent via-transparent to-gray-50/80" />
</div>
  </div>
</section>

        
        <footer className="text-center text-sm text-gray-400 p-10">
          © 2026 Projeto EMA
        </footer>
      </div>

      {/* MODAL DO MAPA (Versão Limpa) */}
      {openMap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 md:p-10">
          <div className="w-full h-full bg-white rounded-3xl overflow-hidden relative shadow-2xl border border-white/20">
            <button
              onClick={() => setOpenMap(false)}
              className="absolute top-6 right-6 z-[10000] bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold shadow-xl transition-transform active:scale-95"
            >
              Fechar Mapa
            </button>
            <Map altura="100%" onSelectEstacao={setEstacaoSelecionada} />
          </div>
        </div>
      )}

      {/* BARRA LATERAL DO PDF */}
      {openPDF && (
        <div className="w-1/2 h-screen border-l overflow-hidden sticky top-0 relative bg-white">
          {/* Botão X para fechar o PDF */}
          <button
            onClick={() => setOpenPDF(false)}
            className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition"
            aria-label="Fechar plano de pesquisa"
          >
            <FaTimes size={20} />
          </button>
          <PlanoPesquisa />
        </div>
      )}
    </div>
  );
};

export default Home;
