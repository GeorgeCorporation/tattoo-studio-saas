import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Camera,
  Check,
  Loader2,
  MapPin,
  Palette,
  Scissors,
  Store,
  Upload,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  buildDefaultWorkingHours,
  createStudioOnboarding,
  getUserStudio,
  slugify,
  validateOnboardingStep,
  type OnboardingWorkingHour,
} from "@/services/onboarding.service";

const brStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const serviceCategories = ["Fine Line", "Black Work", "Realismo", "Old School", "New School", "Colorido", "Fechamento", "Piercing", "Outro"];

const citiesByState: Record<string, string[]> = {
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
  DF: ["Brasília"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Niterói", "Nova Iguaçu"],
  RS: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "Ribeirão Preto", "Sorocaba"],
};

const serviceExamples = [
  { name: "Orçamento", category: "Outro", duration: "30", price: "" },
  { name: "Tatuagem pequena", category: "Fine Line", duration: "120", price: "250" },
  { name: "Sessão de tatuagem", category: "Outro", duration: "240", price: "" },
  { name: "Retoque", category: "Outro", duration: "60", price: "" },
];

type ArtistDraft = {
  name: string;
  slug: string;
  specialty: string;
  instagram: string;
  whatsapp: string;
  photoFile: File | null;
};

type ServiceDraft = {
  name: string;
  category: string;
  description: string;
  startingPrice: string;
  durationMinutes: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/25";

const steps = [
  { title: "Identidade", icon: Store },
  { title: "Contato", icon: MapPin },
  { title: "Horários", icon: CalendarClock },
  { title: "Tatuador", icon: Scissors },
  { title: "Serviço", icon: Palette },
  { title: "Revisão", icon: Check },
];

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function useFilePreview(file: File | null) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return preview;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function createEmptyArtist(): ArtistDraft {
  return {
    name: "",
    slug: "",
    specialty: "",
    instagram: "",
    whatsapp: "",
    photoFile: null,
  };
}

function createEmptyService(): ServiceDraft {
  return {
    name: "",
    category: "Outro",
    description: "",
    startingPrice: "",
    durationMinutes: "120",
  };
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [workingHours, setWorkingHours] = useState<OnboardingWorkingHour[]>(buildDefaultWorkingHours());
  const [artistName, setArtistName] = useState("");
  const [artistSlug, setArtistSlug] = useState("");
  const [artistSlugEdited, setArtistSlugEdited] = useState(false);
  const [artistSpecialty, setArtistSpecialty] = useState("");
  const [artistInstagram, setArtistInstagram] = useState("");
  const [artistWhatsapp, setArtistWhatsapp] = useState("");
  const [artistPhotoFile, setArtistPhotoFile] = useState<File | null>(null);
  const [artists, setArtists] = useState<ArtistDraft[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("Outro");
  const [serviceDescription, setServiceDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("120");
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [checkingStudio, setCheckingStudio] = useState(true);
  const [startupWaitExpired, setStartupWaitExpired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState("Finalizando configuração...");
  const [error, setError] = useState("");

  const logoPreview = useFilePreview(logoFile);
  const artistPhotoPreview = useFilePreview(artistPhotoFile);
  const publicUrl = slugify(slug) || "seu-estudio";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const progress = Math.round((step / steps.length) * 100);
  const cityOptions = stateUf ? citiesByState[stateUf] ?? [] : [];
  const artistsToSave = [
    ...artists,
    {
      name: artistName,
      slug: artistSlug,
      specialty: artistSpecialty,
      instagram: artistInstagram,
      whatsapp: artistWhatsapp,
      photoFile: artistPhotoFile,
    },
  ].filter((artist) => artist.name.trim());
  const servicesToSave = [
    ...services,
    {
      name: serviceName,
      category: serviceCategory,
      description: serviceDescription,
      startingPrice,
      durationMinutes,
    },
  ].filter((service) => service.name.trim());

  const validationData = useMemo(
    () => ({
      name,
      slug,
      whatsapp,
      city,
      state: stateUf,
      workingHours,
      firstArtist: { name: artistName },
      firstArtists: artistsToSave,
      firstService: { name: serviceName },
      firstServices: servicesToSave,
    }),
    [artistName, artistsToSave, city, name, serviceName, servicesToSave, slug, stateUf, whatsapp, workingHours],
  );

  useEffect(() => {
    let isMounted = true;

    async function checkExistingStudio() {
      if (!user) {
        if (!authLoading && isMounted) setCheckingStudio(false);
        return;
      }

      try {
        const studio = await withTimeout(getUserStudio(user.id), 8000, "Tempo limite ao verificar estúdio.");
        if (studio && isMounted) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (caughtError) {
        logger.error("Falha ao verificar estúdio no onboarding", caughtError, { userId: user.id });
        if (isMounted) {
          setError(getFriendlyErrorMessage(caughtError, "Não foi possível verificar seu estúdio."));
        }
      } finally {
        if (isMounted) setCheckingStudio(false);
      }
    }

    checkExistingStudio();

    return () => {
      isMounted = false;
    };
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!authLoading && !checkingStudio) {
      setStartupWaitExpired(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStartupWaitExpired(true);
      if (checkingStudio) {
        setCheckingStudio(false);
        setError(
          "Supabase demorou para responder. Você pode continuar configurando o estúdio, mas se algo falhar, recarregue e tente novamente.",
        );
      }
    }, 9000);

    return () => window.clearTimeout(timeoutId);
  }, [authLoading, checkingStudio]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleArtistNameChange(value: string) {
    setArtistName(value);
    if (!artistSlugEdited) setArtistSlug(slugify(value));
  }

  function addCurrentArtist() {
    if (!artistName.trim()) {
      setError("Informe o nome do tatuador antes de adicionar outro.");
      return;
    }

    setArtists((current) => [
      ...current,
      {
        name: artistName.trim(),
        slug: artistSlug || slugify(artistName),
        specialty: artistSpecialty,
        instagram: artistInstagram.replace("@", ""),
        whatsapp: artistWhatsapp.replace(/\D/g, ""),
        photoFile: artistPhotoFile,
      },
    ]);
    setArtistName("");
    setArtistSlug("");
    setArtistSlugEdited(false);
    setArtistSpecialty("");
    setArtistInstagram("");
    setArtistWhatsapp("");
    setArtistPhotoFile(null);
    setError("");
  }

  function removeArtist(index: number) {
    setArtists((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function applyServiceExample(example: (typeof serviceExamples)[number]) {
    setServiceName(example.name);
    setServiceCategory(example.category);
    setDurationMinutes(example.duration);
    setStartingPrice(example.price);
  }

  function addCurrentService() {
    if (!serviceName.trim()) {
      setError("Informe o nome do serviço antes de adicionar outro.");
      return;
    }

    setServices((current) => [
      ...current,
      {
        name: serviceName.trim(),
        category: serviceCategory,
        description: serviceDescription,
        startingPrice,
        durationMinutes,
      },
    ]);
    setServiceName("");
    setServiceCategory("Outro");
    setServiceDescription("");
    setStartingPrice("");
    setDurationMinutes("120");
    setError("");
  }

  function removeService(index: number) {
    setServices((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function applySchedulePreset(preset: "week" | "everyday" | "custom") {
    setWorkingHours((current) =>
      current.map((hour) => {
        const open = preset === "everyday" || (preset === "week" && hour.day_of_week !== 0) || (preset === "custom" && hour.is_open);

        return {
          ...hour,
          is_open: open,
          open_time: open ? hour.open_time ?? "09:00" : null,
          close_time: open ? hour.close_time ?? "18:00" : null,
        };
      }),
    );
  }

  function updateHour(day: number, field: keyof OnboardingWorkingHour, value: boolean | string | null) {
    setWorkingHours((current) =>
      current.map((hour) =>
        hour.day_of_week === day
          ? {
              ...hour,
              [field]: value,
              open_time: field === "is_open" && value === false ? null : hour.open_time ?? "09:00",
              close_time: field === "is_open" && value === false ? null : hour.close_time ?? "18:00",
            }
          : hour,
      ),
    );
  }

  function goNext() {
    const message = validateOnboardingStep(step, validationData);
    if (message) {
      setError(message);
      return;
    }

    setError("");
    setStep((current) => Math.min(steps.length, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;

    for (let currentStep = 1; currentStep <= 5; currentStep += 1) {
      const message = validateOnboardingStep(currentStep, validationData);
      if (message) {
        setStep(currentStep);
        setError(message);
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSavingLabel("Criando estúdio...");

      await createStudioOnboarding({
        userId: user.id,
        name,
        slug,
        description,
        logoFile,
        whatsapp,
        instagram,
        website: website && !/^https?:\/\//i.test(website) ? `https://${website}` : website,
        address,
        city,
        state: stateUf,
        workingHours,
        firstArtist: {
          name: artistName,
          slug: artistSlug,
          specialty: artistSpecialty,
          instagram: artistInstagram,
          whatsapp: artistWhatsapp,
          photoFile: artistPhotoFile,
        },
        firstArtists: artistsToSave.map((artist) => ({
          name: artist.name,
          slug: artist.slug,
          specialty: artist.specialty,
          instagram: artist.instagram,
          whatsapp: artist.whatsapp,
          photoFile: artist.photoFile,
        })),
        firstService: {
          name: serviceName,
          category: serviceCategory,
          description: serviceDescription,
          starting_price: startingPrice ? Number(startingPrice) : null,
          avg_duration_minutes: durationMinutes ? Number(durationMinutes) : null,
        },
        firstServices: servicesToSave.map((service) => ({
          name: service.name,
          category: service.category,
          description: service.description,
          starting_price: service.startingPrice ? Number(service.startingPrice) : null,
          avg_duration_minutes: service.durationMinutes ? Number(service.durationMinutes) : null,
        })),
      });

      setSavingLabel("Abrindo painel...");
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      logger.error("Falha ao criar estúdio no onboarding", caughtError, { userId: user.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível ativar o estúdio. Tente novamente."));
    } finally {
      setSaving(false);
    }
  }

  if ((authLoading || checkingStudio) && !startupWaitExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
        <span className="rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4">Verificando sessão e estúdio...</span>
      </main>
    );
  }

  if (authLoading && startupWaitExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-2xl shadow-black/30">
          <h1 className="text-2xl font-semibold">Supabase demorou para responder</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Pode ser instabilidade temporária. Recarregue a página ou entre novamente para continuar.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold" onClick={() => window.location.reload()} type="button">
              Recarregar
            </button>
            <button className="rounded-xl border border-white/10 px-4 py-3 font-semibold" onClick={() => navigate("/login", { replace: true })} type="button">
              Ir para login
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-2xl shadow-black/30">
          <h1 className="text-2xl font-semibold">Sessão não encontrada</h1>
          <p className="mt-3 text-sm text-zinc-400">Entre novamente para continuar a configuração do estúdio.</p>
          <button className="mt-6 w-full rounded-xl bg-[#E8650A] px-4 py-3 font-semibold" onClick={() => navigate("/login", { replace: true })} type="button">
            Ir para login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-white sm:py-12">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8650A]">
            <Scissors size={26} />
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Ative seu estúdio</h1>
          <p className="mt-2 text-sm text-zinc-400">Configure o essencial para sair do cadastro direto para um painel pronto para trabalhar.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#E8650A] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-6">
            {steps.map((item, index) => {
              const number = index + 1;
              const Icon = item.icon;
              const active = step >= number;

              return (
                <button
                  className={[
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition",
                    active ? "bg-[#E8650A]/15 text-white" : "bg-[#0f0f0f] text-zinc-500",
                  ].join(" ")}
                  key={item.title}
                  onClick={() => number < step && setStep(number)}
                  type="button"
                >
                  <span className={active ? "text-[#E8650A]" : "text-zinc-600"}>
                    <Icon size={16} />
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 shadow-2xl shadow-black/20 sm:p-8" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Identidade do estúdio</h2>
                <p className="mt-1 text-sm text-zinc-400">Nome, link público, descrição e logo para deixar sua página com cara profissional.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  {logoPreview ? (
                    <img alt="Preview da logo" className="h-28 w-28 rounded-2xl object-cover" src={logoPreview} />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#E8650A] text-3xl font-semibold">
                      {initials(name || "Ideal Tattoo")}
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium hover:border-[#E8650A]">
                    <Upload size={16} />
                    Enviar logo
                    <input accept="image/*" className="hidden" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} type="file" />
                  </label>
                </div>

                <div className="space-y-5">
                  <label className="block">
                    <span className="text-sm font-medium">Nome do estúdio</span>
                    <input className={inputClass} onChange={(event) => handleNameChange(event.target.value)} required value={name} />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Link público</span>
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
                    <p className="mt-2 break-all text-xs text-zinc-500">Preview do link: {origin}/{publicUrl}</p>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Descrição</span>
                    <textarea className={`${inputClass} min-h-28 resize-none`} maxLength={200} onChange={(event) => setDescription(event.target.value)} value={description} />
                    <p className="mt-2 text-right text-xs text-zinc-500">{description.length}/200</p>
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Contato e localização</h2>
                <p className="mt-1 text-sm text-zinc-400">Essas informações aparecem na página pública e ajudam o cliente a chamar seu estúdio.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">WhatsApp</span>
                  <input className={inputClass} maxLength={11} onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ""))} placeholder="11999999999" required value={whatsapp} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Instagram</span>
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] focus-within:border-[#E8650A] focus-within:ring-2 focus-within:ring-[#E8650A]/25">
                    <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">@</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
                      onChange={(event) => setInstagram(event.target.value.replace("@", ""))}
                      placeholder="seuestudio"
                      value={instagram}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Website</span>
                  <input className={inputClass} onChange={(event) => setWebsite(event.target.value)} placeholder="https://..." value={website} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Endereço</span>
                  <input className={inputClass} onChange={(event) => setAddress(event.target.value)} value={address} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Cidade</span>
                  <input aria-label="Cidade" className={inputClass} list="onboarding-cities" onChange={(event) => setCity(event.target.value)} required value={city} />
                  <datalist id="onboarding-cities">
                    {cityOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <p className="mt-2 text-xs text-zinc-500">
                    {stateUf && cityOptions.length ? "Digite ou escolha uma cidade sugerida para o estado." : "Escolha o estado para ver sugestões de cidade."}
                  </p>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Estado</span>
                  <select
                    aria-label="Estado"
                    className={inputClass}
                    onChange={(event) => {
                      setStateUf(event.target.value);
                    }}
                    required
                    value={stateUf}
                  >
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
                <h2 className="text-xl font-semibold">Horários de funcionamento</h2>
                <p className="mt-1 text-sm text-zinc-400">Defina os dias em que o estúdio aceita agendamentos. Domingo pode ficar ativo se houver tatuador disponível.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={() => applySchedulePreset("week")} type="button">
                    Segunda a sábado
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={() => applySchedulePreset("everyday")} type="button">
                    Domingo a domingo
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={() => applySchedulePreset("custom")} type="button">
                    Personalizado
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {workingHours.map((hour) => (
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-4 md:grid-cols-[1fr_auto_auto]" key={hour.day_of_week}>
                    <label className="flex items-center justify-between gap-4">
                      <span className="font-medium">{weekDays[hour.day_of_week]}</span>
                      <input checked={hour.is_open} className="h-5 w-5 accent-[#E8650A]" onChange={(event) => updateHour(hour.day_of_week, "is_open", event.target.checked)} type="checkbox" />
                    </label>
                    {hour.is_open ? (
                      <>
                        <input className={inputClass} onChange={(event) => updateHour(hour.day_of_week, "open_time", event.target.value)} type="time" value={hour.open_time ?? "09:00"} />
                        <input className={inputClass} onChange={(event) => updateHour(hour.day_of_week, "close_time", event.target.value)} type="time" value={hour.close_time ?? "18:00"} />
                      </>
                    ) : (
                      <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-400 md:col-span-2">Fechado</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Equipe de tatuadores</h2>
                <p className="mt-1 text-sm text-zinc-400">Adicione um ou mais tatuadores agora. Depois você pode editar tudo no painel.</p>
              </div>

              {artists.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {artists.map((artist, index) => (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-4" key={`${artist.name}-${index}`}>
                      <div>
                        <p className="font-semibold">{artist.name}</p>
                        <p className="text-sm text-zinc-500">{artist.specialty || "Especialidade não informada"}</p>
                      </div>
                      <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300" onClick={() => removeArtist(index)} type="button">
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  {artistPhotoPreview ? (
                    <img alt="Preview do tatuador" className="h-28 w-28 rounded-2xl object-cover" src={artistPhotoPreview} />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#E8650A] text-3xl font-semibold">
                      {initials(artistName || "TA")}
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium hover:border-[#E8650A]">
                    <Camera size={16} />
                    Foto
                    <input accept="image/*" className="hidden" onChange={(event) => setArtistPhotoFile(event.target.files?.[0] ?? null)} type="file" />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Nome do tatuador</span>
                    <input className={inputClass} onChange={(event) => handleArtistNameChange(event.target.value)} required value={artistName} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Especialidade</span>
                    <input className={inputClass} onChange={(event) => setArtistSpecialty(event.target.value)} placeholder="Fine Line, Realismo..." value={artistSpecialty} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium">Link público do tatuador</span>
                    <input
                      className={inputClass}
                      onChange={(event) => {
                        setArtistSlugEdited(true);
                        setArtistSlug(slugify(event.target.value));
                      }}
                      required
                      value={artistSlug}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Instagram</span>
                    <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] focus-within:border-[#E8650A] focus-within:ring-2 focus-within:ring-[#E8650A]/25">
                      <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">@</span>
                      <input
                        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
                        onChange={(event) => setArtistInstagram(event.target.value.replace("@", ""))}
                        value={artistInstagram}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">WhatsApp</span>
                    <input className={inputClass} maxLength={11} onChange={(event) => setArtistWhatsapp(event.target.value.replace(/\D/g, ""))} value={artistWhatsapp} />
                  </label>
                </div>
              </div>

              <button className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:border-[#E8650A]" onClick={addCurrentArtist} type="button">
                Adicionar outro tatuador
              </button>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Serviços iniciais</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Serviço é o tipo de atendimento que o cliente escolhe ao agendar. Ex: orçamento, tatuagem pequena, sessão ou retoque.
                </p>
              </div>

              {services.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {services.map((service, index) => (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-4" key={`${service.name}-${index}`}>
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-zinc-500">{service.category}</p>
                      </div>
                      <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300" onClick={() => removeService(index)} type="button">
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {serviceExamples.map((example) => (
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" key={example.name} onClick={() => applyServiceExample(example)} type="button">
                    {example.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Nome do serviço</span>
                  <input className={inputClass} onChange={(event) => setServiceName(event.target.value)} placeholder="Tatuagem pequena" required value={serviceName} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Categoria</span>
                  <select className={inputClass} onChange={(event) => setServiceCategory(event.target.value)} value={serviceCategory}>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Preço inicial</span>
                  <input className={inputClass} min="0" onChange={(event) => setStartingPrice(event.target.value)} placeholder="250" type="number" value={startingPrice} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Duração média em minutos</span>
                  <input className={inputClass} min="30" onChange={(event) => setDurationMinutes(event.target.value)} type="number" value={durationMinutes} />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium">Descrição</span>
                  <textarea className={`${inputClass} min-h-28 resize-none`} onChange={(event) => setServiceDescription(event.target.value)} value={serviceDescription} />
                </label>
              </div>

              <button className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:border-[#E8650A]" onClick={addCurrentService} type="button">
                Adicionar outro serviço
              </button>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Revisão final</h2>
                <p className="mt-1 text-sm text-zinc-400">Confira tudo antes de ativar seu estúdio.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <SummaryCard label="Estúdio" value={name} detail={`${origin}/${publicUrl}`} />
                <SummaryCard label="Contato" value={whatsapp} detail={instagram ? `@${instagram}` : "Instagram não informado"} />
                <SummaryCard label="Localização" value={`${city} - ${stateUf}`} detail={address || "Endereço não informado"} />
                <SummaryCard label="Horários" value={`${workingHours.filter((hour) => hour.is_open).length} dias abertos`} detail="Editável depois em Configurações" />
                <SummaryCard label="Tatuadores" value={`${artistsToSave.length} cadastrados`} detail={artistsToSave.map((artist) => artist.name).join(", ")} />
                <SummaryCard label="Serviços" value={`${servicesToSave.length} cadastrados`} detail={servicesToSave.map((service) => service.name).join(", ")} />
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40" disabled={step === 1 || saving} onClick={goBack} type="button">
              <ArrowLeft size={18} />
              Voltar
            </button>

            {step < steps.length ? (
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold text-white" onClick={goNext} type="button">
                Salvar e continuar
                <ArrowRight size={18} />
              </button>
            ) : (
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {saving ? savingLabel : "Ativar meu estúdio"}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold">{value || "-"}</p>
      <p className="mt-1 break-all text-sm text-zinc-400">{detail}</p>
    </div>
  );
}
