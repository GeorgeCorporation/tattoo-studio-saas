import { Loader2, Lock, LogOut, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { inkoraMark } from "@/assets";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { replaceStudioLogo } from "@/services/studio-brand.service";

type WorkingHour = {
  id?: string;
  studio_id?: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
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
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
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
    open_time: day === 0 ? null : "09:00",
    close_time: day === 0 ? null : "18:00",
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

function normalizeInstagram(value: string) {
  return value.replace("@", "").trim();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
          setToast({ type: "error", message: "Estúdio não encontrado." });
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
      } catch (caughtError) {
        logger.error("Falha ao carregar configurações", caughtError, { userId: user.id });
        setToast({
          type: "error",
          message: getFriendlyErrorMessage(caughtError, "Não foi possível carregar as configurações."),
        });
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateDay(day: number, field: keyof WorkingHour, value: boolean | string | null) {
    setWorkingHours((current) =>
      current.map((item) =>
        item.day_of_week === day
          ? {
              ...item,
              [field]: value,
              open_time: field === "is_open" && value === false ? null : item.open_time ?? "09:00",
              close_time: field === "is_open" && value === false ? null : item.close_time ?? "18:00",
            }
          : item,
      ),
    );
  }

  async function uploadLogo(file: File) {
    if (!studioId) {
      throw new Error("O estúdio ainda está carregando. Aguarde um instante e tente novamente.");
    }

    const previousLogoUrl = logoUrl || null;
    const previewUrl = URL.createObjectURL(file);

    setUploadingLogo(true);
    setLogoUrl(previewUrl);

    try {
      const { logoUrl: nextLogoUrl, removalWarning } = await replaceStudioLogo({
        studioId,
        file,
        previousLogoUrl,
      });

      setLogoUrl(nextLogoUrl);
      setToast({
        type: "success",
        message: removalWarning || "Logo atualizada com sucesso.",
      });
    } catch (caughtError) {
      setLogoUrl(previousLogoUrl ?? "");
      throw caughtError;
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setToast({ type: "error", message: "Informe o nome do estúdio." });
      return;
    }

    if (!/^\d{11}$/.test(whatsapp)) {
      setToast({ type: "error", message: "Informe um WhatsApp válido com 11 números. Ex: 11999999999." });
      return;
    }

    try {
      setSaving(true);

      const { error: studioError } = await supabase
        .from("studios")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          whatsapp,
          instagram: instagram ? `@${normalizeInstagram(instagram)}` : null,
          website: website.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: stateUf || null,
        })
        .eq("id", studioId);

      if (studioError) throw studioError;

      const nextWorkingHours = workingHours.map((day) => ({ ...day }));

      for (const day of nextWorkingHours) {
        const payload = {
          studio_id: studioId,
          day_of_week: day.day_of_week,
          open_time: day.is_open ? day.open_time : null,
          close_time: day.is_open ? day.close_time : null,
          is_open: day.is_open,
        };

        if (day.id) {
          const { error } = await supabase.from("working_hours").update(payload).eq("id", day.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("working_hours").insert(payload).select("id").single<{ id: string }>();
          if (error) throw error;
          day.id = data.id;
        }
      }

      setWorkingHours(nextWorkingHours);
      setToast({ type: "success", message: "Configurações atualizadas com sucesso." });
    } catch (caughtError) {
      logger.error("Falha ao salvar configurações", caughtError, { studioId });
      setToast({
        type: "error",
        message: getFriendlyErrorMessage(caughtError, "Não foi possível salvar as configurações."),
      });
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
      message: error ? "Não foi possível enviar o e-mail de redefinição." : "E-mail de redefinição enviado com sucesso.",
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
        <h1 className="text-3xl font-semibold">Configurações do estúdio</h1>
        <p className="mt-2 text-sm text-zinc-400">Ajuste identidade visual, canais de contato, endereço e horários de funcionamento.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-zinc-400">Carregando configurações do estúdio...</div>
      ) : (
        <>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Identidade visual</h2>
            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start">
              <div className="flex flex-col items-center gap-3">
                {logoUrl ? (
                  <img alt={name || "Logo"} className="h-24 w-24 rounded-2xl object-cover" src={logoUrl} />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#171717]">
                    {name ? <span className="text-2xl font-semibold text-white">{initials(name)}</span> : <img alt="Inkora" className="h-12 w-12" src={inkoraMark} />}
                  </div>
                )}
                <label
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border border-[#2a2a2a] px-4 py-2 text-sm font-medium",
                    !studioId || uploadingLogo ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#E8650A]",
                  ].join(" ")}
                >
                  {uploadingLogo ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploadingLogo ? "Enviando logo..." : "Atualizar logo"}
                  <input
                    accept="image/*"
                    className="hidden"
                    disabled={!studioId || uploadingLogo}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      try {
                        await uploadLogo(file);
                      } catch (caughtError) {
                        logger.error("Falha ao enviar logo", caughtError, { studioId });
                        setToast({
                          type: "error",
                          message:
                            caughtError instanceof Error && caughtError.message
                              ? caughtError.message
                              : "Não foi possível enviar a logo agora. Sua logo anterior foi mantida.",
                        });
                      }

                      event.target.value = "";
                    }}
                    type="file"
                  />
                </label>
                {!studioId ? <p className="text-center text-xs text-zinc-500">Aguarde o carregamento do estúdio para liberar o upload.</p> : null}
              </div>

              <div className="grid flex-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do estúdio</label>
                  <input className={inputClass} maxLength={80} onChange={(event) => setName(event.target.value)} value={name} />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
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
            <h2 className="text-lg font-semibold">Canais de atendimento</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">WhatsApp principal</label>
                <input className={inputClass} maxLength={11} onChange={(event) => setWhatsapp(onlyDigits(event.target.value))} value={whatsapp} />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram</label>
                <div className="mt-2 flex overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] focus-within:border-[#E8650A]">
                  <span className="flex items-center border-r border-[#2a2a2a] px-4 text-sm text-zinc-500">@</span>
                  <input className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none" onChange={(event) => setInstagram(normalizeInstagram(event.target.value))} value={instagram} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <input className={inputClass} onChange={(event) => setWebsite(event.target.value)} value={website} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Localização</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Endereço</label>
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
            <h2 className="text-lg font-semibold">Horários de funcionamento</h2>
            <div className="mt-5 space-y-4">
              {workingHours.map((day) => (
                <div className="grid gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 md:grid-cols-[1.3fr_auto_auto_auto] md:items-center" key={day.day_of_week}>
                  <div>
                    <p className="font-medium">{weekDays[day.day_of_week]}</p>
                    <p className="text-sm text-zinc-500">{day.is_open ? "Aberto" : "Fechado"}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                    <input checked={day.is_open} onChange={(event) => updateDay(day.day_of_week, "is_open", event.target.checked)} type="checkbox" />
                    Ativo
                  </label>
                  <input
                    className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-white outline-none disabled:opacity-40"
                    disabled={!day.is_open}
                    onChange={(event) => updateDay(day.day_of_week, "open_time", event.target.value)}
                    type="time"
                    value={day.open_time ?? "09:00"}
                  />
                  <input
                    className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-white outline-none disabled:opacity-40"
                    disabled={!day.is_open}
                    onChange={(event) => updateDay(day.day_of_week, "close_time", event.target.value)}
                    type="time"
                    value={day.close_time ?? "18:00"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-lg font-semibold">Conta</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">E-mail atual</label>
                <div className={`${inputClass} flex items-center justify-between`}>
                  <span className="truncate text-zinc-300">{user?.email ?? "Sem e-mail"}</span>
                  <Lock className="text-zinc-500" size={16} />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <button className="rounded-xl border border-[#2a2a2a] px-4 py-3 text-sm font-medium hover:border-[#E8650A]" onClick={handlePasswordReset} type="button">
                  Alterar senha
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-500/10" onClick={handleSignOut} type="button">
                  <LogOut size={16} />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#2a2a2a] bg-[#111111]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || saving || uploadingLogo}
            onClick={handleSave}
            type="button"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar configurações
          </button>
        </div>
      </div>
    </section>
  );
}
