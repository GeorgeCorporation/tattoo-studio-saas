import { supabase } from "@/lib/supabase";
import type { ArtistAccessInvite } from "@/services/artists.service";

export type ArtistInviteDetails = ArtistAccessInvite & {
  studio: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  artist: {
    id: string;
    name: string;
    slug: string;
    specialty: string | null;
  };
};

export async function getArtistInviteByToken(token: string) {
  const { data, error } = await supabase.rpc("get_artist_invite_by_token", {
    p_token: token,
  });

  if (error) throw error;
  return data as ArtistInviteDetails | null;
}

export async function acceptArtistInvite(token: string, email: string) {
  const { data, error } = await supabase.rpc("accept_artist_invite", {
    p_token: token,
    p_email: email,
  });

  if (error) throw error;
  return data as { ok: boolean; artist_id: string; studio_id: string };
}
