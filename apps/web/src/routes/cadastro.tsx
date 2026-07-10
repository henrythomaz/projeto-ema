import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { z } from "zod";
import { AuthLayout, Field, inputClass, primaryButtonClass } from "../components/auth/AuthLayout";
import { Recaptcha, RECAPTCHA_ENABLED } from "../components/auth/Recaptcha";
import { signUp } from "../lib/auth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — EMA" },
      { name: "description", content: "Crie sua conta no EMA para acessar dados e ferramentas." },
    ],
  }),
  component: CadastroPage,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"],
  message: "As senhas não coincidem",
});

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCaptcha = useCallback((t: string | null) => setCaptcha(t), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (RECAPTCHA_ENABLED && !captcha) {
      setSubmitError("Confirme o reCAPTCHA para continuar.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ 
        nome: form.nome, 
        email: form.email, 
        password: form.password,
        captchaToken: captcha || '', // <-- envia o token
      });
      navigate({ to: "/confirmar-email", search: { email: form.email } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Nome completo" htmlFor="nome" error={errors.nome}>
          <input
            id="nome"
            className={inputClass}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Seu nome"
            autoComplete="name"
          />
        </Field>

        <Field label="E-mail" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="voce@exemplo.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Senha" htmlFor="password" error={errors.password}>
          <input
            id="password"
            type="password"
            className={inputClass}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirmar senha" htmlFor="confirm" error={errors.confirm}>
          <input
            id="confirm"
            type="password"
            className={inputClass}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            autoComplete="new-password"
          />
        </Field>

        <div className="flex justify-center pt-1">
          <Recaptcha onChange={onCaptcha} />
        </div>

        {submitError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </AuthLayout>
  );
}
