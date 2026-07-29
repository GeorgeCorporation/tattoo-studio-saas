import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { clearMockStudio, isMockMode, mockUser } from "@/lib/mockMode";
import { logger } from "@/lib/logger";
import { logSeguranca } from "@/lib/security-logger";
import { supabase } from "@/lib/supabase";

type SignInCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = SignInCredentials & {
  fullName: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      setUser(mockUser);
      setSession(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    logger.info("ONBOARDING_TRACE auth.getSession.start");
    const timeout = window.setTimeout(() => {
      if (!isMounted) return;
      logger.warn("ONBOARDING_TRACE auth.getSession.timeout");
      setSession(null);
      setUser(null);
      setLoading(false);
    }, 7000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;

        logger.info("ONBOARDING_TRACE auth.getSession.resolved", {
          hasSession: Boolean(data.session),
          hasUser: Boolean(data.session?.user),
        });
        window.clearTimeout(timeout);
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;

        logger.error("ONBOARDING_TRACE auth.getSession.failed", error);
        window.clearTimeout(timeout);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      logger.info("ONBOARDING_TRACE auth.event", {
        event,
        hasSession: Boolean(nextSession),
        hasUser: Boolean(nextSession?.user),
      });
      if (event === "SIGNED_OUT") {
        logSeguranca("LOGOUT");
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    if (isMockMode) {
      return { data: { user: mockUser, session: null }, error: null };
    }

    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp({ fullName, email, password }: SignUpCredentials) {
    if (isMockMode) {
      return { data: { user: mockUser, session: null }, error: null };
    }

    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });
  }

  async function signOut() {
    logSeguranca("LOGOUT");

    if (isMockMode) {
      clearMockStudio();
      setUser(null);
      setSession(null);
      return { error: null };
    }

    return supabase.auth.signOut();
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
