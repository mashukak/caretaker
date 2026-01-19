import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";

const CENTER = { lat: 54.298333, lng: 9.66 };

function emojiIcon(emoji) {
  return L.divIcon({
    className: "emoji-marker",
    html: `<div class="emoji-marker__inner">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
}

function ClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { "Accept-Language": "de" } });
  const json = await res.json();
  return json?.display_name || "";
}

async function searchAddress(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "de" } });
  return await res.json();
}

function CreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [category, setCategory] = useState("animals");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("12");

  // ✅ date/time states
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeFrom, setTimeFrom] = useState("15:00");
  const [timeTo, setTimeTo] = useState("16:00");

  const [addressQuery, setAddressQuery] = useState("Helene-Lange-Gymnasium Rendsburg");
  const [addressText, setAddressText] = useState("Helene-Lange-Gymnasium, Ritterstraße 12, 24768 Rendsburg");

  const [pos, setPos] = useState({ lat: CENTER.lat, lng: CENTER.lng });
  const [results, setResults] = useState([]);

  const pickOnMap = async ({ lat, lng }) => {
    setPos({ lat, lng });
    try {
      const addr = await reverseGeocode(lat, lng);
      if (addr) setAddressText(addr);
    } catch {
      // ignore
    }
  };

  const onSearch = async () => {
    setError("");
    try {
      const r = await searchAddress(addressQuery);
      setResults(r || []);
      if (r?.[0]) {
        const lat = Number(r[0].lat);
        const lng = Number(r[0].lon);
        setPos({ lat, lng });
        setAddressText(r[0].display_name);
      }
    } catch {
      setError("Adresse nicht gefunden.");
    }
  };

  const submit = async () => {
    setError("");
    if (!user) return navigate("/auth");
    if (!title.trim()) return setError("Bitte Titel eingeben.");
    if (!description.trim()) return setError("Bitte Beschreibung eingeben.");
    if (timeTo <= timeFrom) return setError("Endzeit muss nach Startzeit sein.");

    setBusy(true);
    try {
      const { error: e } = await supabase.from("jobs").insert({
        owner_id: user.id,
        category,
        title,
        description,
        price_per_hour: Number(pricePerHour),
        address_text: addressText,
        lat: pos.lat,
        lng: pos.lng,
        date,
        time_from: timeFrom,
        time_to: timeTo,
        status: "open",
      });

      if (e) throw e;
      navigate("/jobs");
    } catch (err) {
      setError(err.message || "Job konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <h2 className="page-title">Job erstellen</h2>
      {error && <p className="error">{error}</p>}

      <div className="createjob-grid">
        <div className="card">
          <label>Kategorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="animals">🐕 Tiere</option>
            <option value="elderly">👵 Senioren</option>
            <option value="kids">👶 Kinder</option>
          </select>

          <label>Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Hund ausführen" />

          <label>Beschreibung</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Was genau soll gemacht werden?" />

          <label>Preis pro Stunde (€)</label>
          <input type="number" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Datum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label>Zeit</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
                <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mini-list" style={{ marginTop: 10 }}>
              {results.map((r) => (
                <div
                  key={r.place_id}
                  className="mini-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const lat = Number(r.lat);
                    const lng = Number(r.lon);
                    setPos({ lat, lng });
                    setAddressText(r.display_name);
                    setResults([]);
                  }}
                >
                  {r.display_name}
                </div>
              ))}
            </div>
          )}

          <label>Adresse</label>
          <input value={addressText} onChange={(e) => setAddressText(e.target.value)} />

          <p className="muted" style={{ marginTop: 10 }}>
            Tipp: Du kannst auch direkt auf die Karte klicken, um den Pin zu setzen.
          </p>

          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? "..." : "Erstellen"}
          </button>
        </div>

        <div className="leaflet-wrap" style={{ height: "520px" }}>
          <MapContainer center={[pos.lat, pos.lng]} zoom={15} className="leaflet-map" scrollWheelZoom>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickPicker onPick={pickOnMap} />
            <Marker position={[pos.lat, pos.lng]} icon={emojiIcon("📍")} />
          </MapContainer>
        </div>
      </div>
    </section>
  );
}

export default CreateJob;
