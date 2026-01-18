import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { bookJob, getJobById } from "../store/jobsStore";
import { getChat, sendMessage } from "../store/chatStore";

const CAT = {
  animals: { icon: "🐕", label: "Tiere" },
  elderly: { icon: "👵", label: "Senioren" },
  cleaning: { icon: "🧹", label: "Haushalt" },
  kids: { icon: "👶", label: "Kinder" },
  other: { icon: "✨", label: "Sonstiges" },
};

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const job = getJobById(id);

  const isOwner = job?.ownerId === user.id;
  const canBook = job?.status === "open" && !isOwner;

  const [from, setFrom] = useState(job?.timeFrom || "");
  const [to, setTo] = useState(job?.timeTo || "");
  const [error, setError] = useState("");

  // chatId пов'язуємо з jobId
  const chatId = useMemo(() => (job ? `job_${job.id}` : null), [job]);
  const chat = chatId ? getChat(chatId) : { messages: [] };

  const [text, setText] = useState("");

  if (!job) {
    return (
      <section className="page">
        <h2 className="page-title">Job nicht gefunden</h2>
        <button className="btn-secondary" onClick={() => navigate("/jobs")}>
          Zurück
        </button>
      </section>
    );
  }

  const confirmBooking = () => {
    setError("");

    if (!from || !to) return setError("Bitte Uhrzeit auswählen.");
    if (from >= to) return setError("Ungültige Zeit (Von muss kleiner als Bis sein).");

    try {
      const updated = bookJob(job.id, {
        bookedById: user.id,
        bookedByName: user.fullName,
        booking: { date: job.date, from, to },
      });

      // перше системне повідомлення
      sendMessage(chatId, {
        fromId: "system",
        fromName: "System",
        text: `✅ Buchung bestätigt: ${updated.booking.date} ${updated.booking.from}–${updated.booking.to}`,
      });

      navigate(`/job/${job.id}`, { replace: true });
    } catch (e) {
      setError(e.message || "Buchung fehlgeschlagen.");
    }
  };

  const onSend = () => {
    if (!text.trim()) return;

    sendMessage(chatId, {
      fromId: user.id,
      fromName: user.fullName,
      text: text.trim(),
    });

    setText("");
    // перерендериться після navigate (простий спосіб без складного state)
    navigate(`/job/${job.id}`, { replace: true });
  };

  return (
    <section className="page">
      <button className="btn-secondary" onClick={() => navigate("/jobs")}>
        ← Zurück
      </button>

      <div className="details">
        <div className="details-card">
          <div className="details-title">
            <span className="job-icon-big">{CAT[job.category]?.icon ?? "✨"}</span>
            <div>
              <h2 className="page-title" style={{ marginBottom: 4 }}>{job.title}</h2>
              <div className="muted">
                Von <strong>{job.ownerName}</strong> • {job.pricePerHour} € / h
              </div>
            </div>
          </div>

          <div className="details-meta">
            <span>📅 {job.date}</span>
            <span>⏰ {job.timeFrom}–{job.timeTo}</span>
          </div>

          <div className="job-address">📍 {job.address}</div>
          <p className="job-desc">{job.description}</p>

          {job.status === "booked" && (
            <div className="badge">
              ✅ Gebucht von <strong>{job.bookedByName}</strong> ({job.booking?.from}–{job.booking?.to})
            </div>
          )}

          {canBook && (
            <div className="bookbox">
              <h3>Buchen</h3>
              <div className="grid3">
                <div>
                  <label>Datum</label>
                  <input type="text" value={job.date} readOnly />
                </div>
                <div>
                  <label>Von</label>
                  <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                  <label>Bis</label>
                  <input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>

              {error && <p className="error">{error}</p>}

              <button className="btn-primary" onClick={confirmBooking}>
                Buchung bestätigen
              </button>

              <p className="muted" style={{ marginTop: 10 }}>
                (Demo) Zahlung würde hier passieren. Plattformgebühr: 3%.
              </p>
            </div>
          )}
        </div>

        <div className="details-card">
          <h3>Chat</h3>

          {job.status === "open" && (
            <p className="muted">
              Chat ist verfügbar nach Buchung (Demo).
            </p>
          )}

          {job.status !== "open" && (
            <>
              <div className="chat">
                {chat.messages.length === 0 ? (
                  <div className="empty">Noch keine Nachrichten.</div>
                ) : (
                  chat.messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.fromId === user.id ? "msg me" : m.fromId === "system" ? "msg system" : "msg"
                      }
                    >
                      <div className="msg-name">{m.fromName}</div>
                      <div>{m.text}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="chat-input">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nachricht schreiben..."
                />
                <button className="btn-primary" onClick={onSend}>
                  Senden
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default JobDetails;
