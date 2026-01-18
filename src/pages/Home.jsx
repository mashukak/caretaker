import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="page">
      <h2 className="page-title">Willkommen, {user.fullName} 👋</h2>
      <p className="muted">
        Was möchtest du heute machen?
      </p>

      <div className="grid2">
        <button className="tile tile-purple" onClick={() => navigate("/create-job")}>
          <div className="tile-top">
            <span className="tile-icon">📝</span>
            <h3>Job erstellen</h3>
          </div>
          <p>Erstelle eine Anzeige (Hund, Haushalt, Betreuung …)</p>
        </button>

        <button className="tile tile-green" onClick={() => navigate("/jobs")}>
          <div className="tile-top">
            <span className="tile-icon">🗺️</span>
            <h3>Jobs finden</h3>
          </div>
          <p>Suche Jobs in deiner Nähe (Filter + Karte)</p>
        </button>
      </div>
    </section>
  );
}

export default Home;
