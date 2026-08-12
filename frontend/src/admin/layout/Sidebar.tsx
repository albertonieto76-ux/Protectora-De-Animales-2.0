import { NavLink } from "react-router-dom";
import styles from "./sidebar.module.css";

export const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <h2 className={styles.logo}>Protectora Admin</h2>
      </div>

      <nav className={styles.menu}>
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>📊</span>
          Admin
        </NavLink>

        <NavLink
          to="/admin/animals"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>🐾</span>
          Animales
        </NavLink>

        <NavLink
          to="/admin/adoptions"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>❤️</span>
          Adopciones
        </NavLink>

        <NavLink
          to="/admin/volunteers"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>🙋</span>
          Voluntarios
        </NavLink>

        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>📅</span>
          Eventos
        </NavLink>

        <NavLink
          to="/admin/donations"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>💳</span>
          Donaciones
        </NavLink>

        <NavLink
          to="/admin/security"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>🛡️</span>
          Seguridad
        </NavLink>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <NavLink to="/" className={styles.link}>
            <span className={styles.icon}>🏠</span>
            Volver a la Web
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};
