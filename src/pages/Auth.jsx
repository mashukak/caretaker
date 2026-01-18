import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, findUserByEmail } from "../store/authStore";
import { useAuth } from "../store/AuthContext";

function Auth() {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // <-- додали user

  // ✅ якщо вже в системі — не показуємо auth, одразу на /home
  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  // register fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [description, setDescription] = useState("");

  // login field
  const [loginEmail, setLoginEmail] = useState("");

  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");

    if (!fullName.trim()) return setError("Bitte Namen eingeben.");
    if (!regEmail.trim()) return setError("Bitte E-Mail eingeben.");
    if (!age || Number(age) < 16) return setError("Sie müssen 16 sein, um ein Konto zu erstellen.");

    try {
      const created = createUser({ fullName, age, email: regEmail, description });
      login(created);
      navigate("/home", { replace: true });
    } catch (e) {
      setError(e.message || "Registrierung fehlgeschlagen.");
    }
  };

  const handleLogin = () => {
    setError("");
    if (!loginEmail.trim()) return setError("Bitte E-Mail eingeben.");

    const found = findUserByEmail(loginEmail);
    if (!found) return setError("Kein Konto mit dieser E-Mail gefunden.");

    login(found);
    navigate("/home", { replace: true });
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

        <button onClick={handleRegister}>Konto erstellen</button>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Login</h2>

        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="E-Mail"
        />
        <button onClick={handleLogin}>Einloggen</button>
      </div>
    </section>
  );
}

export default Auth;
