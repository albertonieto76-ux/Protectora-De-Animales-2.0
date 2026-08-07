import { useNavigate } from "react-router-dom";
import styles from "./navbar.module.css";

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
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
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


