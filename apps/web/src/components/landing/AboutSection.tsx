import { motion } from "framer-motion";
import { GraduationCap, Radio, Users } from "lucide-react";

const cards = [
  {
    icon: GraduationCap,
    title: "Contexto acadêmico",
    desc: "Nascido de pesquisa universitária para democratizar dados climáticos e apoiar estudos ambientais.",
  },
  {
    icon: Radio,
    title: "Dados em tempo real",
    desc: "Leituras contínuas de temperatura, umidade, pressão, vento e precipitação disponíveis via API aberta.",
  },
  {
    icon: Users,
    title: "Gestão colaborativa",
    desc: "Cada estação tem proprietários e equipe. Convide colaboradores e compartilhe responsabilidades.",
  },
];

export function AboutSection({ onOpenPlano }: { onOpenPlano: () => void }) {
  return (
    <section id="sobre" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Sobre o projeto
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Ciência aberta, dados confiáveis.
          </h2>
          <p className="mt-4 text-muted-foreground">
            O EMA nasceu para transformar a coleta de dados meteorológicos em algo
            acessível, transparente e colaborativo — do sensor ao gráfico.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <div>
            <h3 className="text-lg font-bold">Plano de pesquisa</h3>
            <p className="text-sm text-muted-foreground">
              Veja a proposta acadêmica completa em PDF.
            </p>
          </div>
          <button
            onClick={onOpenPlano}
            className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.03]"
          >
            Abrir plano →
          </button>
        </motion.div>
      </div>
    </section>
  );
}

