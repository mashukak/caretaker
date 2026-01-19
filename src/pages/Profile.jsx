import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";

const CAT = {
  animals: { icon: "🐕", label: "Tiere" },
  elderly: { icon: "👵", label: "Senioren" },
  kids: { icon: "👶", label: "Kinder" },
};

function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, logout} = useAuth();

  const [myPostedJobs, setMyPostedJobs] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [busyAvatar, setBusyAvatar] = useState(false);
  const [error, setError] = useState("")

  const displayName =
    profile?.full_name?.trim() || (user?.email ? user.email.split("@")[0] : "User");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setError("");

      // 1) мої виставлені вакансії
      const { data: posted, error: e1 } = await supabase
        .from("jobs")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (e1) setError(e1.message);
      else setMyPostedJobs(posted ?? []);

      // 2) мої бронювання (мої роботи) + підтягуємо job через FK
      const { data: bookings, error: e2 } = await supabase
        .from("bookings")
        .select("id,status,created_at,job_id,jobs(*)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (e2) setError((prev) => prev || e2.message);
      else setMyBookings(bookings ?? []);
    };

    load();
  }, [user?.id]);

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError("");
    setBusyAvatar(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbErr) throw dbErr;

      await refreshProfile();
    } catch (err) {
      setError(err.message || "Avatar Upload fehlgeschlagen.");
    } finally {
      setBusyAvatar(false);
      e.target.value = "";
    }
  };

  const ratingText = useMemo(() => {
    const avg = profile?.rating_avg ?? 0;
    const cnt = profile?.rating_count ?? 0;
    return `⭐ ${avg} (${cnt})`;
  }, [profile?.rating_avg, profile?.rating_count]);

  if (loading) return <section className="page">Loading...</section>;
  if (!user) return <section className="page">Not logged in</section>;

  return (
    <section className="page">
      <div className="profile-topbar">
        <h2 className="page-title">Profil</h2>
        <button className="btn-secondary" onClick={() => navigate("/chats")}>
          Chats
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="profile-grid">
        {/* LEFT: profile card */}
        <div className="card profile-card">
          <div className="profile-head">
            <div className="profile-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" />
              ) : (
                <div className="profile-avatar-fallback">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="profile-name">{profile?.full_name || "—"}</div>
              <div className="muted">{user.email}</div>
              <div className="muted">{ratingText}</div>
            </div>
          </div>

          <div className="profile-fields">
            <div><strong>Alter:</strong> {profile?.age ?? "—"}</div>
            <div>
              <strong>Beschreibung:</strong>
              <div className="muted">{profile?.description || "Keine Beschreibung"}</div>
            </div>
          </div>

          <div className="profile-actions">
  <label className="btn-secondary" style={{ cursor: busyAvatar ? "not-allowed" : "pointer" }}>
    {busyAvatar ? "Upload..." : "Foto hochladen"}
    <input
      type="file"
      accept="image/*"
      onChange={onAvatarChange}
      disabled={busyAvatar}
      style={{ display: "none" }}
    />
  </label>

  <button
    className="btn-secondary"
    onClick={async () => {
      await logout();
      navigate("/", { replace: true });
    }}
  >
    Logout
  </button>
</div>

        </div>

        {/* RIGHT: two columns */}
        <div className="profile-columns">
          <div className="card">
            <h3>Meine Anzeigen</h3>

            {myPostedJobs.length === 0 ? (
              <p className="muted">Noch keine Jobs erstellt.</p>
            ) : (
              <div className="mini-list">
                {myPostedJobs.map((j) => (
                  <div key={j.id} className="mini-item">
                    <div className="mini-title">
                      <span>{CAT[j.category]?.icon || "✨"}</span>
                      <strong>{j.title}</strong>
                    </div>
                    <div className="muted">{j.price_per_hour} € / h • {j.status}</div>
                    <div className="muted">📍 {j.address_text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3>Meine Buchungen</h3>

            {myBookings.length === 0 ? (
              <p className="muted">Noch keine Jobs gebucht.</p>
            ) : (
              <div className="mini-list">
                {myBookings.map((b) => {
                  const j = b.jobs;
                  return (
                    <div key={b.id} className="mini-item">
                      <div className="mini-title">
                        <span>{CAT[j?.category]?.icon || "📌"}</span>
                        <strong>{j?.title || "Job"}</strong>
                      </div>
                      <div className="muted">{j?.price_per_hour} € / h • {b.status}</div>
                      <div className="muted">📍 {j?.address_text}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
