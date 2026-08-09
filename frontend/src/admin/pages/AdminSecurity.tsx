import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import {
  disableAdminMfa,
  enableAdminMfa,
  getSecurityAuditLogs,
  regenerateAdminRecoveryCodes,
  setupAdminMfa,
} from "../../api.js";
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
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [recoveryRemaining, setRecoveryRemaining] = useState(0);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaOtpAuthUrl, setMfaOtpAuthUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [actionFilter, setActionFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [logsData, me] = await Promise.all([
        getSecurityAuditLogs(150),
        fetch(`${import.meta.env.VITE_API_URL || "/api"}/auth/me`, { credentials: "include" }).then((res) => res.json()),
      ]);
      setLogs(logsData.items || []);
      setMfaEnabled(Boolean(me?.mfaEnabled));
      setRecoveryRemaining(Number(me?.recoveryCodesRemaining || 0));
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

  const wrapAction = async (action: () => Promise<any>) => {
    setError(null);
    setMessage(null);
    try {
      const data = await action();
      await load();
      return data;
    } catch (err: any) {
      setError(err.message || "Operación no disponible");
      return null;
    }
  };

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(successMessage);
    } catch {
      setError("No se pudo copiar al portapapeles");
    }
  };

  const downloadTextFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`Archivo ${fileName} descargado.`);
  };

  const formatRecoveryCodes = (codes: string[]) => codes.join("\n");

  const startSetup = async () => {
    const data = await wrapAction(() => setupAdminMfa());
    if (data) {
      setMfaSecret(data.secret || "");
      setMfaOtpAuthUrl(data.otpauthUrl || "");
      setSecretVisible(false);
      setMessage("Secreto MFA generado. Confirma con un código para activarlo.");
    }
  };

  const activateMfa = async () => {
    const data = await wrapAction(() => enableAdminMfa(mfaCode));
    if (data) {
      setRecoveryCodes(data.recoveryCodes || []);
      setMfaSecret("");
      setMfaOtpAuthUrl("");
      setSecretVisible(false);
      setMfaCode("");
      setMessage("MFA activado. Guarda los recovery codes en un lugar seguro.");
    }
  };

  const deactivateMfa = async () => {
    const data = await wrapAction(() => disableAdminMfa(mfaCode));
    if (data) {
      setRecoveryCodes([]);
      setMfaCode("");
      setMessage("MFA desactivado.");
    }
  };

  const refreshRecoveryCodes = async () => {
    const data = await wrapAction(() => regenerateAdminRecoveryCodes(mfaCode));
    if (data) {
      setRecoveryCodes(data.recoveryCodes || []);
      setMfaCode("");
      setMessage("Recovery codes regenerados. Los anteriores ya no sirven.");
    }
  };

  return (
    <AdminLayout>
      <div className={dashboardStyles.dashboardShell}>
        <section className={dashboardStyles.hero}>
          <p className={dashboardStyles.kicker}>Seguridad</p>
          <h1 className={dashboardStyles.title}>Centro de Seguridad Admin</h1>
          <p className={dashboardStyles.subtitle}>Gestiona MFA, recovery codes y revisa la auditoría reciente.</p>
        </section>

        {loading ? <AdminStateNotice message="Cargando seguridad..." variant="loading" compact /> : null}
        {error ? <AdminStateNotice message={error} variant="warning" compact /> : null}

        <section className={dashboardStyles.block}>
          <div className={dashboardStyles.blockHeader}>MFA y Recovery Codes</div>
          <div className={dashboardStyles.securityPanel}>
            <p className={dashboardStyles.securityText}>
              MFA: <strong>{mfaEnabled ? "Activo" : "No activo"}</strong> · Recovery codes restantes: <strong>{recoveryRemaining}</strong>
            </p>
            {!mfaEnabled ? (
              <button type="button" className={dashboardStyles.actionButton} onClick={startSetup}>Configurar MFA</button>
            ) : null}
            {mfaSecret ? (
              <div className={dashboardStyles.mfaBox}>
                <p className={dashboardStyles.securityWarning}>
                  Material sensible temporal. Guárdalo solo en tu autenticador antes de cerrar este bloque.
                </p>
                <p><strong>Secreto:</strong> {secretVisible ? mfaSecret : "••••••••••••••••••••••••••"}</p>
                <p className={dashboardStyles.mfaUrl}><strong>OTPAuth:</strong> {secretVisible ? mfaOtpAuthUrl : "Oculto hasta mostrar"}</p>
                <div className={dashboardStyles.mfaControls}>
                  <button type="button" className={dashboardStyles.actionButton} onClick={() => setSecretVisible((current) => !current)}>
                    {secretVisible ? "Ocultar secreto" : "Mostrar secreto"}
                  </button>
                  <button type="button" className={dashboardStyles.actionButton} onClick={() => copyText(mfaSecret, "Secreto MFA copiado.")}>Copiar secreto</button>
                  <button type="button" className={dashboardStyles.actionButton} onClick={() => copyText(mfaOtpAuthUrl, "OTPAuth copiado.")}>Copiar OTPAuth</button>
                </div>
              </div>
            ) : null}
            {(mfaSecret || mfaEnabled) ? (
              <div className={dashboardStyles.mfaControls}>
                <input
                  className={dashboardStyles.mfaInput}
                  type="text"
                  inputMode="numeric"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Código MFA de 6 dígitos"
                />
                {!mfaEnabled ? (
                  <button type="button" className={dashboardStyles.actionButton} onClick={activateMfa}>Activar MFA</button>
                ) : (
                  <>
                    <button type="button" className={dashboardStyles.actionButton} onClick={refreshRecoveryCodes}>Regenerar recovery codes</button>
                    <button type="button" className={dashboardStyles.actionButton} onClick={deactivateMfa}>Desactivar MFA</button>
                  </>
                )}
              </div>
            ) : null}
            {recoveryCodes.length > 0 ? (
              <div className={dashboardStyles.mfaBox}>
                <p className={dashboardStyles.securityWarning}>
                  Estos recovery codes solo se muestran ahora. Guárdalos fuera del navegador.
                </p>
                <p><strong>Recovery codes:</strong></p>
                <ul>
                  {recoveryCodes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className={dashboardStyles.mfaControls}>
                  <button
                    type="button"
                    className={dashboardStyles.actionButton}
                    onClick={() => copyText(formatRecoveryCodes(recoveryCodes), "Recovery codes copiados.")}
                  >
                    Copiar recovery codes
                  </button>
                  <button
                    type="button"
                    className={dashboardStyles.actionButton}
                    onClick={() => downloadTextFile("protectora-recovery-codes.txt", formatRecoveryCodes(recoveryCodes))}
                  >
                    Descargar recovery codes
                  </button>
                  <button
                    type="button"
                    className={dashboardStyles.actionButton}
                    onClick={() => setRecoveryCodes([])}
                  >
                    Ocultar recovery codes
                  </button>
                </div>
              </div>
            ) : null}
            {message ? <p className={dashboardStyles.securitySuccess}>{message}</p> : null}
          </div>
        </section>

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
