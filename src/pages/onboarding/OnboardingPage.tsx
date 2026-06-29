import { ArrowLeft, ArrowRight, Check, Loader2, Scissors } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createStudioOnboarding, getUserStudio, slugify } from "@/services/onboarding.service";

const brStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/25";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [checkingStudio, setCheckingStudio] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkExistingStudio() {
      if (!user) {
        if (!authLoading) setCheckingStudio(false);
        return;
      }

      try {
        const studio = await getUserStudio(user.id);
        if (studio) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch {
        setError("Nao foi possivel verificar seu estudio.");
      } finally {
        setCheckingStudio(false);
      }
    }

    checkExistingStudio();
  }, [authLoading, navigate, user]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function validateStep(nextStep: number) {
    setError("");

    if (step === 1) {
      if (!name.trim()) {
        setError("Informe o nome do estudio.");
        return;
      }

      if (!slugify(slug)) {
        setError("Informe um link publico valido.");
        return;
      }
    }

    if (step === 2) {
      if (!/^\d{11}$/.test(whatsapp)) {
        setError("WhatsApp deve ter 11 numeros. Ex: 11999999999.");
        return;
      }

      if (!city.trim() || !stateUf) {
        setError("Informe cidade e estado.");
        return;
      }
    }

    setStep(nextStep);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError("");

      await createStudioOnboarding({
        userId: user.id,
        name,
        slug,
        description,
        whatsapp,
        instagram,
        website,
        address,
        city,
        state: stateUf,
      });

      navigate("/dashboard", { replace: true });
    } catch {
      setError("Nao foi possivel criar o estudio. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || checkingStudio) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
        Carregando onboarding...
      </main>
    );
  }

  const publicUrl = slugify(slug) || "seu-estudio";

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-white sm:py-12">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8650A]">
            <Scissors size={26} />
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Configure seu estudio</h1>
          <p className="mt-2 text-sm text-zinc-400">Poucos dados para liberar seu painel e sua pagina publica.</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2">
          {["Identidade", "Contato", "Revisao"].map((label, index) => {
            const number = index + 1;
            const active = step >= number;

            return (
              <div className="flex items-center gap-2" key={label}>
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    active ? "bg-[#E8650A] text-white" : "bg-[#1a1a1a] text-zinc-500",
                  ].join(" ")}
                >
                  {step > number ? <Check size={16} /> : number}
                </div>
                <span className="hidden text-sm text-zinc-300 sm:inline">{label}</span>
              </div>
            );
          })}
        </div>

        <form className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 shadow-2xl shadow-black/20 sm:p-8" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Identidade</h2>
                <p className="mt-1 text-sm text-zinc-400">Esses dados aparecem na pagina publica do estudio.</p>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Nome do estudio</span>
                <input className={inputClass} onChange={(event) => handleNameChange(event.target.value)} required value={name} />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Link publico</span>
                <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] focus-within:border-[#E8650A]">
                  <span className="flex items-center border-r border-white/10 px-4 text-sm text-zinc-500">/</span>
                  <input
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
                    onChange={(event) => {
                      setSlugEdited(true);
                      setSlug(slugify(event.target.value));
                    }}
                    required
                    value={slug}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">Preview: {window.location.origin}/{publicUrl}</p>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Descricao</span>
                <textarea
                  className={`${inputClass} min-h-28 resize-none`}
                  maxLength={200}
                  onChange={(event) => setDescription(event.target.value)}
                  value={description}
                />
                <p className="mt-2 text-right text-xs text-zinc-500">{description.length}/200</p>
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Contato e localizacao</h2>
                <p className="mt-1 text-sm text-zinc-400">Dados usados para agenda, WhatsApp e pagina publica.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">WhatsApp</span>
                  <input
                    className={inputClass}
                    maxLength={11}
                    onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ""))}
                    placeholder="11999999999"
                    required
                    value={whatsapp}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Instagram</span>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] py-3 pl-8 pr-4 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/25"
                      onChange={(event) => setInstagram(event.target.value.replace("@", ""))}
                      value={instagram}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Website</span>
                  <input className={inputClass} onChange={(event) => setWebsite(event.target.value)} value={website} />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Endereco</span>
                  <input className={inputClass} onChange={(event) => setAddress(event.target.value)} value={address} />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Cidade</span>
                  <input className={inputClass} onChange={(event) => setCity(event.target.value)} required value={city} />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Estado</span>
                  <select className={inputClass} onChange={(event) => setStateUf(event.target.value)} required value={stateUf}>
                    <option value="">Selecione</option>
                    {brStates.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Revisao</h2>
                <p className="mt-1 text-sm text-zinc-400">Vamos criar o estudio e horarios padrao editaveis depois.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  <p className="text-xs uppercase text-zinc-500">Estudio</p>
                  <p className="mt-1 font-semibold">{name}</p>
                  <p className="mt-1 text-sm text-zinc-400">/{publicUrl}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  <p className="text-xs uppercase text-zinc-500">Contato</p>
                  <p className="mt-1 font-semibold">{whatsapp}</p>
                  <p className="mt-1 text-sm text-zinc-400">{instagram ? `@${instagram}` : "Sem Instagram"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  <p className="text-xs uppercase text-zinc-500">Local</p>
                  <p className="mt-1 font-semibold">
                    {city} - {stateUf}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{address || "Endereco nao informado"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  <p className="text-xs uppercase text-zinc-500">Horarios iniciais</p>
                  <p className="mt-1 font-semibold">Segunda a sabado, 09:00 as 18:00</p>
                  <p className="mt-1 text-sm text-zinc-400">Domingo fechado</p>
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={step === 1 || saving}
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              type="button"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            {step < 3 ? (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold text-white"
                onClick={() => validateStep(step + 1)}
                type="button"
              >
                Continuar
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold text-white disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                Criar meu estudio
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
