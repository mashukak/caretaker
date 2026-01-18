import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src="./public/caretaker.jpg" alt="Caretaker" />
        <span>Caretaker</span>
      </Link>

      <nav>
        {user ? (
          <div className="nav-user">
            <span
  className="user-name"
  onClick={() => navigate("/profile")}
  style={{ cursor: "pointer" }}
>
  {user.fullName}
</span>

            <button className="linklike" onClick={handleLogout}>
              Logout
            </button>
          </div>
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
