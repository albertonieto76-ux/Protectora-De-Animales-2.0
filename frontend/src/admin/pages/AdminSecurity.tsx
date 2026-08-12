import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { getSecurityAuditLogs } from "../../api.js";
import dashboardStyles from "./dashboard.module.css";

type AuditItem = {
  id: number;
  createdAt: string;
  action: string;
  success: boolean;
  email?: string | null;
  method?: string | null;
  path?: string | null;
  reason?: string | null;
  ip?: string | null;
};

export const AdminSecurity = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const logsData = await getSecurityAuditLogs(150);
      setLogs(logsData.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "No se pudo cargar la seguridad admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const availableActions = Array.from(new Set(logs.map((item) => item.action))).sort();

  const filteredLogs = logs.filter((item) => {
    if (actionFilter !== "all" && item.action !== actionFilter) {
      return false;
    }

    if (resultFilter === "ok" && !item.success) {
      return false;
    }

    if (resultFilter === "ko" && item.success) {
      return false;
    }

    const itemDate = new Date(item.createdAt);
    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      if (itemDate < from) {
        return false;
      }
    }

    if (toDate) {
      const to = new Date(`${toDate}T23:59:59.999`);
      if (itemDate > to) {
        return false;
      }
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className={dashboardStyles.dashboardShell}>
        <section className={dashboardStyles.hero}>
          <p className={dashboardStyles.kicker}>Seguridad</p>
          <h1 className={dashboardStyles.title}>Centro de Seguridad Admin</h1>
          <p className={dashboardStyles.subtitle}>Revisa la auditoría reciente.</p>
        </section>

        {loading ? <AdminStateNotice message="Cargando seguridad..." variant="loading" compact /> : null}
        {error ? <AdminStateNotice message={error} variant="warning" compact /> : null}

        <section className={dashboardStyles.block}>
          <div className={dashboardStyles.blockHeader}>Logs de Auditoría</div>
          <div className={dashboardStyles.mfaControls} style={{ marginBottom: "1rem" }}>
            <select className={dashboardStyles.mfaInput} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">Todas las acciones</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <select className={dashboardStyles.mfaInput} value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
              <option value="all">Todos los resultados</option>
              <option value="ok">Solo OK</option>
              <option value="ko">Solo KO</option>
            </select>
            <input className={dashboardStyles.mfaInput} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <input className={dashboardStyles.mfaInput} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Acción</th>
                  <th>Resultado</th>
                  <th>Email</th>
                  <th>Método</th>
                  <th>Ruta</th>
                  <th>IP</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.action}</td>
                    <td>{item.success ? "OK" : "KO"}</td>
                    <td>{item.email || "-"}</td>
                    <td>{item.method || "-"}</td>
                    <td>{item.path || "-"}</td>
                    <td>{item.ip || "-"}</td>
                    <td>{item.reason || "-"}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "1rem" }}>
                      No hay logs que coincidan con los filtros actuales.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};
