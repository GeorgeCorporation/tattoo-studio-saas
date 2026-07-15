import { isMockMode, mockUser } from "@/lib/mockMode";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/access-control";

export type AccessContext = {
  studioId: string;
  studioName: string;
  studioSlug: string;
  studioLogoUrl: string | null;
  role: UserRole;
  artistId: string | null;
  isOwner: boolean;
};

type ResolveAccessRoleInput = {
  ownerStudioId: string | null;
  memberStudioId?: string | null;
  memberRole?: UserRole | null;
  memberArtistId?: string | null;
};

export function resolveAccessRole(input: ResolveAccessRoleInput) {
  if (input.ownerStudioId) {
    return {
      role: "manager" as const,
      artistId: null,
      isOwner: true,
      studioId: input.ownerStudioId,
    };
  }

  if (input.memberStudioId && input.memberRole) {
    return {
      role: input.memberRole,
      artistId: input.memberRole === "artist" ? input.memberArtistId ?? null : null,
      isOwner: false,
      studioId: input.memberStudioId,
    };
  }

  return null;
}

export async function getCurrentUserAccess(
  userId: string,
): Promise<AccessContext | null> {
  if (isMockMode && userId === mockUser.id) {
    return {
      studioId: "mock-studio-1",
      studioName: "Inkora Demo",
      studioSlug: "inkora-demo",
      studioLogoUrl: null,
      role: "manager",
      artistId: null,
      isOwner: true,
    };
  }

  const { data: ownerStudio, error: ownerError } = await supabase
    .from("studios")
    .select("id, name, slug, logo_url")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle<{ id: string; name: string; slug: string; logo_url: string | null }>();

  if (ownerError) throw ownerError;
  if (ownerStudio) {
    return {
      studioId: ownerStudio.id,
      studioName: ownerStudio.name,
      studioSlug: ownerStudio.slug,
      studioLogoUrl: ownerStudio.logo_url,
      role: "manager",
      artistId: null,
      isOwner: true,
    };
  }

  const { data: memberByAuth, error: memberByAuthError } = await supabase
    .from("tattoo_artists")
    .select("id, studio_id, studios(id, name, slug, logo_url)")
    .eq("is_active", true)
    .eq("auth_user_id", userId)
    .limit(1)
    .maybeSingle<{
      id: string;
      studio_id: string;
      studios:
        | {
            id: string;
            name: string;
            slug: string;
            logo_url: string | null;
          }
        | {
            id: string;
            name: string;
            slug: string;
            logo_url: string | null;
          }[]
        | null;
    }>();

  if (memberByAuthError) throw memberByAuthError;

  if (!memberByAuth?.studios) return null;

  const studio = Array.isArray(memberByAuth.studios) ? memberByAuth.studios[0] : memberByAuth.studios;
  if (!studio) return null;

  return {
    studioId: studio.id,
    studioName: studio.name,
    studioSlug: studio.slug,
    studioLogoUrl: studio.logo_url,
    role: "artist",
    artistId: memberByAuth.id,
    isOwner: false,
  };
}
