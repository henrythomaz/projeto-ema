import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { api, API_BASE_URL } from "@/lib/api-client";
import 'swagger-ui-react/swagger-ui.css';

// Swagger UI depende do DOM — só pode ser importado no cliente.
const SwaggerUI = lazy(() => import("swagger-ui-react"));

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação da API — EMA" },
      {
        name: "description",
        content:
          "Documentação interativa (Swagger UI) da API do projeto EMA — Estações Meteorológicas Automatizadas.",
      },
      { property: "og:title", content: "Documentação da API — EMA" },
      {
        property: "og:description",
        content: "Referência completa e interativa da API do projeto EMA.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://unpkg.com/swagger-ui-react@5.32.8/swagger-ui.css",
      },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Documentação da API
          </h1>
          <p className="mt-2 text-muted-foreground">
            Endpoints do backend EMA carregados de{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {API_BASE_URL}/docs.json
            </code>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-2 shadow-[var(--shadow-elegant)]">
          <ClientOnly fallback={<Loading />}>
            <Suspense fallback={<Loading />}>
              <SwaggerLoader />
            </Suspense>
          </ClientOnly>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
      Carregando documentação...
    </div>
  );
}

function SwaggerLoader() {
  const [spec, setSpec] = useState<unknown | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<unknown>("/docs.json")
      .then(setSpec)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Não foi possível carregar a documentação</p>
        <p className="text-xs">{err}</p>
      </div>
    );
  }
  if (!spec) return <Loading />;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <SwaggerUI spec={spec as any} />;
}

