import { motion } from "framer-motion";
import { Github, Linkedin, GraduationCap } from "lucide-react";

type Member = {
  nome: string;
  funcao: string;
  bio: string;
  iniciais: string;
  github?: string;
  linkedin?: string;
  lattes?: string;
};

const team: Member[] = [
  { nome: "Integrante 1", funcao: "Coordenação", bio: "Pesquisa e liderança do projeto EMA.", iniciais: "I1", github: "#", linkedin: "#", lattes: "#" },
  { nome: "Integrante 2", funcao: "Backend & API", bio: "Arquitetura da API e persistência de dados.", iniciais: "I2", github: "#", linkedin: "#", lattes: "#" },
  { nome: "Integrante 3", funcao: "Frontend Web", bio: "Interface web, mapas e visualização.", iniciais: "I3", github: "#", linkedin: "#", lattes: "#" },
  { nome: "Integrante 4", funcao: "Hardware & IoT", bio: "Sensores, firmware e integração das estações.", iniciais: "I4", github: "#", linkedin: "#", lattes: "#" },
];

export function TeamSection() {
  return (
    <section id="equipe" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Quem faz o EMA
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Nossa equipe</h2>
        <p className="mt-3 text-muted-foreground">
          Um time multidisciplinar unindo pesquisa, engenharia e design.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m, i) => (
          <motion.article
            key={m.nome}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xl font-black text-primary-foreground shadow-[var(--shadow-glow)]">
              {m.iniciais}
            </div>
            <h3 className="mt-4 text-base font-bold">{m.nome}</h3>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">{m.funcao}</p>
            <p className="mt-2 text-sm text-muted-foreground">{m.bio}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {m.github && (
                <a href={m.github} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              )}
              {m.linkedin && (
                <a href={m.linkedin} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {m.lattes && (
                <a href={m.lattes} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Lattes">
                  <GraduationCap className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

