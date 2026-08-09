import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./sidebar.module.css";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.top}>
        <h2 className={styles.logo}>{collapsed ? "PA" : "Protectora Admin"}</h2>

        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      <nav className={styles.menu}>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>📊</span>
          {!collapsed && "Admin"}
        </NavLink>

        <NavLink
          to="/admin/animals"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>🐾</span>
          {!collapsed && "Animales"}
        </NavLink>

        <NavLink
          to="/admin/adoptions"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>❤️</span>
          {!collapsed && "Adopciones"}
        </NavLink>

        <NavLink
          to="/admin/volunteers"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>🙋</span>
          {!collapsed && "Voluntarios"}
        </NavLink>

        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>📅</span>
          {!collapsed && "Eventos"}
        </NavLink>

        <NavLink
          to="/admin/donations"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>💳</span>
          {!collapsed && "Donaciones"}
        </NavLink>

        <NavLink
          to="/admin/security"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          <span className={styles.icon}>🛡️</span>
          {!collapsed && "Seguridad"}
        </NavLink>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <NavLink to="/" className={styles.link}>
            <span className={styles.icon}>🏠</span>
            {!collapsed && "Volver a la Web"}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};
