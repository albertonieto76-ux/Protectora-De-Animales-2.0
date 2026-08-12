import { useNavigate } from "react-router-dom";
import styles from "./navbar.module.css";

const AUTH_API_BASE = import.meta.env.VITE_API_URL || "/api";

const getCookie = (name: string) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!cookieValue) return "";
  return decodeURIComponent(cookieValue.split("=").slice(1).join("="));
};

const clearBrowserCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
  document.cookie = `${name}=; Max-Age=0; path=/api`;
};

const LogoutGlyph = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <circle cx="22" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="M9 33c0-7.5 6-13.5 13.5-13.5S36 25.5 36 33v2H9Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <rect x="22" y="24" width="17" height="30" rx="2.8" fill="#88b7e6" stroke="currentColor" strokeWidth="2.2" />
    <path d="M37 39h17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M49 33l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCookie("csrf_token") || "",
        },
      });
    } catch (err) {
      console.warn("No se pudo cerrar la sesión", err);
    } finally {
      clearBrowserCookie("admin_token");
      clearBrowserCookie("csrf_token");
      window.sessionStorage.removeItem("admin_token");
      window.sessionStorage.removeItem("csrf_token");
      navigate("/admin/login");
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.left} />

      <div className={styles.right}>
        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogoutGlyph />
        </button>
      </div>
    </header>
  );
};


