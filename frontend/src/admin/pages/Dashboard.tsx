import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { StatCard } from "../components/StatCard";
import { QuickList } from "../components/QuickList";
import { getAdminDashboard } from "../../api.js";
import styles from "./dashboard.module.css";

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboard()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("No se pudo obtener estadísticas en vivo de la API, usando datos demo:", err);
        // Fallback demo stats if backend isn't running yet
        setStats({
          totalAnimals: 14,
          totalAdoptions: 8,
          pendingAdoptions: 3,
          totalVolunteers: 12,
          upcomingEvents: 4,
          totalDonations: 25,
          totalDonationsAmount: 1850,
          latestAnimals: [
            { id: 1, name: "Max", species: "Perro" },
            { id: 2, name: "Luna", species: "Gato" },
            { id: 3, name: "Rocky", species: "Perro" },
          ],
          latestAdoptions: [
            { id: 1, nombre: "María García", animalId: 1 },
            { id: 2, nombre: "Juan Pérez", animalId: 2 },
          ],
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Cargando Dashboard...</h2>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <h1 className={styles.title}>Dashboard de Administración</h1>

      <div className={styles.statsGrid}>
        <StatCard title="Animales" value={stats.totalAnimals} />
        <StatCard title="Solicitudes" value={stats.totalAdoptions} />
        <StatCard title="Pendientes" value={stats.pendingAdoptions} />
        <StatCard title="Voluntarios" value={stats.totalVolunteers} />
        <StatCard title="Donaciones" value={stats.totalDonations} />
        <StatCard title="Total (€)" value={`${stats.totalDonationsAmount} €`} />
        <StatCard title="Eventos" value={stats.upcomingEvents} />
      </div>

      <div className={styles.sections}>
        <QuickList
          title="Últimos animales"
          items={stats.latestAnimals || []}
          renderItem={(a: any) => `${a.name || a.nombre} (${a.species || a.especie || 'Animal'})`}
        />

        <QuickList
          title="Últimas solicitudes"
          items={stats.latestAdoptions || []}
          renderItem={(s: any) => `${s.nombre} → Animal #${s.animalId}`}
        />
      </div>
    </AdminLayout>
  );
};
