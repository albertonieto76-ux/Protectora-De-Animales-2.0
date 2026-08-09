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

export const Navbar = () => {
  const navigate = useNavigate();

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute(
      "data-theme",
      current === "dark" ? "light" : "dark"
    );
  };

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
      navigate("/admin/login");
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.left} />

      <div className={styles.right}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          ⎋ Cerrar sesión
        </button>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          🌓
        </button>
      </div>
    </header>
  );
};


