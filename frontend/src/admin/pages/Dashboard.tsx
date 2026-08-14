import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { StatCard } from "../components/StatCard";
import { QuickList } from "../components/QuickList";
import { exportDatabaseBackup, getAdminDashboard, importDatabaseBackup } from "../../api.js";
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
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const quickActions = [
    { label: "Gestionar animales", to: "/admin/animals" },
    { label: "Revisar adopciones", to: "/admin/adoptions" },
    { label: "Planificar voluntarios", to: "/admin/volunteers" },
    { label: "Gestionar eventos", to: "/admin/events" },
    { label: "Ver donaciones", to: "/admin/donations" },
  ];

  const handleExportBackup = async () => {
    try {
      setBackupBusy(true);
      setBackupStatus("Exportando copia de seguridad...");
      await exportDatabaseBackup();
      setBackupStatus("Copia de seguridad descargada correctamente.");
    } catch (err) {
      console.error(err);
      setBackupStatus("No se pudo exportar la base de datos.");
    } finally {
      setBackupBusy(false);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "ADVERTENCIA: Importar un backup sobrescribirá los datos actuales de la base de datos. ¿Deseas continuar?"
    );

    if (!confirmed) {
      event.target.value = "";
      setBackupStatus("Importación cancelada.");
      return;
    }

    try {
      setBackupBusy(true);
      setBackupStatus("Importando copia de seguridad...");

      const fileName = file.name.toLowerCase();
      const isGzip = fileName.endsWith(".gz") || fileName.endsWith(".gzip") || fileName.endsWith(".json.gz");

      let rawText = "";
      if (isGzip) {
        if (typeof DecompressionStream === "undefined") {
          throw new Error("Tu navegador no soporta archivos gzip. Usa un JSON sin comprimir.");
        }

        const buffer = await file.arrayBuffer();
        const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
        rawText = await new Response(stream).text();
      } else {
        rawText = await file.text();
      }

      const parsed = JSON.parse(rawText);
      await importDatabaseBackup(parsed);
      setBackupStatus("Copia de seguridad importada correctamente.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err || "");
      const cleaned = message
        .replace(/^Error\s+\d+:\s*/, "")
        .replace(/No se pudo importar la copia de seguridad\.?/i, "No se pudo importar la copia de seguridad.")
        .trim();

      if (cleaned.includes("Token CSRF inválido")) {
        setBackupStatus("La sesión ha caducado. Vuelve a iniciar sesión e inténtalo de nuevo.");
      } else if (cleaned) {
        setBackupStatus(cleaned);
      } else {
        setBackupStatus("El archivo no es una copia de seguridad válida.");
      }
    } finally {
      setBackupBusy(false);
      event.target.value = "";
      setPendingImportFile(null);
    }
  };

  useEffect(() => {
    getAdminDashboard()
      .then((data) => {
        setError(null);
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("No se pudo obtener estadísticas en vivo de la API:", err);
        setError("No se pudieron cargar las estadísticas del dashboard.");
        setStats(emptyDashboardStats);
        setLoading(false);
      });
  }, []);

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

        <section className={styles.backupPanel}>
          <div className={styles.blockHeader}>Herramientas avanzadas</div>
          <div className={styles.backupBox}>
            <div className={styles.backupActions}>
              <button type="button" className={styles.backupButton} onClick={handleExportBackup} disabled={backupBusy}>
                {backupBusy ? "Procesando..." : "Exportar BBDD"}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()} disabled={backupBusy}>
                Importar BBDD
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.gz,.json.gz,application/json,application/gzip,application/x-gzip"
                onChange={handleImportBackup}
                hidden
              />
            </div>
            <p className={styles.backupWarning}>La importación sobrescribe la base de datos actual. Asegúrate de tener un backup previo. Si el JSON exportado supera un tamaño muy grande, puede no ser importable de nuevo desde el navegador.</p>
            {backupStatus ? <p className={styles.backupStatus}>{backupStatus}</p> : null}
          </div>
        </section>

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
      </div>
    </AdminLayout>
  );
};
