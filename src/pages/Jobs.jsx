import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { subscribeJobs, getJobs } from "../store/jobsStore";
import { useNavigate } from "react-router-dom";

const CAT = {
  animals: { icon: "🐕", label: "Tiere" },
  elderly: { icon: "👵", label: "Senioren" },
  kids: { icon: "👶", label: "Kinder" },
};

const CENTER = { lat: 54.298333, lng: 9.66 }; // біля Helene-Lange-Gymnasium :contentReference[oaicite:3]{index=3}

function Jobs() {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState(() => getJobs());

  useEffect(() => subscribeJobs(setAllJobs), []);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  // тільки open показуємо
  const filtered = useMemo(() => {
    return allJobs.filter((j) => {
      if (j.status !== "open") return false;

      const okText =
        !q.trim() ||
        j.title?.toLowerCase().includes(q.toLowerCase()) ||
        j.address?.toLowerCase().includes(q.toLowerCase());

      const okCat = category === "all" ? true : j.category === category;
      const okPrice = maxPrice ? j.pricePerHour <= Number(maxPrice) : true;

      return okText && okCat && okPrice;
    });
  }, [allJobs, q, category, maxPrice]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  return (
    <section className="page">
      <h2 className="page-title">Jobs finden</h2>
      <p className="muted"></p>

      <div className="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche (Titel oder Adresse)..."
        />

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
        {/* MAP (sticky) */}
        <div className="map-sticky">
          {!isLoaded ? (
            <div className="map-loading">
              Google Map lädt… (API Key nötig)
            </div>
          ) : (
            <GoogleMap
              center={CENTER}
              zoom={15}
              mapContainerClassName="gmap"
              options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
         
              <Marker position={CENTER} />

              {filtered.map((j) =>
                j.lat && j.lng ? (
                  <Marker
                    key={j.id}
                    position={{ lat: j.lat, lng: j.lng }}
                    label={CAT[j.category]?.icon || "📍"}
                    onClick={() => navigate(`/job/${j.id}`)}
                  />
                ) : null
              )}
            </GoogleMap>
          )}
        </div>

        {/* LIST (scroll) */}
        <div className="jobs-list-scroll">
          {filtered.length === 0 ? (
            <div className="empty">
              Keine Jobs gefunden. Ändere Filter oder erstelle einen Job.
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

                <button className="btn-primary" onClick={() => navigate(`/job/${j.id}`)}>
                  Anfragen / Buchen
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
