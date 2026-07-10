import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { z } from "zod";
import { AuthLayout, primaryButtonClass } from "../components/auth/AuthLayout";

const searchSchema = z.object({
  email: z.string().email().optional(),
});

export const Route = createFileRoute("/confirmar-email")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Confirmar e-mail — EMA" },
      { name: "description", content: "Confirme seu e-mail para ativar a conta EMA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmarEmailPage,
});

function ConfirmarEmailPage() {
  const { email } = Route.useSearch();

  return (
    <AuthLayout
      title="Confirme seu e-mail"
      subtitle={
        email
          ? `Enviamos um link de confirmação para ${email}.`
          : "Enviamos um link de confirmação para o e-mail cadastrado."
      }
      footer={
        <>
          Já confirmou?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar agora
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-7 w-7" />
        </span>
        <p className="text-sm text-muted-foreground">
          Verifique sua caixa de entrada — e o spam, por garantia — e clique no link para ativar
          sua conta. Depois de confirmar, você poderá entrar normalmente.
        </p>

        <Link to="/login" className={primaryButtonClass}>
          Ir para o login
        </Link>
      </div>
    </AuthLayout>
  );
}

