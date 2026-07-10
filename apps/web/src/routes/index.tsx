import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { StationsMap } from "@/components/landing/StationsMap";
import { AboutSection } from "@/components/landing/AboutSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { PlanoDialog } from "@/components/landing/PlanoDialog";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [planoOpen, setPlanoOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <StationsMap />
        <AboutSection onOpenPlano={() => setPlanoOpen(true)} />
        <TeamSection />
      </main>
      <Footer />
      <PlanoDialog open={planoOpen} onClose={() => setPlanoOpen(false)} />
    </div>
  );
}

