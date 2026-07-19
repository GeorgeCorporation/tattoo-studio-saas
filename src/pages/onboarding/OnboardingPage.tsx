import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Camera,
  Check,
  Loader2,
  MapPin,
  Plus,
  Scissors,
  Store,
  Upload,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { inkoraLogo, inkoraMark } from "@/assets";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { countVisualCharacters, limitVisualCharacters } from "@/lib/text-limit";
import citiesByState from "@/lib/brazil-cities.json";
import {
  buildDefaultWorkingHours,
  createStudioOnboarding,
  getOnboardingProgress,
  getOnboardingSnapshot,
  slugify,
  validateOnboardingStep,
  type OnboardingWorkingHour,
} from "@/services/onboarding.service";

const DRAFT_KEY = "tattoo:onboarding:draft:v2";
const DESCRIPTION_LIMIT = 200;

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

const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const serviceCategories = [
  "Fine Line",
  "Black Work",
  "Realismo",
  "Old School",
  "New School",
  "Colorido",
  "Fechamento",
  "Piercing",
  "Outro",
];

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

type DraftData = {
  name: string;
  slug: string;
  slugEdited: boolean;
  description: string;
  whatsapp: string;
  instagram: string;
  website: string;
  address: string;
  city: string;
  stateUf: string;
  manualCity: boolean;
  workingHours: OnboardingWorkingHour[];
  activateBooking: boolean;
  artists: Omit<ArtistDraft, "photoFile">[];
  services: ServiceDraft[];
  artistName: string;
  artistSlug: string;
  artistSlugEdited: boolean;
  artistSpecialty: string;
  artistInstagram: string;
  artistWhatsapp: string;
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  startingPrice: string;
  durationMinutes: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/25";

const steps = [
  { title: "Identidade", icon: Store },
  { title: "Contato", icon: MapPin },
  { title: "Funcionamento", icon: CalendarClock },
  { title: "Equipe e serviços", icon: Scissors },
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

function restoreDraft(): Partial<DraftData> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<DraftData>) : {};
  } catch {
    return {};
  }
}

