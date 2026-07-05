import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { createStoragePath, getStoragePathFromPublicUrl, validateUploadFile } from "@/services/storage.service";

function getFriendlyStudioLogoErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function deleteStudioLogoByUrl(logoUrl: string | null | undefined) {
  if (!logoUrl) return;

  const previousPath = getStoragePathFromPublicUrl(logoUrl, "logos");
  if (!previousPath) return;

  const { error } = await supabase.storage.from("logos").remove([previousPath]);
  if (error) throw error;
}

async function uploadStudioLogoFile(studioId: string, file: File) {
  if (!studioId) {
    throw new Error("O estúdio ainda está carregando. Aguarde um instante e tente novamente.");
  }

  validateUploadFile(file);
  const path = createStoragePath(studioId, file.name);

  const { error } = await supabase.storage.from("logos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(getFriendlyStudioLogoErrorMessage(error, "Não foi possível enviar a logo agora."));
  }

  const { data } = supabase.storage.from("logos").getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export async function replaceStudioLogo({
  studioId,
  file,
  previousLogoUrl,
}: {
  studioId: string;
  file: File;
  previousLogoUrl?: string | null;
}) {
  const nextLogo = await uploadStudioLogoFile(studioId, file);

  const { error: updateError } = await supabase.from("studios").update({ logo_url: nextLogo.publicUrl }).eq("id", studioId);

  if (updateError) {
    await supabase.storage.from("logos").remove([nextLogo.path]);
    throw new Error("A nova logo foi enviada, mas não conseguimos salvar no estúdio.");
  }

  let removalWarning: string | null = null;

  if (previousLogoUrl && previousLogoUrl !== nextLogo.publicUrl) {
    try {
      await deleteStudioLogoByUrl(previousLogoUrl);
    } catch (caughtError) {
      logger.warn("Logo anterior não pôde ser removida após atualizar a nova.", {
        studioId,
        previousLogoUrl,
        error: caughtError instanceof Error ? caughtError.message : "desconhecido",
      });
      removalWarning = "A nova logo foi salva, mas a antiga não pôde ser removida agora.";
    }
  }

  return {
    logoUrl: nextLogo.publicUrl,
    removalWarning,
  };
}
