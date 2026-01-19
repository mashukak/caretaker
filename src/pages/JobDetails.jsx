import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";
import { getOrCreateChatForBooking } from "../store/chatApi"; 

const CAT = {
  animals: { icon: "🐕", label: "Tiere" },
  elderly: { icon: "👵", label: "Senioren" },
  kids: { icon: "👶", label: "Kinder" },
};

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [owner, setOwner] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");

      const { data, error: e } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (e) return setError(e.message);
      setJob(data);

      // owner profile (optional)
      const { data: p, error: ep } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, rating_avg, rating_count")
        .eq("id", data.owner_id)
        .single();

      if (!ep) setOwner(p);
    };

    load();
  }, [id]);

 const bookNow = async () => {
  setError("");
  if (!user) return navigate("/auth");
  if (!job) return;

  if (job.status !== "open") return setError("Dieser Job ist nicht mehr verfügbar.");
  if (job.owner_id === user.id) return setError("Du kannst deine eigene Anzeige nicht buchen.");

  setBusy(true);
  try {
    // 1) перевіряємо чи booking вже існує
    const { data: existing, error: eCheck } = await supabase
      .from("bookings")
      .select("id,status")
      .eq("job_id", job.id)
      .maybeSingle();

    if (eCheck) throw eCheck;

    if (existing) {
      // якщо вже існує — просто повідомляємо і не робимо insert
      return setError("Dieser Job wurde bereits gebucht.");
    }

    // 2) створюємо booking
   const { data: bookingRow, error: bErr } = await supabase
  .from("bookings")
  .insert({
    job_id: job.id,
    client_id: user.id,
    status: "booked",
  })
  .select("id")
  .single();

if (bErr) throw bErr;


    // 3) оновлюємо job статус
    const { error: jErr } = await supabase
      .from("jobs")
      .update({ status: "booked" })
      .eq("id", job.id);

    if (jErr) throw jErr;

    alert("Gebucht! Du findest es im Profil unter 'Meine Buchungen'.");
    navigate("/profile", { replace: true });
    const chatId = await getOrCreateChatForBooking({ bookingId: bookingRow.id });
navigate(`/chats/${chatId}`, { replace: true });


navigate(`/chats/${chatId}`, { replace: true });

  } catch (e) {
    // якщо все одно прилетить уникальна помилка — покажемо нормальний текст
    const msg = e?.message || "Buchung fehlgeschlagen.";
    if (msg.includes("bookings_job_id_key")) {
      setError("Dieser Job wurde bereits gebucht.");
    } else {
      setError(msg);
    }
  } finally {
    setBusy(false);
  }
};


  if (!job) {
    return (
      <section className="page">
        <h2 className="page-title">Job Details</h2>
        {error ? <p className="error">{error}</p> : <p className="muted">Laden...</p>}
      </section>
    );
  }

  const cat = CAT[job.category];

  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 className="page-title">Job Details</h2>
        <button className="btn-secondary" onClick={() => navigate("/jobs")}>
          Zurück
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="job-details-grid">
        {/* LEFT */}
        <div className="card">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>{cat?.icon || "✨"}</div>
            <div>
              <h3 style={{ margin: 0 }}>{job.title}</h3>
              <div className="muted">{cat?.label}</div>
            </div>
            <div style={{ marginLeft: "auto", fontWeight: 900 }}>
              {job.price_per_hour} € / h
            </div>
          </div>

          <hr style={{ margin: "14px 0" }} />

          <p><strong>Adresse:</strong> {job.address_text}</p>
          <p><strong>Datum:</strong> {job.date}</p>
          <p><strong>Zeit:</strong> {job.time_from} – {job.time_to}</p>

          <p style={{ marginTop: 10 }}><strong>Beschreibung:</strong></p>
          <p className="muted">{job.description}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn-primary" onClick={bookNow} disabled={busy || job.status !== "open"}>
              {job.status !== "open" ? "Nicht verfügbar" : busy ? "..." : "Buchen"}
            </button>

            <button
              className="btn-secondary"
              onClick={() => alert("Chat kommt als nächstes (wir bauen ihn danach)")}
            >
              Chat starten
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
  Hinweis: Für das Schulprojekt ist das eine Demo. Später Verifizierung, Support und sichere Zahlung.
</p>

        </div>
        


        {/* RIGHT */}
        <div className="card">
          <h3>Ersteller</h3>

          {owner ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="avatar" style={{ width: 44, height: 44 }}>
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt="owner" />
                ) : (
                  <span className="avatar-fallback">{(owner.full_name || "U").slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 900 }}>{owner.full_name || "User"}</div>
                <div className="muted">
                  ⭐ {owner.rating_avg ?? 0} ({owner.rating_count ?? 0})
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">Laden...</p>
          )}

          <hr style={{ margin: "14px 0" }} />
        </div>
      </div>
    </section>
  );
}

export default JobDetails;
