import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const slogans = [
  "Hilfe, wenn du sie brauchst. Arbeit, wenn du willst.",
  "Wir verbinden Hilfe mit Menschen, die helfen.",
  "Hilfe in deiner Nähe. Einfach und zuverlässig.",
  "Lokale Hilfe. Echte Menschen. Echte Unterstützung.",
  "Weil Fürsorge gemeinsam besser ist 🦦",
];

function Landing() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const handleBegin = () => {
    if (user) navigate("/home");
    else navigate("/auth");
  };

  return (
    <section className="hero">
      <h1>{slogans[index]}</h1>
      <p>Hilfe beginnt in deiner Nähe.</p>

      <button className="cta" onClick={handleBegin}>
        Begin now
      </button>
    </section>
  );
}

export default Landing;
