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
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inkoraLogo, inkoraMark } from "@/assets";

const problemCards = [
  { icon: CalendarX, title: "Agenda bagunçada", text: "Horários perdidos, mensagens espalhadas e encaixes que viram dor de cabeça." },
  { icon: UserX, title: "Clientes que somem", text: "Sem processo claro, muita gente pede orçamento e desaparece antes de fechar." },
  { icon: DollarSign, title: "Financeiro no escuro", text: "Sinal, pagamento final, caixa e cancelamentos ficam sem controle real." },
  { icon: Globe, title: "Sem presença profissional", text: "O estúdio fica dependente de perfil social e sem página própria para vender melhor." },
  { icon: MessageCircle, title: "WhatsApp sobrecarregado", text: "Tudo cai no mesmo número e responder cada pedido vira um caos." },
  { icon: Users, title: "Tatuadores desorganizados", text: "Cada artista resolve do seu jeito e o estúdio perde padrão." },
];

const steps = [
  { icon: UserPlus, number: "01", title: "Crie sua conta grátis", text: "Entre em poucos minutos e comece sem complicação." },
  { icon: Settings, number: "02", title: "Configure seu estúdio", text: "Ajuste serviços, artistas, horários e sua página pública." },
  { icon: Share2, number: "03", title: "Compartilhe seu link", text: "Receba pedidos com uma presença profissional de verdade." },
];

const features = [
  { icon: Calendar, title: "Agenda inteligente", text: "Centralize horários, status e próximos atendimentos.", wide: true },
  { icon: Globe, title: "Página pública", text: "Seu estúdio com cara profissional, pronto para divulgar.", wide: false },
  { icon: Users, title: "Gestão de tatuadores", text: "Cada artista com perfil, galeria e link próprio.", wide: false },
  { icon: DollarSign, title: "Controle financeiro", text: "Entradas, sinais e pagamentos finais no mesmo painel.", wide: true },
  { icon: Image, title: "Galeria de fotos", text: "Exiba trabalhos do estúdio e do artista com organização.", wide: false },
];

const testimonials = [
  { name: "Carlos Silva", city: "São Paulo/SP", text: "Antes eu perdia cliente no WhatsApp. Agora tudo ficou muito mais claro e profissional." },
  { name: "Ana Rodrigues", city: "Recife/PE", text: "Consegui organizar meu estúdio e mostrar melhor o trabalho de cada tatuador." },
  { name: "Roberto Costa", city: "Belo Horizonte/MG", text: "O sistema deixou o atendimento rápido e a agenda bem mais confiável." },
];

const glassClass = "rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px]";

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
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .fade-in-up { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .fade-in-up.visible { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.18 },
    );

    document.querySelectorAll("[data-animate]").forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      style.remove();
    };
  }, []);

  function goHome() {
    navigate("/", { replace: false });
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToHowItWorks() {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <AuroraBackground />

      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#1f1f1f] bg-[#0a0a0a]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button className="flex items-center gap-2 text-lg font-semibold" onClick={goHome} type="button">
            <img alt="Inkora" className="h-9 w-auto" src={inkoraLogo} />
          </button>

          <nav className="hidden items-center gap-8 text-sm text-[#A0A0A0] md:flex">
            <a className="hover:text-white" href="#como-funciona">Como funciona</a>
            <a className="hover:text-white" href="#funcionalidades">Funcionalidades</a>
            <a className="hover:text-white" href="#planos">Planos</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:border-[#E8650A]" to="/login">
              Entrar
            </Link>
            <Link className="rounded-xl bg-[#E8650A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <FadeSection className="flex min-h-screen items-center px-4 pt-28 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full bg-[#E8650A]/15 px-4 py-2 text-sm font-medium text-[#FF9A3C]">
                ✦ Feito para estúdios de tatuagem
              </div>

              <h1 className="mt-6 text-[40px] font-bold leading-[1.02] tracking-tight md:text-[72px]">
                <span className="block">Seu estúdio.</span>
                <span className="block" style={{ background: "linear-gradient(135deg, #E8650A, #FF9A3C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Profissional.
                </span>
                <span className="block">Do jeito que merece.</span>
              </h1>

              <p className="mt-6 max-w-[560px] text-base leading-7 text-[#A0A0A0] md:text-lg">
                Pare de perder cliente por desorganização. Tenha sua agenda, página profissional e controle financeiro — tudo num só lugar. De graça.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="rounded-xl bg-[#E8650A] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
                  Começar agora, é grátis
                </Link>
                <button className="rounded-xl border border-white/10 px-6 py-4 font-semibold text-white hover:border-[#E8650A]" onClick={scrollToHowItWorks} type="button">
                  Ver como funciona
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["0", "reais para começar"],
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
            <h2 className="max-w-2xl text-3xl font-semibold md:text-5xl">Você se identifica com algum desses problemas?</h2>
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
              {steps.map((item) => {
                const Icon = item.icon;
                return (
                  <article className={`${glassClass} p-6`} key={item.number}>
                    <p className="text-5xl font-bold text-[#E8650A]">{item.number}</p>
                    <Icon className="mt-6 text-[#E8650A]" size={28} />
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#A0A0A0]">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6" id="funcionalidades">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold md:text-5xl">Tudo que seu estúdio precisa</h2>
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
            <h2 className="text-3xl font-semibold md:text-5xl">O que os estúdios estão dizendo</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {testimonials.map((item) => (
                <article className={`${glassClass} p-6`} key={item.name}>
                  <p className="text-4xl text-[#E8650A]">"</p>
                  <p className="mt-4 text-sm leading-7 text-[#A0A0A0]">{item.text}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8650A] font-semibold">
                      {item.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
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
                {["Página pública", "Links por tatuador", "Agenda", "Clientes", "Financeiro", "Galeria", "Suporte WhatsApp"].map((item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <Check className="text-[#E8650A]" size={18} />
                    <span className="text-sm text-[#EDEDED]">{item}</span>
                  </div>
                ))}
              </div>
              <Link className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#E8650A] px-6 py-4 font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
                Criar minha conta grátis
              </Link>
            </div>
          </div>
        </FadeSection>

        <FadeSection className="px-4 py-24 sm:px-6">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#1f1f1f] bg-[#111111] p-8 text-center md:p-14">
            <AuroraBackground />
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold md:text-5xl">Seu estúdio profissional começa agora.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#A0A0A0]">
                Organize atendimento, artistas, agenda e financeiro em um único lugar.
              </p>
              <Link className="mt-8 inline-flex rounded-xl bg-[#E8650A] px-7 py-4 font-semibold text-white transition hover:bg-[#FF7A1A]" to="/cadastro">
                Criar minha conta grátis
              </Link>
              <p className="mt-4 text-sm text-[#A0A0A0]">Configuração em menos de 5 minutos</p>
            </div>
          </div>
        </FadeSection>

        <footer className="relative z-10 border-t border-[#1f1f1f] px-4 py-8 text-sm text-[#A0A0A0] sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button className="flex items-center gap-2 text-white" onClick={goHome} type="button">
              <img alt="Inkora" className="h-7 w-7" src={inkoraMark} />
              <span>Inkora</span>
            </button>
            <p>© 2026 Inkora. Todos os direitos reservados.</p>
            <div className="flex gap-5">
              <a href="/privacidade">Privacidade</a>
              <a href="/privacidade">Termos</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
