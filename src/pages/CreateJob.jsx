import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { createJob } from "../store/jobsStore";

const CATEGORIES = [
  { key: "animals", label: "Tiere (Hund etc.)", icon: "🐕" },
  { key: "elderly", label: "Seniorenbetreuung", icon: "👵" },
  { key: "cleaning", label: "Haushalt / Putzen", icon: "🧹" },
  { key: "kids", label: "Kinderbetreuung", icon: "👶" },
  { key: "other", label: "Sonstiges", icon: "✨" },
];

function CreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState("animals");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");

    if (!title.trim()) return setError("Bitte Titel eingeben.");
    if (!description.trim()) return setError("Bitte Beschreibung eingeben.");
    if (!address.trim()) return setError("Bitte Adresse eingeben.");
    if (!date) return setError("Bitte Datum auswählen.");
    if (!timeFrom || !timeTo) return setError("Bitte Uhrzeit (von/bis) auswählen.");
    if (!pricePerHour || Number(pricePerHour) <= 0) return setError("Bitte gültigen Preis eingeben.");

    createJob({
      ownerId: user.id,
      ownerName: user.fullName,
      category,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      date,
      timeFrom,
      timeTo,
      pricePerHour: Number(pricePerHour),
      currency: "EUR",

      // DEMO: “координати” для псевдо-мапи (рандом, щоб точки розкидало)
      demoX: Math.floor(Math.random() * 100),
      demoY: Math.floor(Math.random() * 100),
    });

    navigate("/jobs", { replace: true });
  };

  return (
    <section className="page">
      <h2 className="page-title">Job erstellen</h2>
      <p className="muted">Erstelle eine Anzeige.</p>

      <div className="form">
        <label>Kategorie</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>

        <label>Titel</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Hund ausführen (30 Min)" />

        <label>Beschreibung</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Was genau muss gemacht werden?" />

        <label>Adresse (genau)</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Straße, Hausnummer, PLZ, Stadt" />

        <div className="grid3">
          <div>
            <label>Datum</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Von</label>
            <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
          </div>
          <div>
            <label>Bis</label>
            <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
          </div>
        </div>

        <label>Preis pro Stunde (€)</label>
        <input
          type="number"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          placeholder="z.B. 12"
        />

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate("/home")}>Abbrechen</button>
          <button className="btn-primary" onClick={submit}>Job veröffentlichen</button>
        </div>
      </div>
    </section>
  );
}

export default CreateJob;
