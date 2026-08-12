import { useState } from "react";
import "../styles/adminLogin.css";

const AUTH_API_BASE = import.meta.env.VITE_API_URL || "/api";

const getCookie = (name) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!cookieValue) return "";
  return decodeURIComponent(cookieValue.split("=").slice(1).join("="));
};

const EyeIcon = ({ crossed = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {crossed ? <path d="M4 20 20 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : null}
  </svg>
);

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const authHeaders = () => {
    const csrf = getCookie("csrf_token");
    return {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión");

      if (data.csrfToken) {
        window.sessionStorage.setItem("csrf_token", data.csrfToken);
      }
      if (document.cookie.includes("admin_token=")) {
        const adminToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("admin_token="));
        if (adminToken) {
          window.sessionStorage.setItem("admin_token", decodeURIComponent(adminToken.split("=").slice(1).join("=")));
        }
      }

      window.location.assign("/admin/dashboard");
      return;
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2 className="admin-login-title">Acceso de administrador</h2>
        <p className="admin-login-subtitle">Introduce tus credenciales para entrar al panel.</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="Email"
            required
          />
          <div className="admin-login-password-row">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Contraseña"
              required
            />
            <button
              type="button"
              className="admin-login-visibility"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              <EyeIcon crossed={showPassword} />
            </button>
          </div>
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" disabled={loading} className="admin-login-submit">
            {loading ? "Accediendo..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
