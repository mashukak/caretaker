import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";

function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // якщо вже залогінена — на home
  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  // register
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [description, setDescription] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
  setError("");
  setInfo("");

  if (!fullName.trim()) return setError("Bitte Namen eingeben.");
  if (!regEmail.trim()) return setError("Bitte E-Mail eingeben.");
  if (!age || Number(age) < 1) return setError("Bitte gültiges Alter eingeben.");
  if (!regPassword || regPassword.length < 6) return setError("Passwort min. 6 Zeichen.");
  if (regPassword !== regPassword2) return setError("Passwörter stimmen nicht.");

  setBusy(true);

  try {
    // 1) створюємо акаунт
    const { error: e1 } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });
    if (e1) return setError(e1.message);

    // 2) одразу логінимось (це дає auth.uid() для RLS)
    const { data: loginData, error: eLogin } = await supabase.auth.signInWithPassword({
      email: regEmail,
      password: regPassword,
    });
    if (eLogin) return setError(eLogin.message);

    const userId = loginData.user?.id;
    if (!userId) return setError("Kein User nach Login gefunden.");

    // 3) створюємо профіль (тепер RLS пропустить)
    const { error: e2 } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      age: Number(age),
      email: regEmail,
      description,
    });

    if (e2) return setError(e2.message);

    navigate("/home", { replace: true });
  } finally {
    setBusy(false);
  }
};

  const handleLogin = async () => {
    setError("");
    setInfo("");

    if (!loginEmail.trim()) return setError("Bitte E-Mail eingeben.");
    if (!loginPassword) return setError("Bitte Passwort eingeben.");

    setBusy(true);

    try {
      const { error: e } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (e) return setError(e.message);

      navigate("/home", { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <div className="card">
        <h2>Registrieren</h2>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Vorname Nachname"
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Alter"
        />
        <input
          type="email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          placeholder="E-Mail"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung (optional)"
        />

        <input
          type="password"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          placeholder="Passwort"
        />
        <input
          type="password"
          value={regPassword2}
          onChange={(e) => setRegPassword2(e.target.value)}
          placeholder="Passwort повторити"
        />

        <button onClick={handleRegister} disabled={busy}>
          {busy ? "Bitte warten..." : "Konto erstellen"}
        </button>

        {error && <p className="error">{error}</p>}
        {info && <p className="muted">{info}</p>}
      </div>

      <div className="card">
        <h2>Login</h2>

        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="E-Mail"
        />
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Passwort"
        />

        <button onClick={handleLogin} disabled={busy}>
          {busy ? "Bitte warten..." : "Einloggen"}
        </button>
      </div>
    </section>
  );
}

export default Auth;
