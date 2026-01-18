import { useMemo, useState } from "react";
import { getJobs } from "../store/jobsStore";

const CAT = {
  animals: { icon: "🐕", label: "Tiere" },
  elderly: { icon: "👵", label: "Senioren" },
  cleaning: { icon: "🧹", label: "Haushalt" },
  kids: { icon: "👶", label: "Kinder" },
  other: { icon: "✨", label: "Sonstiges" },
};

function Jobs() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  const jobs = getJobs();

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const okText =
        !q.trim() ||
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        j.address.toLowerCase().includes(q.toLowerCase());

      const okCat = category === "all" ? true : j.category === category;

      const okPrice = maxPrice ? j.pricePerHour <= Number(maxPrice) : true;

      return okText && okCat && okPrice && j.status === "open";
    });
  }, [jobs, q, category, maxPrice]);

  return (
    <section className="page">
      <h2 className="page-title">Jobs finden</h2>
      <p className="muted">Demo-Karte + Filter. (Später: echte Google Maps)</p>

      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche (Titel oder Adresse)..." />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Alle Kategorien</option>
          {Object.entries(CAT).map(([key, v]) => (
            <option key={key} value={key}>
              {v.icon} {v.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max €/h"
        />
      </div>

      <div className="jobs-layout">
        {/* Map placeholder */}
        <div className="map">
          <div className="map-top">
            <span className="dot online" />
            <span>Dein Standort (Demo)</span>
          </div>

          {filtered.slice(0, 20).map((j) => (
            <div
              key={j.id}
              className="pin"
              style={{ left: `${j.demoX}%`, top: `${j.demoY}%` }}
              title={`${CAT[j.category]?.icon ?? "📍"} ${j.title}`}
            >
              {CAT[j.category]?.icon ?? "📍"}
            </div>
          ))}
        </div>

        {/* List */}
        <div className="jobs-list">
          {filtered.length === 0 ? (
            <div className="empty">
              Keine Jobs gefunden. Erstelle eine neue Anzeige oder ändere Filter.
            </div>
          ) : (
            filtered.map((j) => (
              <div key={j.id} className="job-card">
                <div className="job-head">
                  <div className="job-title">
                    <span className="job-icon">{CAT[j.category]?.icon ?? "✨"}</span>
                    <strong>{j.title}</strong>
                  </div>
                  <div className="job-price">{j.pricePerHour} € / h</div>
                </div>

                <div className="job-meta">
                  <span>📅 {j.date}</span>
                  <span>⏰ {j.timeFrom}–{j.timeTo}</span>
                </div>

                <div className="job-address">📍 {j.address}</div>
                <p className="job-desc">{j.description}</p>

                <button
                  className="btn-primary"
                  onClick={() => alert("Nächster Schritt: Chat + Buchung (kommt als nächstes)")}
                >
                  Anfragen / Chat starten
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Jobs;
