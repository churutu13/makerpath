"use client";

import { Cloud, CloudOff, LoaderCircle, LogIn, LogOut, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useApp } from "@/lib/store";

const statusCopy = {
  unconfigured: "Cloud non configurato",
  local: "Salvataggio locale",
  loading: "Caricamento dal cloud",
  saving: "Sincronizzazione",
  synced: "Dati sincronizzati",
  error: "Errore di sincronizzazione",
} as const;

export function AccountCard() {
  const {
    user,
    authLoading,
    supabaseConfigured,
    syncStatus,
    syncError,
    signIn,
    signUp,
    signOut,
  } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const error = mode === "signin"
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage(mode === "signup"
      ? "Account creato. Se richiesto, conferma l’indirizzo dalla mail ricevuta."
      : "Accesso effettuato.");
    setPassword("");
  };

  const statusIcon = syncStatus === "error" || syncStatus === "unconfigured"
    ? <CloudOff size={18} />
    : syncStatus === "loading" || syncStatus === "saving"
      ? <LoaderCircle className="spin" size={18} />
      : <Cloud size={18} />;

  return (
    <section className="card">
      <div className="account-heading">
        <div>
          <p className="eyebrow">Account & cloud</p>
          <h2>{user ? "Il tuo account MakerPath" : "Porta i progressi con te"}</h2>
          <p className="muted account-copy">
            {user
              ? "Le modifiche vengono conservate sul dispositivo e sincronizzate con Supabase."
              : "Accedi per sincronizzare roadmap, progetti, risorse e progressi tra i tuoi dispositivi."}
          </p>
        </div>
        <span className={`sync-badge ${syncStatus === "error" ? "error" : ""}`}>
          {statusIcon}{statusCopy[syncStatus]}
        </span>
      </div>

      {!supabaseConfigured ? (
        <div className="cloud-notice">
          <CloudOff size={18} />
          <p>Il collegamento cloud è pronto nel codice. Mancano soltanto le chiavi del progetto Supabase.</p>
        </div>
      ) : user ? (
        <div className="account-session">
          <div className="account-user">
            <span className="account-avatar"><UserRound size={19} /></span>
            <div>
              <strong>{user.email}</strong>
              <p className="row-meta">Sessione protetta attiva</p>
            </div>
          </div>
          <button className="btn ghost" onClick={async () => {
            const error = await signOut();
            setMessage(error ?? "Disconnessione effettuata. I dati restano disponibili su questo dispositivo.");
          }}>
            <LogOut size={16} />Esci
          </button>
        </div>
      ) : (
        <form className="account-form" onSubmit={submit}>
          <label className="field-wrap">
            Email
            <input
              className="field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@email.it"
              required
            />
          </label>
          <label className="field-wrap">
            Password
            <input
              className="field"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 8 caratteri"
              required
            />
          </label>
          <div className="actions account-actions">
            <button className="btn primary" type="submit" disabled={authLoading}>
              {authLoading ? <LoaderCircle className="spin" size={16} /> : <LogIn size={16} />}
              {mode === "signin" ? "Accedi" : "Crea account"}
            </button>
            <button className="btn ghost" type="button" onClick={() => {
              setMode((current) => current === "signin" ? "signup" : "signin");
              setMessage("");
            }}>
              {mode === "signin" ? "Non hai un account?" : "Hai già un account?"}
            </button>
          </div>
        </form>
      )}

      {(message || syncError) && (
        <p className={`account-message ${syncError ? "error" : ""}`} role="status">
          {syncError || message}
        </p>
      )}
    </section>
  );
}
