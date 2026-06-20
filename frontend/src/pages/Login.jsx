import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      // Route by role: admins → dashboard, cashiers → sales
      navigate(user.role === "admin" ? "/dashboard" : "/sales");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>StockFlow</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="admin@stockflow.test"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="••••••••"
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <div className="login-hint">
          Demo accounts:<br />
          admin@stockflow.test / password123<br />
          cashier@stockflow.test / password123
        </div>
      </div>
    </div>
  );
}