import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function Header() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const displayName =
    profile?.full_name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src="/caretaker.jpg" alt="Caretaker" />
        <span>Caretaker</span>
      </Link>

      <nav className="nav-right">
        {user ? (
          <>
            <button className="user-pill" onClick={() => navigate("/profile")}>
              <span className="avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" />
                ) : (
                  <span className="avatar-fallback">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>

              <span className="user-name">{displayName}</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/auth">Login</Link>
            <Link to="/auth" className="btn">
              Registrieren
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
