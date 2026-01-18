import { useEffect, useState } from "react";
import { useAuth } from "../store/AuthContext";
import { getBookedJobsForUser, subscribeJobs } from "../store/jobsStore";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [booked, setBooked] = useState(() => getBookedJobsForUser(user.id));

  useEffect(() => {
    return subscribeJobs(() => {
      setBooked(getBookedJobsForUser(user.id));
    });
  }, [user.id]);

  return (
    <section className="page">
      <h2 className="page-title">Profil</h2>

      <div className="profile-grid">
        <div className="card">
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Alter:</strong> {user.age}</p>
          <p><strong>E-Mail:</strong> {user.email}</p>

          <p><strong>Beschreibung:</strong></p>
          <p className="muted">{user.description || "Keine Beschreibung"}</p>

          <p><strong>Bewertung:</strong> ⭐⭐⭐⭐⭐ (Demo)</p>

          <button
            className="btn-secondary"
            style={{ marginTop: 12 }}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>

        <div className="card">
          <h3>Meine Buchungen</h3>

          {booked.length === 0 ? (
            <p className="muted">Noch keine Buchungen.</p>
          ) : (
            booked.map((j) => (
              <div key={j.id} className="mini-job">
                <div><strong>{j.title}</strong></div>
                <div className="muted">
                  📅 {j.booking?.date || j.date} • ⏰ {j.booking?.from || j.timeFrom}–{j.booking?.to || j.timeTo}
                </div>
                <div className="muted">📍 {j.address}</div>

                <button className="btn-primary" onClick={() => navigate(`/job/${j.id}`)}>
                  Zum Chat
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Profile;
