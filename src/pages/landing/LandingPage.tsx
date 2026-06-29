import {
  Calendar,
  CalendarX,
  Check,
  DollarSign,
  Globe,
  Image,
  MessageCircle,
  Settings,
  Share2,
  UserPlus,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const problemCards = [
  { icon: CalendarX, title: "Agenda baguncada", text: "Horarios perdidos, mensagens espalhadas e encaixes que viram dor de cabeca." },
  { icon: UserX, title: "Clientes que somem", text: "Sem processo claro, muita gente pede e desaparece antes de fechar." },
  { icon: DollarSign, title: "Financeiro no escuro", text: "Sinal, final, caixa e cancelamentos ficam sem controle real." },
  { icon: Globe, title: "Sem presenca profissional", text: "O estudio fica dependente de perfil social e sem pagina propria." },
  { icon: MessageCircle, title: "WhatsApp sobrecarregado", text: "Tudo cai no mesmo numero e responder vira um caos." },
  { icon: Users, title: "Tatuadores desorganizados", text: "Cada artista resolve do seu jeito e o estudio perde padrao." },
];

const steps = [
  { icon: UserPlus, number: "01", title: "Crie sua conta gratis", text: "Entre em poucos minutos e comece sem complicacao." },
  { icon: Settings, number: "02", title: "Configure seu estudio", text: "Ajuste servicos, artistas, horarios e sua pagina publica." },
  { icon: Share2, number: "03", title: "Compartilhe seu link", text: "Receba pedidos com uma presenca profissional de verdade." },
];

const features = [
  { icon: Calendar, title: "Agenda inteligente", text: "Centralize horarios, status e proximos atendimentos.", wide: true },
  { icon: Globe, title: "Pagina publica", text: "Seu estudio com cara profissional, pronto para divulgar.", wide: false },
  { icon: Users, title: "Gestao de tatuadores", text: "Cada artista com perfil, galeria e link proprio.", wide: false },
  { icon: DollarSign, title: "Controle financeiro", text: "Entradas, sinais e pagamentos finais no mesmo painel.", wide: true },
  { icon: Image, title: "Galeria de fotos", text: "Exiba trabalhos do estudio e do artista com organizacao.", wide: false },
];

const testimonials = [
  { name: "Carlos Silva", city: "Sao Paulo/SP", text: "Antes eu perdia cliente no WhatsApp. Agora tudo ficou muito mais claro e profissional." },
  { name: "Ana Rodrigues", city: "Recife/PE", text: "Consegui organizar meu estudio e mostrar melhor o trabalho de cada tatuador." },
  { name: "Roberto Costa", city: "Belo Horizonte/MG", text: "O sistema deixou o atendimento rapido e a agenda bem mais confiavel." },
];

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -left-32 -top-24 h-[600px] w-[600px] rounded-full" style={{ background: "rgba(232,101,10,0.15)", filter: "blur(120px)" }} />
      <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full" style={{ background: "rgba(255,122,26,0.10)", filter: "blur(120px)" }} />
      <div className="absolute bottom-0 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full" style={{ background: "rgba(232,101,10,0.08)", filter: "blur(120px)" }} />
    </div>
  );
}

function FadeSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section className={`fade-in-up relative z-10 ${className}`} data-animate id={id}>
      {children}
    </section>
  );
}

