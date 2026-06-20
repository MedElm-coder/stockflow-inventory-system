import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">StockFlow</div>

        <nav>
          {isAdmin && (
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
          )}
          <NavLink to="/pos" className="nav-link">
            New Sale
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
          <NavLink to="/sales" className="nav-link">
            Sales
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            Signed in as
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}