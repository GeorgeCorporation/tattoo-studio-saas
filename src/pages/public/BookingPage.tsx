import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getArtistBySlug,
  getStudioArtists,
  getStudioBySlug,
  type PublicArtist,
  type PublicStudio,
} from "@/services/public.service";
import {
  createAppointment,
  createClient,
  getServicesByStudio,
  uploadReferencePhotos,
  type BookingService,
} from "@/services/booking.service";

const times = Array.from({ length: 11 }, (_, index) => `${String(index + 9).padStart(2, "0")}:00`);

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/55${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <section className="max-w-md text-center">
        <p className="text-3xl font-semibold">404</p>
        <p className="mt-3 text-zinc-400">Pagina de agendamento nao encontrada.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-[#E8650A] px-5 py-3 font-semibold" to="/">
          Voltar
        </Link>
      </section>
    </main>
  );
}

export function BookingPage() {
  const { slug, artistSlug } = useParams();
  const [studio, setStudio] = useState<PublicStudio | null>(null);
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState("09:00");
  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    const studioSlug = slug;
    const currentArtistSlug = artistSlug;

    async function loadBookingData() {
      try {
        setLoading(true);
        const foundStudio = await getStudioBySlug(studioSlug);

        if (!foundStudio) {
          setNotFound(true);
          return;
        }

        const [foundArtists, foundServices] = await Promise.all([
          getStudioArtists(foundStudio.id),
          getServicesByStudio(foundStudio.id),
        ]);

        setStudio(foundStudio);
        setArtists(foundArtists);
        setServices(foundServices);
        setSelectedArtistId(foundArtists[0]?.id ?? "");
        setSelectedServiceId(foundServices[0]?.id ?? "");

        if (currentArtistSlug) {
          const foundArtist = await getArtistBySlug(foundStudio.id, currentArtistSlug);
          if (foundArtist) setSelectedArtistId(foundArtist.id);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadBookingData();
  }, [slug, artistSlug]);

  const selectedArtist = useMemo(
    () => artists.find((artist) => artist.id === selectedArtistId) ?? null,
    [artists, selectedArtistId],
  );

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const confirmationText = useMemo(() => {
    return [
      "Ola! Quero confirmar meu agendamento:",
      `*Tatuador:* ${selectedArtist?.name ?? ""}`,
      `*Servico:* ${selectedService?.name ?? ""}`,
      `*Data:* ${date}`,
      `*Horario:* ${time}`,
      `*Nome:* ${clientName}`,
    ].join("\n");
  }, [clientName, date, selectedArtist, selectedService, time]);

  const studioWhatsapp = studio?.whatsapp ?? whatsapp;
  const confirmationLink = whatsappUrl(studioWhatsapp, confirmationText);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3);
    setReferenceFiles(files);
  }

  function goToStepTwo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedArtistId || !selectedServiceId || !date || !time) {
      setError("Preencha tatuador, servico, data e horario.");
      return;
    }

    setStep(2);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!studio || !selectedArtist || !selectedService) return;
    if (!clientName || !whatsapp || !description) {
      setError("Preencha nome, WhatsApp e descricao da tatuagem.");
      return;
    }

    try {
      setSubmitting(true);

      const referenceUrls = referenceFiles.length
        ? await uploadReferencePhotos(studio.id, referenceFiles)
        : [];

      const client = await createClient({
        studioId: studio.id,
        name: clientName,
        phone: whatsapp,
        email,
        instagram,
        notes: referenceUrls.length ? `Referencias: ${referenceUrls.join(", ")}` : undefined,
      });

      await createAppointment({
        studioId: studio.id,
        artistId: selectedArtist.id,
        clientId: client.id,
        serviceId: selectedService.id,
        date,
        time,
        description,
        notes: referenceUrls.length ? `Referencias: ${referenceUrls.join(", ")}` : undefined,
      });

      setStep(3);
    } catch {
      setError("Nao foi possivel salvar o agendamento. Verifique Storage/RLS no Supabase.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-zinc-300">
        Carregando...
      </div>
    );
  }

  if (notFound || !studio) return <NotFound />;

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl">
        <Link className="text-sm font-medium text-[#E8650A]" to={`/${studio.slug}`}>
          Voltar para {studio.name}
        </Link>

        <header className="mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E8650A]">Agendamento</p>
          <h1 className="mt-2 text-3xl font-semibold">Agendar horario</h1>
          <p className="mt-2 text-sm text-zinc-400">{studio.name}</p>
        </header>

        {step === 1 ? (
          <form className="mt-6 space-y-5 rounded-xl border border-white/10 bg-[#1a1a1a] p-5" onSubmit={goToStepTwo}>
            <div>
              <label className="mb-2 block text-sm font-medium">Tatuador</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={selectedArtistId}
                onChange={(event) => setSelectedArtistId(event.target.value)}
                required
              >
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Servico</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                required
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Data</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                  min={tomorrow()}
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Horario</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                >
                  {times.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button className="w-full rounded-xl bg-[#E8650A] px-4 py-3 font-semibold" type="submit">
              Continuar
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="mt-6 space-y-5 rounded-xl border border-white/10 bg-[#1a1a1a] p-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium">Nome completo</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">WhatsApp</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Instagram</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Descricao da tatuagem</label>
              <textarea
                className="min-h-32 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Fotos de referencia</label>
              <input
                accept="image/*"
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                multiple
                onChange={handleFiles}
                type="file"
              />
              <p className="mt-2 text-xs text-zinc-500">Ate 3 fotos.</p>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-xl border border-white/10 px-4 py-3 font-semibold"
                onClick={() => setStep(1)}
                type="button"
              >
                Voltar
              </button>
              <button
                className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Salvando..." : "Finalizar"}
              </button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <section className="mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <h2 className="text-2xl font-semibold">Agendamento recebido</h2>
            <div className="mt-5 space-y-2 text-sm text-zinc-300">
              <p>Tatuador: {selectedArtist?.name}</p>
              <p>Servico: {selectedService?.name}</p>
              <p>Data: {date}</p>
              <p>Horario: {time}</p>
              <p>Nome: {clientName}</p>
            </div>
            <a
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
              href={confirmationLink}
              rel="noreferrer"
              target="_blank"
            >
              Confirmar pelo WhatsApp
            </a>
          </section>
        ) : null}
      </section>
    </main>
  );
}