export default function LandingPage() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .fade-in-up {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .fade-in-up.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll("[data-animate]").forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      style.remove();
    };
  }, []);

  function scrollToHowItWorks() {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
  }

  const glassClass = "border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px] rounded-2xl";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <AuroraBackground />

      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#1f1f1f] bg-[#0a0a0a]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-2 text-lg font-semibold" to="/">
            <Zap className="text-[#E8650A]" size={22} />
            <span>Ideal Tattoo</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[#A0A0A0] md:flex">
            <a href="#como-funciona">Como funciona</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#planos">Planos</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:border-[#E8650A]" to="/login">
              Entrar
            </Link>
            <Link className="rounded-xl bg-[#E8650A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
              Comecar gratis
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <FadeSection className="flex min-h-screen items-center px-4 pt-28 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full bg-[#E8650A]/15 px-4 py-2 text-sm font-medium text-[#FF9A3C]">
                ✦ Feito para estudios de tatuagem
              </div>

              <h1 className="mt-6 text-[40px] font-bold leading-[1.02] tracking-tight md:text-[72px]">
                <span className="block">Seu estudio.</span>
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #E8650A, #FF9A3C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Profissional.
                </span>
                <span className="block">Do jeito que merece.</span>
              </h1>

              <p className="mt-6 max-w-[560px] text-base leading-7 text-[#A0A0A0] md:text-lg">
                Pare de perder cliente por desorganizacao. Tenha sua agenda, pagina profissional e controle financeiro
                - tudo num so lugar. De graca.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="rounded-xl bg-[#E8650A] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
                  Comecar agora, e gratis
                </Link>
                <button className="rounded-xl border border-white/10 px-6 py-4 font-semibold text-white hover:border-[#E8650A]" onClick={scrollToHowItWorks} type="button">
                  Ver como funciona
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["0", "reais para comecar"],
                ["5", "minutos para configurar"],
                ["100%", "feito para tatuadores"],
              ].map(([value, label]) => (
                <div className={`${glassClass} p-6`} key={label}>
                  <p className="text-4xl font-bold text-[#E8650A]">{value}</p>
                  <p className="mt-2 text-sm text-[#A0A0A0]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="max-w-2xl text-3xl font-semibold md:text-5xl">Voce se identifica com algum desses problemas?</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {problemCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article className={`${glassClass} p-6`} key={card.title}>
                    <Icon className="text-[#E8650A]" size={28} />
                    <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#A0A0A0]">{card.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6" id="como-funciona">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold md:text-5xl">Simples assim. Em 3 passos.</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article className={`${glassClass} p-6`} key={step.number}>
                    <p className="text-5xl font-bold text-[#E8650A]">{step.number}</p>
                    <Icon className="mt-6 text-[#E8650A]" size={28} />
                    <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#A0A0A0]">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6" id="funcionalidades">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold md:text-5xl">Tudo que seu estudio precisa</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article className={`${glassClass} p-6 ${feature.wide ? "lg:col-span-2" : ""}`} key={feature.title}>
                    <Icon className="text-[#E8650A]" size={28} />
                    <h3 className="mt-4 text-2xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-[#A0A0A0]">{feature.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold md:text-5xl">O que os estudios estao dizendo</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {testimonials.map((item) => (
                <article className={`${glassClass} p-6`} key={item.name}>
                  <p className="text-4xl text-[#E8650A]">"</p>
                  <p className="mt-4 text-sm leading-7 text-[#A0A0A0]">{item.text}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8650A] font-semibold">
                      {item.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-[#A0A0A0]">{item.city}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6" id="planos">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-semibold md:text-5xl">Comece hoje. Sem custo.</h2>
            <div className="mt-10 rounded-3xl border border-[#E8650A] bg-[rgba(255,255,255,0.03)] p-8 text-center backdrop-blur-[12px]">
              <div className="inline-flex rounded-full bg-[#E8650A]/15 px-4 py-2 text-sm font-semibold text-[#FF9A3C]">
                GRATUITO DURANTE OS TESTES
              </div>
              <p className="mt-6 text-6xl font-bold text-white">R$ 0</p>
              <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                {[
                  "Pagina publica",
                  "Links por tatuador",
                  "Agenda",
                  "Clientes",
                  "Financeiro",
                  "Galeria",
                  "Suporte WhatsApp",
                ].map((item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <Check className="text-[#E8650A]" size={18} />
                    <span className="text-sm text-[#EDEDED]">{item}</span>
                  </div>
                ))}
              </div>
              <Link className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#E8650A] px-6 py-4 font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
                Criar minha conta gratis
              </Link>
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#1f1f1f] bg-[#111111] p-8 text-center md:p-14">
            <AuroraBackground />
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold md:text-5xl">Seu estudio profissional comeca agora.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#A0A0A0]">
                Organize atendimento, artistas, agenda e financeiro em um unico lugar.
              </p>
              <Link className="mt-8 inline-flex rounded-xl bg-[#E8650A] px-7 py-4 font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
                Criar minha conta gratis
              </Link>
              <p className="mt-4 text-sm text-[#A0A0A0]">Configuracao em menos de 5 minutos</p>
            </div>
          </div>
        </FadeSection>

        <footer className="relative z-10 border-t border-[#1f1f1f] px-4 py-8 text-sm text-[#A0A0A0] sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-white">
              <Zap className="text-[#E8650A]" size={18} />
              <span>Ideal Tattoo</span>
            </div>
            <p>© 2026 Ideal Tattoo. Todos os direitos reservados.</p>
            <div className="flex gap-5">
              <a href="/">Privacidade</a>
              <a href="/">Termos</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
