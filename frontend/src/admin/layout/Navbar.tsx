import { useState } from "react";
import styles from "./navbar.module.css";

export const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute(
      "data-theme",
      current === "dark" ? "light" : "dark"
    );
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <h3 className={styles.title}>Panel Admin</h3>
      </div>

      <div className={styles.right}>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          🌓
        </button>

        <div className={styles.menuWrapper}>
          <button
            className={styles.menuBtn}
            onClick={() => setOpenMenu(!openMenu)}
          >
            ☰
          </button>

          {openMenu && (
            <div className={styles.dropdown}>
              <button>Perfil</button>
              <button>Configuración</button>
              <button>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


