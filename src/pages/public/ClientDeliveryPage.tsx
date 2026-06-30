import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicDeliveryByToken, type PublicDelivery } from "@/services/deliveries.service";

export function ClientDeliveryPage() {
  const { token } = useParams();
  const [delivery, setDelivery] = useState<PublicDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDelivery() {
      if (!token) return;

      try {
        setLoading(true);
        setError("");
        const data = await getPublicDeliveryByToken(token);
        setDelivery(data);
      } catch {
        setError("Nao foi possivel abrir entrega.");
      } finally {
        setLoading(false);
      }
    }

    loadDelivery();
  }, [token]);

  if (loading) {
    return <main className="min-h-screen bg-[#0f0f0f] p-6 text-white">Carregando fotos...</main>;
  }

  if (error || !delivery) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-6 text-white">
        <section className="max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
          <h1 className="text-2xl font-semibold">Entrega nao encontrada</h1>
          <p className="mt-2 text-sm text-zinc-400">Verifique se o link esta correto.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
          <div className="flex items-center gap-4">
            {delivery.studio.logo_url ? (
              <img alt={delivery.studio.name} className="size-14 rounded-xl object-cover" src={delivery.studio.logo_url} />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-xl bg-[#E8650A] font-bold">
                {delivery.studio.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-zinc-400">{delivery.studio.name}</p>
              <h1 className="text-2xl font-semibold">{delivery.title}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            {delivery.message || `${delivery.client.name}, suas fotos estao prontas para baixar.`}
          </p>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {delivery.photos.map((photo, index) => (
            <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]" key={photo.id}>
              <a href={photo.url} rel="noreferrer" target="_blank">
                <img alt={photo.file_name ?? `Foto ${index + 1}`} className="aspect-square w-full object-cover" src={photo.url} />
              </a>
              <a
                className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-sm font-semibold text-[#E8650A]"
                download={photo.file_name ?? `foto-${index + 1}`}
                href={photo.url}
              >
                <Download size={16} />
                Baixar foto
              </a>
            </article>
          ))}
        </div>

        {!delivery.photos.length ? (
          <p className="mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-5 text-sm text-zinc-400">
            Nenhuma foto disponivel ainda.
          </p>
        ) : null}
      </section>
    </main>
  );
}
