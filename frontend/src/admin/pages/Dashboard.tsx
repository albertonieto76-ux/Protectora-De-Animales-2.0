import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { StatCard } from "../components/StatCard";
import { QuickList } from "../components/QuickList";
import { disableAdminMfa, enableAdminMfa, getAdminDashboard, setupAdminMfa } from "../../api.js";
import styles from "./dashboard.module.css";

const emptyDashboardStats = {
  totalAnimals: 0,
  totalAdoptions: 0,
  pendingAdoptions: 0,
  totalVolunteers: 0,
  upcomingEvents: 0,
  totalDonations: 0,
  totalDonationsAmount: 0,
  latestAnimals: [],
  latestAdoptions: [],
};

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(emptyDashboardStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaOtpAuthUrl, setMfaOtpAuthUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);

  const quickActions = [
    { label: "Gestionar animales", to: "/admin/animals" },
    { label: "Revisar adopciones", to: "/admin/adoptions" },
    { label: "Planificar voluntarios", to: "/admin/volunteers" },
    { label: "Gestionar eventos", to: "/admin/events" },
    { label: "Ver donaciones", to: "/admin/donations" },
  ];

  useEffect(() => {
    Promise.all([
      getAdminDashboard(),
      fetch(`${import.meta.env.VITE_API_URL || "/api"}/auth/me`, { credentials: "include" }).then((res) => res.json()).catch(() => null),
    ])
      .then(([data, me]) => {
        setError(null);
        setStats(data);
        setMfaEnabled(Boolean(me?.mfaEnabled));
        setLoading(false);
      })
      .catch((err) => {
        console.warn("No se pudo obtener estadísticas en vivo de la API:", err);
        setError("No se pudieron cargar las estadísticas del dashboard.");
        setStats(emptyDashboardStats);
        setLoading(false);
      });
  }, []);

  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    setMfaError(null);
    setMfaMessage(null);
    try {
      const data = await setupAdminMfa();
      setMfaSecret(data.secret || "");
      setMfaOtpAuthUrl(data.otpauthUrl || "");
      setMfaMessage("Secreto MFA generado. Añádelo a tu app autenticadora y confirma con un código.");
    } catch (err: any) {
      setMfaError(err.message || "No se pudo iniciar MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnableMfa = async () => {
    setMfaLoading(true);
    setMfaError(null);
    setMfaMessage(null);
    try {
      await enableAdminMfa(mfaCode);
      setMfaEnabled(true);
      setMfaSecret("");
      setMfaOtpAuthUrl("");
      setMfaCode("");
      setMfaMessage("MFA activado correctamente.");
    } catch (err: any) {
      setMfaError(err.message || "No se pudo activar MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setMfaLoading(true);
    setMfaError(null);
    setMfaMessage(null);
    try {
      await disableAdminMfa(mfaCode);
      setMfaEnabled(false);
      setMfaSecret("");
      setMfaOtpAuthUrl("");
      setMfaCode("");
      setMfaMessage("MFA desactivado correctamente.");
    } catch (err: any) {
      setMfaError(err.message || "No se pudo desactivar MFA");
    } finally {
      setMfaLoading(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className={styles.loadingWrap}>
        <AdminStateNotice message="Cargando dashboard..." variant="loading" compact />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className={styles.dashboardShell}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Panel de control</p>
          <h1 className={styles.title}>Dashboard de Administración</h1>
          <p className={styles.subtitle}>
            Vista general de actividad con accesos directos para la operativa diaria.
          </p>
        </section>

        <section className={styles.actions}>
          <div className={styles.blockHeader}>Accesos rápidos</div>
          <div className={styles.actionsGrid}>
            {quickActions.map((action) => (
              <NavLink key={action.to} to={action.to} className={styles.actionButton}>
                {action.label}
              </NavLink>
            ))}
          </div>
        </section>

        {error ? <AdminStateNotice message={error} variant="warning" compact /> : null}

        <section className={styles.block}>
          <div className={styles.blockHeader}>Resumen numérico</div>
          <div className={styles.statsGrid}>
            <StatCard title="Animales" value={stats.totalAnimals} />
            <StatCard title="Solicitudes" value={stats.totalAdoptions} />
            <StatCard title="Pendientes" value={stats.pendingAdoptions} />
            <StatCard title="Voluntarios" value={stats.totalVolunteers} />
            <StatCard title="Donaciones" value={stats.totalDonations} />
            <StatCard title="Total (€)" value={`${stats.totalDonationsAmount} €`} />
            <StatCard title="Eventos" value={stats.upcomingEvents} />
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.blockHeader}>Actividad reciente</div>
          <div className={styles.sections}>
            <QuickList
              title="Últimos animales"
              items={stats.latestAnimals || []}
              renderItem={(a: any) => `${a.name || a.nombre} (${a.species || a.especie || 'Animal'})`}
              emptyMessage="Todavía no hay animales recientes para mostrar."
            />

            <QuickList
              title="Últimas solicitudes"
              items={stats.latestAdoptions || []}
              renderItem={(s: any) => `${s.nombre} → Animal #${s.animalId}`}
              emptyMessage="Todavía no hay solicitudes recientes para mostrar."
            />
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.blockHeader}>Seguridad Admin</div>
          <div className={styles.securityPanel}>
            <p className={styles.securityText}>
              Estado MFA: <strong>{mfaEnabled ? "Activo" : "No activo"}</strong>
            </p>
            {!mfaEnabled ? (
              <button type="button" className={styles.actionButton} onClick={handleStartMfaSetup}>
                {mfaLoading ? "Preparando..." : "Configurar MFA"}
              </button>
            ) : null}
            {mfaSecret ? (
              <div className={styles.mfaBox}>
                <p><strong>Secreto:</strong> {mfaSecret}</p>
                <p className={styles.mfaUrl}><strong>OTPAuth:</strong> {mfaOtpAuthUrl}</p>
              </div>
            ) : null}
            {(mfaSecret || mfaEnabled) ? (
              <div className={styles.mfaControls}>
                <input
                  className={styles.mfaInput}
                  type="text"
                  inputMode="numeric"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Código MFA de 6 dígitos"
                />
                {!mfaEnabled ? (
                  <button type="button" className={styles.actionButton} onClick={handleEnableMfa}>
                    {mfaLoading ? "Activando..." : "Activar MFA"}
                  </button>
                ) : (
                  <button type="button" className={styles.actionButton} onClick={handleDisableMfa}>
                    {mfaLoading ? "Desactivando..." : "Desactivar MFA"}
                  </button>
                )}
              </div>
            ) : null}
            {mfaMessage ? <p className={styles.securitySuccess}>{mfaMessage}</p> : null}
            {mfaError ? <p className={styles.securityError}>{mfaError}</p> : null}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};
