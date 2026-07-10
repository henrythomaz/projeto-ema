import { useEffect, useRef, memo } from "react";

/**
 * Widget do Google reCAPTCHA v2. Carrega o script sob demanda e
 * renderiza o desafio quando VITE_RECAPTCHA_SITE_KEY está definida.
 * Chama onChange(token | null) conforme o estado da verificação.
 */
declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      reset: (id?: number) => void;
    };
    __emaRecaptchaReady?: boolean;
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

function loadScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (window.grecaptcha) return resolve();
    const existing = document.getElementById("recaptcha-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = "recaptcha-script";
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

export const Recaptcha = memo(function Recaptcha({ onChange }: { onChange: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let cancelled = false;

    (async () => {
      await loadScript();
      // aguarda grecaptcha.render estar disponível
      const wait = () =>
        new Promise<void>((res) => {
          const tick = () => {
            if (window.grecaptcha?.render) res();
            else setTimeout(tick, 60);
          };
          tick();
        });
      await wait();
      if (cancelled || !ref.current || widgetId.current !== null) return;
      widgetId.current = window.grecaptcha!.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onChange(token),
        "expired-callback": () => onChange(null),
        "error-callback": () => onChange(null),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  if (!SITE_KEY) {
    return (
      <p className="text-xs text-muted-foreground">
        reCAPTCHA desativado (defina <code>VITE_RECAPTCHA_SITE_KEY</code> no <code>.env</code>).
      </p>
    );
  }

  return <div ref={ref} />;
});

export const RECAPTCHA_ENABLED = Boolean(SITE_KEY);
