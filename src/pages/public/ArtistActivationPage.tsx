import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { inkoraLogo } from "@/assets";
import { getFriendlyAuthErrorMessage, getFriendlyErrorMessage } from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { acceptArtistInvite, getArtistInviteByToken } from "@/services/artist-invites.service";

type InviteState = Awaited<ReturnType<typeof getArtistInviteByToken>>;

export function ArtistActivationPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteState>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inviteExpired = useMemo(() => {
    if (!invite) return false;
    return invite.status === "expired" || new Date(invite.expires_at).getTime() < Date.now();
  }, [invite]);

  const inviteAccepted = invite?.status === "accepted";
  const inviteRevoked = invite?.status === "revoked";

  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setError("Convite invalido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const nextInvite = await getArtistInviteByToken(token);
        setInvite(nextInvite);
        setEmail(nextInvite?.email ?? "");
      } catch (caughtError) {
        setError(getFriendlyErrorMessage(caughtError, "Nao foi possivel abrir este convite."));
      } finally {
        setLoading(false);
      }
    }

    void loadInvite();
  }, [token]);

  useEffect(() => {
    if (!invite || inviteExpired || error) return;

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user;
      if (!isMounted || !sessionUser) return;

      const inviteEmail = invite.email.toLowerCase();
      const sessionEmail = (sessionUser.email ?? "").toLowerCase();

      if (sessionEmail && sessionEmail !== inviteEmail) {
        setError("Este e-mail nao corresponde ao convite.");
        return;
      }

      try {
        setSubmitting(true);
        await acceptArtistInvite(token, sessionUser.email ?? invite.email);
        navigate("/painel", { replace: true });
      } catch (caughtError) {
        setError(getFriendlyAuthErrorMessage(caughtError, "Nao foi possivel concluir sua ativacao."));
      } finally {
        if (isMounted) setSubmitting(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [error, invite, inviteExpired, navigate, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!invite) return;
    if (inviteExpired) {
      setError("Seu convite expirou. Peça um novo link ao gestor.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== invite.email.toLowerCase()) {
      setError("Este e-mail nao corresponde ao convite.");
      return;
    }

    if (password.length < 8) {
      setError("Senha fraca. Use pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas nao batem.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?invite_token=${token}`,
            data: {
              full_name: invite.artist.name,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session?.user) {
          await acceptArtistInvite(token, data.session.user.email ?? normalizedEmail);
          navigate("/painel", { replace: true });
          return;
        }

        setMessage("Conta criada. Abra seu email para confirmar o acesso.");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) throw signInError;

      if (!data.session?.user) {
        setMessage("Login feito. Finalizando vinculacao...");
        return;
      }

      await acceptArtistInvite(token, data.session.user.email ?? normalizedEmail);
      navigate("/painel", { replace: true });
    } catch (caughtError) {
      const messageText =
        mode === "signup"
          ? getFriendlyAuthErrorMessage(caughtError, "Nao foi possivel criar sua conta.")
          : getFriendlyAuthErrorMessage(caughtError, "Nao foi possivel entrar com esta conta.");

      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4 text-sm text-zinc-300">
          Abrindo convite...
        </div>
      </main>
    );
  }

  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
          <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
          <p className="mt-4 text-sm text-red-300">{error || "Convite nao encontrado."}</p>
          <Link
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white"
            to="/login"
          >
            Voltar ao login
          </Link>
        </section>
      </main>
      );
  }

  if (inviteAccepted || inviteExpired || inviteRevoked) {
    const title = inviteAccepted
      ? "Este acesso já foi ativado."
      : inviteRevoked
        ? "Convite revogado."
        : "Seu convite expirou.";

    const body = inviteAccepted
      ? "Se este tatuador já tem acesso, use o login normal do painel."
      : "Peça um novo link ao gestor.";

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
          <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
          <p className="mt-4 text-sm text-red-300">{title}</p>
          <p className="mt-2 text-sm text-zinc-400">{body}</p>
          <Link
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white transition hover:bg-[#ff781c]"
            to="/login"
          >
            Ir para login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
        <p className="mt-4 text-center text-sm text-zinc-400">{invite.studio.name}</p>
        <h1 className="mt-2 text-center text-2xl font-semibold">Ativar acesso do tatuador</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {invite.artist.name} vai criar a propria conta e entrar no painel.
        </p>

        <div className="mt-6 flex rounded-xl border border-white/10 bg-[#0f0f0f] p-1">
          <button
            className={[
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
              mode === "signup" ? "bg-[#E8650A] text-white" : "text-zinc-400",
            ].join(" ")}
            onClick={() => setMode("signup")}
            type="button"
          >
            Criar conta
          </button>
          <button
            className={[
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
              mode === "signin" ? "bg-[#E8650A] text-white" : "text-zinc-400",
            ].join(" ")}
            onClick={() => setMode("signin")}
            type="button"
          >
            Entrar
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium">Email do convite</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#E8650A]"
              readOnly
              value={email}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Senha</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#E8650A]"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Confirmar senha</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#E8650A]"
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              value={confirmPassword}
            />
          </div>

          {error ? <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
          {message ? <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</p> : null}

          {inviteExpired ? (
            <p className="rounded-xl bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
              Seu convite expirou. Peça um novo link ao gestor.
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting || inviteExpired}
            type="submit"
          >
            {submitting ? "Processando..." : mode === "signup" ? "Criar conta e ativar" : "Entrar e vincular"}
          </button>
        </form>
      </section>
    </main>
  );
}
