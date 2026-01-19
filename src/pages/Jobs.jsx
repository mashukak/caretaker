import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";

const CAT = {
  animals: { icon: "🐕", label: "Tiere" },
  elderly: { icon: "👵", label: "Senioren" },
  kids: { icon: "👶", label: "Kinder" },
};

const CENTER = { lat: 54.298333, lng: 9.66 };

function emojiIcon(emoji) {
  return L.divIcon({
    className: "emoji-marker",
    html: `<div class="emoji-marker__inner">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  const loadJobs = async () => {
    setError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    setAllJobs(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filtered = useMemo(() => {
    return (allJobs || []).filter((j) => {
      const okText =
        !q.trim() ||
        (j.title || "").toLowerCase().includes(q.toLowerCase()) ||
        (j.address_text || "").toLowerCase().includes(q.toLowerCase());

      const okCat = category === "all" ? true : j.category === category;
      const okPrice = maxPrice ? Number(j.price_per_hour) <= Number(maxPrice) : true;

      return okText && okCat && okPrice;
    });
  }, [allJobs, q, category, maxPrice]);

  const bookJob = async (job) => {
    setError("");
    if (!user) return navigate("/auth");

    if (job.owner_id === user.id) {
      return setError("Du kannst deine eigene Anzeige nicht buchen.");
    }

    setBusyId(job.id);
    try {
      // 1) створюємо booking
      const { error: bErr } = await supabase.from("bookings").insert({
        job_id: job.id,
        client_id: user.id,
        status: "booked",
      });
      if (bErr) throw bErr;

      // 2) міняємо статус job -> booked (щоб зник з пошуку)
      const { error: jErr } = await supabase
        .from("jobs")
        .update({ status: "booked" })
        .eq("id", job.id);

      if (jErr) throw jErr;

      // 3) перезавантажуємо jobs
      await loadJobs();

      // 4) (пізніше) тут створимо чат автоматично
      alert("Gebucht! Du findest es jetzt in deinem Profil unter 'Meine Buchungen'.");
      navigate("/profile");
    } catch (e) {
      setError(e.message || "Buchung fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page">
      <h2 className="page-title">Jobs finden</h2>
      {error && <p className="error">{error}</p>}

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

        <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max €/h" />
      </div>

      <div className="jobs-layout">
        {/* MAP */}
        <div className="map-sticky">
          <div className="leaflet-wrap">
            <MapContainer center={[CENTER.lat, CENTER.lng]} zoom={15} className="leaflet-map" scrollWheelZoom>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={[CENTER.lat, CENTER.lng]} icon={emojiIcon("🏫")}>
                <Popup>Helene-Lange-Gymnasium (Demo Standort)</Popup>
              </Marker>

              {filtered.map((j) =>
                j.lat && j.lng ? (
                  <Marker
                    key={j.id}
                    position={[j.lat, j.lng]}
                    icon={emojiIcon(CAT[j.category]?.icon || "📍")}
                  >
                    <Popup>
                      <div style={{ display: "grid", gap: 6 }}>
                        <strong>
                          {CAT[j.category]?.icon} {j.title}
                        </strong>
                        <span>{j.price_per_hour} € / h</span>
                        <button className="btn-primary" onClick={() => navigate(`/jobs/${j.id}`)}>
  Öffnen
</button>

                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </div>

        {/* LIST */}
        <div className="jobs-list-scroll">
          {loading ? (
            <div className="empty">Laden...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">Keine offenen Jobs gefunden.</div>
          ) : (
            filtered.map((j) => (
              <div key={j.id} className="job-card">
                <div className="job-head">
                  <div className="job-title">
                    <span className="job-icon">{CAT[j.category]?.icon ?? "✨"}</span>
                    <strong>{j.title}</strong>
                  </div>
                  <div className="job-price">{j.price_per_hour} € / h</div>
                </div>

                <div className="job-meta">
                  <span>📅 {j.date}</span>
                  <span>⏰ {j.time_from}–{j.time_to}</span>
                </div>

                <div className="job-address">📍 {j.address_text}</div>
                <p className="job-desc">{j.description}</p>

                <button className="btn-primary" onClick={() => navigate(`/jobs/${j.id}`)}>
  Anfragen
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
