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
  userEmail?: string | null,
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

  let artistLookup = supabase
    .from("tattoo_artists")
    .select("id, studio_id, studios(id, name, slug, logo_url)")
    .eq("is_active", true)
    .limit(1);

  if (userEmail) {
    artistLookup = artistLookup.or(`auth_user_id.eq.${userId},access_email.eq.${userEmail}`);
  } else {
    artistLookup = artistLookup.eq("auth_user_id", userId);
  }

  const { data: member, error: memberError } = await artistLookup.maybeSingle<{
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

  if (memberError) throw memberError;
  if (!member?.studios) return null;

  const studio = Array.isArray(member.studios) ? member.studios[0] : member.studios;
  if (!studio) return null;

  return {
    studioId: studio.id,
    studioName: studio.name,
    studioSlug: studio.slug,
    studioLogoUrl: studio.logo_url,
    role: "artist",
    artistId: member.id,
    isOwner: false,
  };
}
