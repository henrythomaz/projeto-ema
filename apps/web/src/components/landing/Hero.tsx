import { motion } from "framer-motion";
import { ArrowRight, Droplets, Thermometer, Wind } from "lucide-react";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Monitoramento em tempo real
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Dados climáticos que{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              conectam pesquisa
            </span>{" "}
            e comunidade.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            O EMA é uma rede colaborativa de estações meteorológicas automatizadas.
            Visualize leituras, compare estações e contribua com ciência aberta.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#cadastro"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:scale-[1.03]"
            >
              Começar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#sobre"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-muted"
            >
              Saiba mais
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 grid grid-cols-3 gap-3 max-w-md flex"
          >
            {[
              { icon: Thermometer, label: "Temperatura", value: "" },
              { icon: Droplets, label: "Umidade", value: "" },
              { icon: Wind, label: "Vento", value: "" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur"
              >
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative aspect-square max-w-lg mx-auto">
            <div className="absolute inset-0 rounded-full bg-[image:var(--gradient-primary)] blur-3xl opacity-40" />
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="grid h-72 w-72 place-items-center rounded-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
                <div className="grid h-56 w-56 place-items-center rounded-full bg-background/95">
                  <div className="text-center">
                    <p className="text-6xl font-black bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                      6+
                    </p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      Estações ativas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

