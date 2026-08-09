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

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const endpoint = mfaRequired ? `${AUTH_API_BASE}/auth/mfa/verify` : `${AUTH_API_BASE}/auth/login`;
      const body = mfaRequired
        ? (useRecoveryCode ? { recoveryCode: mfaCode } : { code: mfaCode })
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión");

      if (data.mfaRequired) {
        setMfaRequired(true);
        setMfaCode("");
        setUseRecoveryCode(false);
        return;
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
        <p className="admin-login-subtitle">
          {mfaRequired
            ? useRecoveryCode
              ? "Introduce uno de tus recovery codes para continuar."
              : "Introduce el código MFA de 6 dígitos para continuar."
            : "Introduce tus credenciales para entrar al panel."}
        </p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          {!mfaRequired ? (
            <>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
            </>
          ) : (
            <input
              type="text"
              inputMode={useRecoveryCode ? "text" : "numeric"}
              pattern={useRecoveryCode ? undefined : "[0-9]{6}"}
              value={mfaCode}
              onChange={(e) =>
                setMfaCode(
                  useRecoveryCode
                    ? e.target.value.toUpperCase().replace(/\s+/g, "").slice(0, 16)
                    : e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder={useRecoveryCode ? "Recovery code" : "Código MFA (6 dígitos)"}
              required
            />
          )}
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" disabled={loading} className="admin-login-submit">
            {loading ? "Accediendo..." : mfaRequired ? "Verificar MFA" : "Entrar"}
          </button>
          {mfaRequired ? (
            <>
              <button
                type="button"
                className="admin-login-submit"
                onClick={() => {
                  setUseRecoveryCode((current) => !current);
                  setMfaCode("");
                  setError("");
                }}
              >
                {useRecoveryCode ? "Usar código MFA" : "Usar recovery code"}
              </button>
              <button
                type="button"
                className="admin-login-submit"
                onClick={() => {
                  setMfaRequired(false);
                  setUseRecoveryCode(false);
                  setMfaCode("");
                  setError("");
                }}
              >
                Volver
              </button>
            </>
          ) : null}
        </form>
      </div>
    </div>
  );
}
