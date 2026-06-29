import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Artist } from "@/services/artists.service";
import { uploadPhoto } from "@/services/gallery.service";

type UploadModalProps = {
  artists: Artist[];
  onClose: () => void;
  onUploaded: () => Promise<void>;
  open: boolean;
  studioId: string;
};

type PreviewFile = {
  file: File;
  url: string;
};

export function UploadModal({ artists, onClose, onUploaded, open, studioId }: UploadModalProps) {
  const [artistId, setArtistId] = useState("");
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const canUpload = useMemo(() => files.length > 0 && !uploading, [files.length, uploading]);

  useEffect(() => {
    if (!open) {
      files.forEach((item) => URL.revokeObjectURL(item.url));
      setFiles([]);
      setArtistId("");
      setProgress(0);
      setError("");
      setDragging(false);
    }
  }, [files, open]);

  if (!open) return null;

  function addFiles(fileList: FileList | File[]) {
    const images = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const slots = Math.max(0, 5 - files.length);
    const next = images.slice(0, slots).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    if (images.length > slots) {
      setError("Limite de 5 fotos por envio.");
    } else {
      setError("");
    }

    setFiles((current) => [...current, ...next]);
  }

  function removeFile(index: number) {
    setFiles((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function handleUpload() {
    if (!canUpload) return;

    try {
      setUploading(true);
      setError("");
      setProgress(0);

      for (let index = 0; index < files.length; index += 1) {
        await uploadPhoto(files[index].file, studioId, artistId || undefined);
        setProgress(Math.round(((index + 1) / files.length) * 100));
      }

      await onUploaded();
      onClose();
    } catch {
      setError("Nao foi possivel enviar as fotos.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#1a1a1a] p-5 text-white shadow-2xl sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Adicionar fotos</h2>
            <p className="mt-1 text-sm text-zinc-400">Envie ate 5 imagens para a galeria.</p>
          </div>
          <button className="rounded-xl border border-white/10 p-2" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <label className="mt-5 block text-sm font-semibold" htmlFor="gallery-artist">
          Tatuador
        </label>
        <select
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#E8650A]"
          id="gallery-artist"
          onChange={(event) => setArtistId(event.target.value)}
          value={artistId}
        >
          <option value="">Sem tatuador especifico</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>

        <label
          className={[
            "mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition",
            dragging ? "border-[#E8650A] bg-[#E8650A]/10" : "border-white/15 bg-[#0f0f0f]",
          ].join(" ")}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <ImagePlus className="text-[#E8650A]" size={34} />
          <span className="mt-3 text-sm font-semibold">Arraste fotos ou clique para selecionar</span>
          <span className="mt-1 text-xs text-zinc-500">PNG, JPG ou WEBP</span>
          <input
            accept="image/*"
            className="hidden"
            multiple
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
            type="file"
          />
        </label>

        {files.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {files.map((item, index) => (
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-black" key={item.url}>
                <img alt={item.file.name} className="h-full w-full object-cover" src={item.url} />
                <button
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                  onClick={() => removeFile(index)}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {uploading ? (
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#E8650A] transition-all" style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-xl border border-white/10 px-4 py-3 font-semibold" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canUpload}
            onClick={handleUpload}
            type="button"
          >
            <Upload size={18} />
            {uploading ? "Enviando..." : "Enviar fotos"}
          </button>
        </div>
      </div>
    </div>
  );
}
