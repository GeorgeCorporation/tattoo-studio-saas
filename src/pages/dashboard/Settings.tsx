import { Loader2, Lock, LogOut, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { createStoragePath, getStoragePathFromPublicUrl } from "@/services/storage.service";

type WorkingHour = {
  id?: string;
  studio_id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
};

type StudioSettings = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
};

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

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
  "mt-2 w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A]";

function makeDefaultHours(): WorkingHour[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    open_time: "09:00",
    close_time: "18:00",
    is_open: day !== 0,
  }));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [studioId, setStudioId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(makeDefaultHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;

      try {
        setLoading(true);

        const { data: studio, error: studioError } = await supabase
          .from("studios")
          .select("id, name, logo_url, description, whatsapp, instagram, website, address, city, state")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle<StudioSettings>();

        if (studioError) throw studioError;
        if (!studio) {
          setToast({ type: "error", message: "Estudio nao encontrado." });
          return;
        }

        setStudioId(studio.id);
        setLogoUrl(studio.logo_url ?? "");
        setName(studio.name ?? "");
        setDescription(studio.description ?? "");
        setWhatsapp(studio.whatsapp ?? "");
        setInstagram((studio.instagram ?? "").replace("@", ""));
        setWebsite(studio.website ?? "");
        setAddress(studio.address ?? "");
        setCity(studio.city ?? "");
        setStateUf(studio.state ?? "");

        const { data: hours, error: hoursError } = await supabase
          .from("working_hours")
          .select("id, studio_id, day_of_week, open_time, close_time, is_open")
          .eq("studio_id", studio.id)
          .order("day_of_week", { ascending: true })
          .returns<WorkingHour[]>();

        if (hoursError) throw hoursError;

        if (hours?.length) {
          const merged = makeDefaultHours().map((item) => hours.find((hour) => hour.day_of_week === item.day_of_week) ?? item);
          setWorkingHours(merged);
        }
      } catch {
        setToast({ type: "error", message: "Nao foi possivel carregar configuracoes." });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateDay(day: number, field: keyof WorkingHour, value: boolean | string) {
    setWorkingHours((current) =>
      current.map((item) => (item.day_of_week === day ? { ...item, [field]: value } : item)),
    );
  }

  async function uploadLogo(file: File) {
    if (!studioId) return;

    const path = createStoragePath(studioId, file.name);

    if (logoUrl) {
      const previousPath = getStoragePathFromPublicUrl(logoUrl, "logos");
      if (previousPath) {
        await supabase.storage.from("logos").remove([previousPath]);
      }
    }

    const { error } = await supabase.storage.from("logos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
  }

  async function handleSave() {
    if (!name.trim()) {
      setToast({ type: "error", message: "Nome do estudio obrigatorio." });
      return;
    }

    if (!/^\d{11}$/.test(whatsapp)) {
      setToast({ type: "error", message: "WhatsApp deve ter 11 numeros. Ex: 11999999999." });
      return;
    }

    try {
      setSaving(true);

      const { error: studioError } = await supabase
        .from("studios")
        .update({
          name: name.trim(),
          logo_url: logoUrl || null,
          description: description.trim() || null,
          whatsapp,
          instagram: instagram ? `@${instagram.replace("@", "")}` : null,
          website: website.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: stateUf || null,
        })
        .eq("id", studioId);

      if (studioError) throw studioError;

      const nextWorkingHours = workingHours.map((day) => ({ ...day }));

      for (const day of nextWorkingHours) {
        if (day.id) {
          const { error } = await supabase
            .from("working_hours")
            .update({
              open_time: day.open_time,
              close_time: day.close_time,
              is_open: day.is_open,
            })
            .eq("id", day.id);

          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("working_hours")
            .insert({
              studio_id: studioId,
              day_of_week: day.day_of_week,
              open_time: day.open_time,
              close_time: day.close_time,
              is_open: day.is_open,
            })
            .select("id")
            .single<{ id: string }>();

          if (error) throw error;
          day.id = data.id;
        }
      }

      setWorkingHours(nextWorkingHours);
      setToast({ type: "success", message: "Configuracoes salvas com sucesso." });
    } catch {
      setToast({ type: "error", message: "Erro ao salvar configuracoes." });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setToast({
      type: error ? "error" : "success",
      message: error ? "Nao foi possivel enviar email de senha." : "Email para alterar senha enviado.",
    });
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <section className="relative space-y-6 pb-28 text-white">
      {toast ? (
        <div
          className={[
            "fixed right-4 top-4 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg",
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-200"
              : "border-red-500/30 bg-red-500/10 text-red-200",
          ].join(" ")}
        >
          {toast.message}
        </div>
      ) : null}

      <div>
        <h1 className="text-3xl font-semibold">Configuracoes</h1>
        <p className="mt-2 text-sm text-zinc-400">Ajuste identidade, contato, horarios e conta do estudio.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-zinc-400">Carregando configuracoes...</div>
      ) : (
        <>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Identidade</h2>
            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start">
              <div className="flex flex-col items-center gap-3">
                {logoUrl ? (
                  <img alt={name || "Logo"} className="h-24 w-24 rounded-2xl object-cover" src={logoUrl} />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#E8650A] text-2xl font-semibold">
                    {initials(name || "Ideal Tattoo")}
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#2a2a2a] px-4 py-2 text-sm font-medium hover:border-[#E8650A]">
                  <Upload size={16} />
                  Upload de logo
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        await uploadLogo(file);
                        setToast({ type: "success", message: "Logo enviada com sucesso." });
                      } catch {
                        setToast({ type: "error", message: "Erro ao enviar logo." });
                      }
                      event.target.value = "";
                    }}
                    type="file"
                  />
                </label>
              </div>

              <div className="grid flex-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do estudio</label>
                  <input className={inputClass} maxLength={80} onChange={(event) => setName(event.target.value)} value={name} />
                </div>
                <div>
                  <label className="text-sm font-medium">Descricao</label>
                  <textarea
                    className={`${inputClass} min-h-28 resize-none`}
                    maxLength={200}
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                  <p className="mt-2 text-right text-xs text-zinc-500">{description.length}/200</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Contato</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">WhatsApp</label>
                <input className={inputClass} maxLength={11} onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ""))} value={whatsapp} />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram</label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                  <input className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] py-3 pl-8 pr-4 text-white outline-none transition focus:border-[#E8650A]" onChange={(event) => setInstagram(event.target.value.replace("@", ""))} value={instagram} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <input className={inputClass} onChange={(event) => setWebsite(event.target.value)} value={website} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Localizacao</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-[2fr_1fr_140px]">
              <div>
                <label className="text-sm font-medium">Endereco</label>
                <input className={inputClass} onChange={(event) => setAddress(event.target.value)} value={address} />
              </div>
              <div>
                <label className="text-sm font-medium">Cidade</label>
                <input className={inputClass} onChange={(event) => setCity(event.target.value)} value={city} />
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <select className={inputClass} onChange={(event) => setStateUf(event.target.value)} value={stateUf}>
                  <option value="">Selecione</option>
                  {brStates.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Horarios de funcionamento</h2>
            <div className="mt-5 space-y-3">
              {workingHours.map((day) => (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-4" key={day.day_of_week}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label={`Ativar ${weekDays[day.day_of_week]}`}
                        className={[
                          "relative h-7 w-12 rounded-full transition",
                          day.is_open ? "bg-[#E8650A]" : "bg-zinc-700",
                        ].join(" ")}
                        onClick={() => updateDay(day.day_of_week, "is_open", !day.is_open)}
                        type="button"
                      >
                        <span
                          className={[
                            "absolute top-1 h-5 w-5 rounded-full bg-white transition",
                            day.is_open ? "left-6" : "left-1",
                          ].join(" ")}
                        />
                      </button>
                      <div>
                        <p className="font-medium">{weekDays[day.day_of_week]}</p>
                        <p className="text-sm text-zinc-500">{day.is_open ? "Aberto" : "Fechado"}</p>
                      </div>
                    </div>

                    {day.is_open ? (
                      <div className="grid grid-cols-2 gap-3 md:w-[260px]">
                        <input className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-white outline-none focus:border-[#E8650A]" onChange={(event) => updateDay(day.day_of_week, "open_time", event.target.value)} type="time" value={day.open_time} />
                        <input className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-white outline-none focus:border-[#E8650A]" onChange={(event) => updateDay(day.day_of_week, "close_time", event.target.value)} type="time" value={day.close_time} />
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-zinc-500">Fechado</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Conta</h2>
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-500">Email atual</p>
                <p className="mt-1 font-medium">{user?.email || "-"}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-4 py-3 font-medium hover:border-[#E8650A]" onClick={handlePasswordReset} type="button">
                  <Lock size={16} />
                  Alterar senha
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-4 py-3 font-medium text-red-200 hover:border-red-500/40" onClick={handleSignOut} type="button">
                  <LogOut size={16} />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a2a2a] bg-[#0f0f0f]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl justify-end">
          <button
            className="inline-flex min-w-52 items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold text-white disabled:opacity-60"
            disabled={saving || loading}
            onClick={handleSave}
            type="button"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar configuracoes
          </button>
        </div>
      </div>
    </section>
  );
}
