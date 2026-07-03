import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  getArtistBySlug,
  getStudioArtists,
  getStudioBySlug,
  type PublicArtist,
  type PublicStudio,
} from "@/services/public.service";
import {
  BookingAvailabilityError,
  createAppointment,
  createClient,
  getAvailableTimeSlots,
  getMinimumBookingDate,
  getServicesByStudio,
  updateAppointmentNotes,
  uploadReferencePhotos,
  type BookingService,
} from "@/services/booking.service";

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidBrazilPhone(phone: string) {
  const digits = cleanPhone(phone);
  return digits.length >= 10 && digits.length <= 11;
}

function cleanInstagram(value: string) {
  return value.replace("@", "").trim();
}

function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/55${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <section className="max-w-md text-center">
        <p className="text-3xl font-semibold">404</p>
        <p className="mt-3 text-zinc-400">Página de agendamento não encontrada.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-[#E8650A] px-5 py-3 font-semibold" to="/">
          Voltar
        </Link>
      </section>
    </main>
  );
}

export function BookingPage() {
  const { slug, artistSlug } = useParams();
  const minimumDate = useMemo(() => getMinimumBookingDate(), []);
  const [studio, setStudio] = useState<PublicStudio | null>(null);
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [date, setDate] = useState(minimumDate);
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitWarning, setSubmitWarning] = useState("");

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
      } catch (caughtError) {
        logger.error("Falha ao carregar dados do booking público", caughtError, { slug: studioSlug });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadBookingData();
  }, [slug, artistSlug]);

  useEffect(() => {
    if (!studio?.id || !selectedArtistId || !date) {
      setAvailableTimes([]);
      setTime("");
      return;
    }

    const studioId = studio.id;
    let active = true;

    async function loadAvailability() {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");

        const slots = await getAvailableTimeSlots(studioId, selectedArtistId, date);

        if (!active) return;

        setAvailableTimes(slots);
        setTime((currentTime) => (slots.includes(currentTime) ? currentTime : slots[0] ?? ""));
      } catch (caughtError) {
        if (!active) return;
        logger.error("Falha ao carregar disponibilidade", caughtError, {
          studioId,
          artistId: selectedArtistId,
          date,
        });
        setAvailableTimes([]);
        setTime("");
        setAvailabilityError("Não foi possível carregar os horários desse dia.");
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    }

    loadAvailability();

    return () => {
      active = false;
    };
  }, [date, selectedArtistId, studio?.id]);

  useEffect(() => {
    const urls = referenceFiles.map((file) => URL.createObjectURL(file));
    setReferencePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [referenceFiles]);

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
      "Olá! Quero confirmar meu agendamento:",
      `*Tatuador:* ${selectedArtist?.name ?? ""}`,
      `*Serviço:* ${selectedService?.name ?? ""}`,
      `*Data:* ${date}`,
      `*Horário:* ${time}`,
      `*Nome:* ${clientName}`,
    ].join("\n");
  }, [clientName, date, selectedArtist, selectedService, time]);

  const studioWhatsapp = studio?.whatsapp ?? "";
  const confirmationLink = studioWhatsapp ? whatsappUrl(studioWhatsapp, confirmationText) : "";

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 3);
    setReferenceFiles(files);
  }

  function goToStepTwo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedArtistId || !selectedServiceId || !date || !time) {
      setError("Preencha tatuador, serviço, data e horário.");
      return;
    }

    if (artists.length === 0) {
      setError("Este estúdio ainda não tem tatuadores disponíveis para agendamento.");
      return;
    }

    if (services.length === 0) {
      setError("Este estúdio ainda não tem serviços disponíveis para agendamento.");
      return;
    }

    if (availabilityLoading) {
      setError("Aguarde os horários carregarem.");
      return;
    }

    if (!availableTimes.includes(time)) {
      setError("Escolha um horário disponível.");
      return;
    }

    setStep(2);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!studio || !selectedArtist || !selectedService) return;
    if (!clientName || !whatsapp || !description) {
      setError("Preencha nome, WhatsApp e descrição da tatuagem.");
      return;
    }

    if (!isValidBrazilPhone(whatsapp)) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitWarning("");

      const client = await createClient({
        studioId: studio.id,
        name: clientName,
        phone: whatsapp,
        email,
        instagram: cleanInstagram(instagram),
      });

      const appointment = await createAppointment({
        studioId: studio.id,
        artistId: selectedArtist.id,
        clientId: client.id,
        serviceId: selectedService.id,
        date,
        time,
        description,
      });

      if (referenceFiles.length) {
        try {
          const referenceUrls = await uploadReferencePhotos(studio.id, appointment.id, referenceFiles);
          await updateAppointmentNotes(appointment.id, `Referências: ${referenceUrls.join(", ")}`);
        } catch (uploadError) {
          logger.error("Falha ao enviar referências do agendamento", uploadError, {
            studioId: studio.id,
            appointmentId: appointment.id,
          });
          setSubmitWarning("Agendamento salvo. As fotos não foram enviadas, mas você pode mandar as referências pelo WhatsApp.");
        }
      }

      setStep(3);
    } catch (caughtError) {
      if (caughtError instanceof BookingAvailabilityError) {
        setStep(1);
        setError(caughtError.message);
      } else {
        logger.error("Falha ao salvar booking público", caughtError, { studioId: studio.id });
        setError(
          getFriendlyErrorMessage(caughtError, "Não foi possível salvar o agendamento. Tente novamente."),
        );
      }
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
          <h1 className="mt-2 text-3xl font-semibold">Agendar horário</h1>
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
                {artists.length === 0 ? <option value="">Nenhum tatuador ativo</option> : null}
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Serviço</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                required
              >
                {services.length === 0 ? <option value="">Nenhum serviço ativo</option> : null}
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
                  min={minimumDate}
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Horário</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                  disabled={availabilityLoading || availableTimes.length === 0}
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                >
                  {availabilityLoading ? <option value="">Carregando horários...</option> : null}
                  {!availabilityLoading && availableTimes.length === 0 ? (
                    <option value="">Nenhum horário disponível</option>
                  ) : null}
                  {availableTimes.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {availabilityError ? <p className="text-sm text-red-400">{availabilityError}</p> : null}
            {artists.length === 0 || services.length === 0 ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Este estúdio ainda precisa cadastrar pelo menos um tatuador e um serviço ativo para receber agendamentos.
              </div>
            ) : null}
            {!availabilityError && !availabilityLoading && availableTimes.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Esse dia está fechado ou todos os horários desse tatuador já foram ocupados.
              </p>
            ) : null}
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
                  inputMode="numeric"
                  placeholder="11999999999"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Instagram</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                  value={instagram}
                  onChange={(event) => setInstagram(cleanInstagram(event.target.value))}
                  placeholder="seuinstagram"
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
              <label className="mb-2 block text-sm font-medium">Descrição da tatuagem</label>
              <textarea
                className="min-h-32 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Fotos de referência</label>
              <input
                accept="image/*"
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                multiple
                onChange={handleFiles}
                type="file"
              />
              <p className="mt-2 text-xs text-zinc-500">Até 3 fotos.</p>
              {referencePreviews.length ? (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {referencePreviews.map((preview) => (
                    <img
                      alt="Referência da tatuagem"
                      className="aspect-square rounded-xl border border-white/10 object-cover"
                      key={preview}
                      src={preview}
                    />
                  ))}
                </div>
              ) : null}
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
              <p>Serviço: {selectedService?.name}</p>
              <p>Data: {date}</p>
              <p>Horário: {time}</p>
              <p>Nome: {clientName}</p>
            </div>
            {submitWarning ? (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                {submitWarning}
              </p>
            ) : null}
            {confirmationLink ? (
              <a
                className="mt-6 inline-flex w-full justify-center rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
                href={confirmationLink}
                rel="noreferrer"
                target="_blank"
              >
                Confirmar pelo WhatsApp
              </a>
            ) : (
              <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Agendamento salvo. O estúdio ainda precisa cadastrar um WhatsApp para confirmação automática.
              </p>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