function normalizeInstagram(value: string) {
  return value.replace("@", "").trim();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function OnboardingPage() {
  const draft = useMemo(() => restoreDraft(), []);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(draft.name ?? "");
  const [slug, setSlug] = useState(draft.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(draft.slugEdited ?? false);
  const [description, setDescription] = useState(draft.description ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savedLogoUrl, setSavedLogoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState(draft.whatsapp ?? "");
  const [instagram, setInstagram] = useState(draft.instagram ?? "");
  const [website, setWebsite] = useState(draft.website ?? "");
  const [address, setAddress] = useState(draft.address ?? "");
  const [city, setCity] = useState(draft.city ?? "");
  const [stateUf, setStateUf] = useState(draft.stateUf ?? "");
  const [manualCity, setManualCity] = useState(draft.manualCity ?? false);
  const [workingHours, setWorkingHours] = useState<OnboardingWorkingHour[]>(draft.workingHours ?? buildDefaultWorkingHours());
  const [activateBooking, setActivateBooking] = useState(draft.activateBooking ?? true);
  const [artists, setArtists] = useState<ArtistDraft[]>((draft.artists ?? []).map((artist) => ({ ...artist, photoFile: null })));
  const [artistName, setArtistName] = useState(draft.artistName ?? "");
  const [artistSlug, setArtistSlug] = useState(draft.artistSlug ?? "");
  const [artistSlugEdited, setArtistSlugEdited] = useState(draft.artistSlugEdited ?? false);
  const [artistSpecialty, setArtistSpecialty] = useState(draft.artistSpecialty ?? "");
  const [artistInstagram, setArtistInstagram] = useState(draft.artistInstagram ?? "");
  const [artistWhatsapp, setArtistWhatsapp] = useState(draft.artistWhatsapp ?? "");
  const [artistPhotoFile, setArtistPhotoFile] = useState<File | null>(null);
  const [services, setServices] = useState<ServiceDraft[]>(draft.services ?? []);
  const [serviceName, setServiceName] = useState(draft.serviceName ?? "");
  const [serviceCategory, setServiceCategory] = useState(draft.serviceCategory ?? "Outro");
  const [serviceDescription, setServiceDescription] = useState(draft.serviceDescription ?? "");
  const [startingPrice, setStartingPrice] = useState(draft.startingPrice ?? "");
  const [durationMinutes, setDurationMinutes] = useState(draft.durationMinutes ?? "120");
  const [checkingStudio, setCheckingStudio] = useState(true);
  const [startupWaitExpired, setStartupWaitExpired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState("Finalizando configuração...");
  const [error, setError] = useState("");
  const [submitFailed, setSubmitFailed] = useState(false);

  const logoPreview = useFilePreview(logoFile);
  const artistPhotoPreview = useFilePreview(artistPhotoFile);
  const publicUrl = slugify(slug) || "seu-estudio";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const progress = Math.round((step / steps.length) * 100);
  const cityOptions = stateUf ? citiesByState[stateUf as keyof typeof citiesByState] ?? [] : [];
  const descriptionLength = countVisualCharacters(description);

  const currentArtist = {
    name: artistName,
    slug: artistSlug,
    specialty: artistSpecialty,
    instagram: artistInstagram,
    whatsapp: artistWhatsapp,
    photoFile: artistPhotoFile,
  };
  const currentService = {
    name: serviceName,
    category: serviceCategory,
    description: serviceDescription,
    startingPrice,
    durationMinutes,
  };
  const artistsToSave = [...artists, currentArtist].filter((artist) => artist.name.trim());
  const servicesToSave = [...services, currentService].filter((service) => service.name.trim());
  const openDaysCount = workingHours.filter((hour) => hour.is_open).length;
  const readyForPublicBooking = activateBooking && artistsToSave.length > 0 && servicesToSave.length > 0;

  const validationData = useMemo(
    () => ({
      name,
      slug,
      whatsapp,
      city,
      state: stateUf,
      workingHours,
      activateBooking,
      firstArtists: artistsToSave,
      firstServices: servicesToSave,
    }),
    [activateBooking, artistsToSave, city, name, servicesToSave, slug, stateUf, whatsapp, workingHours],
  );

  useEffect(() => {
    const draftToSave: DraftData = {
      name,
      slug,
      slugEdited,
      description,
      whatsapp,
      instagram,
      website,
      address,
      city,
      stateUf,
      manualCity,
      workingHours,
      activateBooking,
      artists: artists.map((artist) => ({
        name: artist.name,
        slug: artist.slug,
        specialty: artist.specialty,
        instagram: artist.instagram,
        whatsapp: artist.whatsapp,
      })),
      services,
      artistName,
      artistSlug,
      artistSlugEdited,
      artistSpecialty,
      artistInstagram,
      artistWhatsapp,
      serviceName,
      serviceCategory,
      serviceDescription,
      startingPrice,
      durationMinutes,
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
  }, [
    activateBooking,
    address,
    artistInstagram,
    artistName,
    artistSlug,
    artistSlugEdited,
    artistSpecialty,
    artistWhatsapp,
    artists,
    city,
    description,
    durationMinutes,
    instagram,
    manualCity,
    name,
    serviceCategory,
    serviceDescription,
    serviceName,
    services,
    slug,
    slugEdited,
    startingPrice,
    stateUf,
    website,
    whatsapp,
    workingHours,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function checkExistingStudio() {
      if (!user) {
        if (!authLoading && isMounted) setCheckingStudio(false);
        return;
      }

      try {
        const snapshot = await withTimeout(getOnboardingSnapshot(user.id), 8000, "Tempo limite ao verificar estúdio.");
        if (!isMounted) return;

        if (snapshot.studio) {
          setName((current) => current || snapshot.studio?.name || "");
          setSlug((current) => current || snapshot.studio?.slug || "");
          setDescription((current) => current || snapshot.studio?.description || "");
          setWhatsapp((current) => current || snapshot.studio?.whatsapp || "");
          setInstagram((current) => current || normalizeInstagram(snapshot.studio?.instagram || ""));
          setWebsite((current) => current || snapshot.studio?.website || "");
          setAddress((current) => current || snapshot.studio?.address || "");
          setCity((current) => current || snapshot.studio?.city || "");
          setStateUf((current) => current || snapshot.studio?.state || "");
          setSavedLogoUrl(snapshot.studio.logo_url || "");

          if (!draft.workingHours?.length && snapshot.workingHours.length) {
            const merged = buildDefaultWorkingHours().map(
              (item) => snapshot.workingHours.find((hour) => hour.day_of_week === item.day_of_week) ?? item,
            );
            setWorkingHours(merged);
          }

          if (!draft.artists?.length && !artistName.trim() && snapshot.artists.length) {
            setArtists(
              snapshot.artists.map((artist) => ({
                name: artist.name,
                slug: artist.slug,
                specialty: artist.specialty ?? "",
                instagram: normalizeInstagram(artist.instagram ?? ""),
                whatsapp: onlyDigits(artist.whatsapp ?? ""),
                photoFile: null,
              })),
            );
          }

          if (!draft.services?.length && !serviceName.trim() && snapshot.services.length) {
            setServices(
              snapshot.services.map((service) => ({
                name: service.name,
                category: service.category || "Outro",
                description: service.description || "",
                startingPrice: service.starting_price?.toString() || "",
                durationMinutes: service.avg_duration_minutes?.toString() || "120",
              })),
            );
          }

          const progressState = getOnboardingProgress(snapshot, activateBooking);
          if (progressState.canFinish) {
            navigate("/dashboard", { replace: true });
            return;
          }

          setStep(progressState.nextStep);
        }
      } catch (caughtError) {
        logger.error("Falha ao verificar estúdio no onboarding", caughtError, { userId: user.id });
        if (isMounted) {
          setError(getFriendlyErrorMessage(caughtError, "Não foi possível verificar seu estúdio. Tente novamente em alguns minutos."));
          setSubmitFailed(false);
        }
      } finally {
        if (isMounted) setCheckingStudio(false);
      }
    }

    checkExistingStudio();

    return () => {
      isMounted = false;
    };
  }, [activateBooking, artistName, authLoading, draft.artists, draft.services, draft.workingHours, navigate, serviceName, user]);

  useEffect(() => {
    if (!authLoading && !checkingStudio) {
      setStartupWaitExpired(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStartupWaitExpired(true);
      if (checkingStudio) {
        setCheckingStudio(false);
        setError("Supabase demorou para responder. Você pode continuar configurando, mas se algo falhar, tente novamente em alguns minutos.");
      }
    }, 9000);

    return () => window.clearTimeout(timeoutId);
  }, [authLoading, checkingStudio]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleDescriptionChange(value: string) {
    setDescription(limitVisualCharacters(value, DESCRIPTION_LIMIT));
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
        instagram: normalizeInstagram(artistInstagram),
        whatsapp: onlyDigits(artistWhatsapp),
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

  function applySchedulePreset(preset: "week" | "everyday" | "appointment") {
    setWorkingHours((current) =>
      current.map((hour) => {
        const open = preset === "everyday" || preset === "appointment" || (preset === "week" && hour.day_of_week !== 0);

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
      setSubmitFailed(false);
      return;
    }

    setError("");
    setSubmitFailed(false);
    setStep((current) => Math.min(steps.length, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setError("");
    setSubmitFailed(false);
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;

    for (let currentStep = 1; currentStep <= steps.length; currentStep += 1) {
      const message = validateOnboardingStep(currentStep, validationData);
      if (message) {
        setStep(currentStep);
        setError(message);
        setSubmitFailed(false);
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSubmitFailed(false);
      setSavingLabel("Salvando estúdio e link público...");

      await createStudioOnboarding({
        userId: user.id,
        name,
        slug,
        description,
        logoFile,
        whatsapp: onlyDigits(whatsapp),
        instagram: normalizeInstagram(instagram),
        website: website && !/^https?:\/\//i.test(website) ? `https://${website}` : website,
        address,
        city,
        state: stateUf,
        workingHours,
        firstArtists: artistsToSave.map((artist) => ({
          name: artist.name,
          slug: artist.slug,
          specialty: artist.specialty,
          instagram: normalizeInstagram(artist.instagram),
          whatsapp: onlyDigits(artist.whatsapp),
          photoFile: artist.photoFile,
        })),
        firstServices: servicesToSave.map((service) => ({
          name: service.name,
          category: service.category,
          description: service.description,
          starting_price: service.startingPrice ? Number(service.startingPrice) : null,
          avg_duration_minutes: service.durationMinutes ? Number(service.durationMinutes) : null,
        })),
      });

      localStorage.removeItem(DRAFT_KEY);
      setSavingLabel("Abrindo painel...");
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      logger.error("Falha ao criar estúdio no onboarding", caughtError, { userId: user.id });
      setError(
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : getFriendlyErrorMessage(caughtError, "Não foi possível ativar o estúdio. Se o problema continuar, tente novamente em alguns minutos."),
      );
      setSubmitFailed(true);
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
          <p className="mt-3 text-sm text-zinc-400">Pode ser instabilidade temporária. Recarregue a página ou entre novamente para continuar.</p>
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
          <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
          <h1 className="mt-4 text-3xl font-semibold">Ative seu estúdio</h1>
          <p className="mt-2 text-sm text-zinc-400">Configure o essencial agora. O restante pode ser refinado dentro do painel.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#E8650A] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
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
                  {logoPreview || savedLogoUrl ? (
                    <img alt="Preview da logo" className="h-28 w-28 rounded-2xl object-cover" src={logoPreview || savedLogoUrl} />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#171717]">
                      {name ? <span className="text-3xl font-semibold text-white">{initials(name)}</span> : <img alt="Inkora" className="h-14 w-14" src={inkoraMark} />}
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
                    <textarea
                      aria-describedby="studio-description-counter"
                      className={`${inputClass} min-h-28 resize-none`}
                      onChange={(event) => handleDescriptionChange(event.target.value)}
                      value={description}
                    />
                    <p aria-live="polite" className="mt-2 text-right text-xs text-zinc-500" id="studio-description-counter">
                      {descriptionLength}/{DESCRIPTION_LIMIT}
                    </p>
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
                  <input className={inputClass} maxLength={11} onChange={(event) => setWhatsapp(onlyDigits(event.target.value))} placeholder="11999999999" required value={whatsapp} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Instagram</span>
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] focus-within:border-[#E8650A] focus-within:ring-2 focus-within:ring-[#E8650A]/25">
                    <span className="flex w-12 shrink-0 items-center justify-center border-r border-white/10 text-zinc-400">@</span>
                    <input className="min-w-0 flex-1 bg-transparent px-5 py-3 text-white outline-none" onChange={(event) => setInstagram(normalizeInstagram(event.target.value))} placeholder="seuestudio" value={instagram} />
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
                  <span className="text-sm font-medium">Estado</span>
                  <select
                    aria-label="Estado"
                    className={inputClass}
                    onChange={(event) => {
                      setStateUf(event.target.value);
                      setCity("");
                      setManualCity(false);
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
                <div>
                  <label className="block">
                    <span className="text-sm font-medium">Cidade</span>
                    {manualCity ? (
                      <input className={inputClass} onChange={(event) => setCity(event.target.value)} placeholder="Digite sua cidade" required value={city} />
                    ) : (
                      <select aria-label="Cidade" className={inputClass} disabled={!stateUf} onChange={(event) => setCity(event.target.value)} required value={city}>
                        <option value="">{stateUf ? "Selecione uma cidade" : "Escolha o estado primeiro"}</option>
                        {cityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                  <button className="mt-2 text-xs font-semibold text-[#E8650A]" disabled={!stateUf} onClick={() => setManualCity((current) => !current)} type="button">
                    {manualCity ? "Escolher cidade da lista" : "Digitar cidade manualmente"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Funcionamento</h2>
                <p className="mt-1 text-sm text-zinc-400">Esses horários servem como base para agenda pública. Você pode ajustar depois.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={() => applySchedulePreset("everyday")} type="button">
                    Abrir todos os dias
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={() => applySchedulePreset("week")} type="button">
                    Segunda a sábado
                  </button>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={() => applySchedulePreset("appointment")} type="button">
                    Somente por agendamento
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
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold">Equipe e serviços</h2>
                <p className="mt-1 text-sm text-zinc-400">Cadastre o básico para receber agendamentos. Também dá para fazer depois no painel.</p>
                <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                  <input checked={activateBooking} className="h-5 w-5 accent-[#E8650A]" onChange={(event) => setActivateBooking(event.target.checked)} type="checkbox" />
                  <span>
                    <span className="block font-semibold">Ativar agenda pública agora</span>
                    <span className="block text-sm text-zinc-400">Se desmarcar, você pode cadastrar tatuadores e serviços depois.</span>
                  </span>
                </label>
              </div>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Tatuadores</h3>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={addCurrentArtist} type="button">
                    <Plus size={16} />
                    Adicionar outro tatuador
                  </button>
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
                      <input className={inputClass} onChange={(event) => handleArtistNameChange(event.target.value)} value={artistName} />
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
                        value={artistSlug}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Instagram</span>
                      <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] focus-within:border-[#E8650A] focus-within:ring-2 focus-within:ring-[#E8650A]/25">
                        <span className="flex w-12 shrink-0 items-center justify-center border-r border-white/10 text-zinc-400">@</span>
                        <input className="min-w-0 flex-1 bg-transparent px-5 py-3 text-white outline-none" onChange={(event) => setArtistInstagram(normalizeInstagram(event.target.value))} value={artistInstagram} />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">WhatsApp</span>
                      <input className={inputClass} maxLength={11} onChange={(event) => setArtistWhatsapp(onlyDigits(event.target.value))} value={artistWhatsapp} />
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Serviços</h3>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-[#E8650A]" onClick={addCurrentService} type="button">
                    <Plus size={16} />
                    Adicionar outro serviço
                  </button>
                </div>
                <p className="text-sm text-zinc-400">
                  Serviço é o tipo de atendimento que o cliente escolhe ao agendar. Preço inicial é o valor mínimo exibido. Duração média ajuda a organizar horários.
                </p>

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
                    <input className={inputClass} onChange={(event) => setServiceName(event.target.value)} placeholder="Tatuagem pequena" value={serviceName} />
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
              </section>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Revisão e ativação</h2>
                <p className="mt-1 text-sm text-zinc-400">Confira tudo antes de ativar seu estúdio.</p>
              </div>

              <div className="rounded-2xl border border-[#E8650A]/25 bg-[#E8650A]/10 p-4">
                <p className="font-semibold">{readyForPublicBooking ? "Agenda pública pronta para receber pedidos." : "Estúdio pronto. Agenda pública pode ser ativada depois."}</p>
                <p className="mt-1 text-sm text-zinc-300">
                  {readyForPublicBooking
                    ? "Cliente já poderá escolher tatuador, serviço, data e horário pela página pública."
                    : "Você poderá cadastrar tatuadores e serviços no painel antes de divulgar o link."}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <SummaryCard label="Estúdio pronto" value={name} detail={`${origin}/${publicUrl}`} status="ok" />
                <SummaryCard label="Contato pronto" value={whatsapp} detail={instagram ? `@${instagram}` : "Instagram não informado"} status="ok" />
                <SummaryCard label="Localização" value={`${city} - ${stateUf}`} detail={address || "Endereço não informado"} status="ok" />
                <SummaryCard label="Funcionamento" value={`${openDaysCount} dias abertos`} detail="Editável depois em Configurações" status="ok" />
                <SummaryCard label="Agenda pública" value={readyForPublicBooking ? "Pronta" : activateBooking ? "Incompleta" : "Desligada por enquanto"} detail={readyForPublicBooking ? "Pode divulgar o link." : "Finalize equipe e serviços para receber pedidos completos."} status={readyForPublicBooking ? "ok" : "pending"} />
                <SummaryCard label="Tatuadores" value={`${artistsToSave.length} cadastrados`} detail={artistsToSave.map((artist) => artist.name).join(", ") || "Pode cadastrar depois"} status={artistsToSave.length ? "ok" : "pending"} />
                <SummaryCard label="Serviços" value={`${servicesToSave.length} cadastrados`} detail={servicesToSave.map((service) => service.name).join(", ") || "Pode cadastrar depois"} status={servicesToSave.length ? "ok" : "pending"} />
              </div>
            </div>
          ) : null}

          {saving ? <SavingStatus label={savingLabel} /> : null}

          {error ? <ErrorCard message={error} onLogin={() => navigate("/login", { replace: true })} showActions={submitFailed} /> : null}

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

function SummaryCard({
  label,
  value,
  detail,
  status,
}: {
  label: string;
  value: string;
  detail: string;
  status: "ok" | "pending";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase text-zinc-500">{label}</p>
        <span className={status === "ok" ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-amber-400"}>
          {status === "ok" ? "Pronto" : "Pendente"}
        </span>
      </div>
      <p className="mt-1 font-semibold">{value || "-"}</p>
      <p className="mt-1 break-all text-sm text-zinc-400">{detail}</p>
    </div>
  );
}

function SavingStatus({ label }: { label: string }) {
  const items = ["Estúdio", "Horários", "Equipe", "Serviços", "Painel"];

  return (
    <div className="mt-5 rounded-2xl border border-[#E8650A]/25 bg-[#E8650A]/10 p-4">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-[#E8650A]" size={18} />
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-zinc-300">Mantenha esta página aberta enquanto finalizamos.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {items.map((item) => (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-center text-xs text-zinc-300" key={item}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message, onLogin, showActions }: { message: string; onLogin: () => void; showActions: boolean }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
      <p className="font-semibold">Não conseguimos concluir agora</p>
      <p className="mt-1 text-red-200">{message}</p>
      {showActions ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button className="rounded-xl bg-[#E8650A] px-4 py-2 font-semibold text-white" type="submit">
            Tentar novamente
          </button>
          <button className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-white" onClick={onLogin} type="button">
            Ir para login
          </button>
        </div>
      ) : null}
    </div>
  );
}


