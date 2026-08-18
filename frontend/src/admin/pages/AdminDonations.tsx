import { useEffect, useRef, useState, type FormEvent } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { getDonaciones, getPaymentTypes, createPaymentType, updatePaymentType, deletePaymentType } from "../../api.js";
import "../styles/adminPages.css";

const DONATION_TYPE_LABELS: Record<string, string> = {
  puntual: "Aporte puntual",
  veterinaria: "Veterinaria",
  alimentacion: "Alimentación",
};

const getDonationTypeLabel = (value?: string | null) => {
  if (!value) return "Sin tipo registrado";
  return DONATION_TYPE_LABELS[value] || value;
};

export const AdminDonations = () => {
  const [donaciones, setDonaciones] = useState<any[]>([]);
  const [donorSearch, setDonorSearch] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [paymentTypeForm, setPaymentTypeForm] = useState({ tipo: "", label: "", account: "" });
  const [selectedPaymentType, setSelectedPaymentType] = useState<any>(null);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<{ account?: string; server?: string }>({});
  const selectionPanelRef = useRef<HTMLDivElement | null>(null);

  const validateAccountClient = (tipo: string, account: string) => {
    const a = (account || "").trim();
    if (!a) return ""; // empty is allowed (optional field)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ibanEsRe = /^ES\d{22}$/i;
    const phoneRe = /^\+?\d{6,15}$/;
    const lowerTipo = (tipo || "").toLowerCase();

    if (lowerTipo.includes("paypal")) {
      return emailRe.test(a) ? "" : "Formato de correo inválido para PayPal.";
    }
    if (lowerTipo.includes("iban") || lowerTipo.includes("es") || lowerTipo.includes("cuenta")) {
      return ibanEsRe.test(a) ? "" : "IBAN español inválido (ej: ES1234567890123456789012).";
    }
    if (lowerTipo.includes("bizum") || lowerTipo.includes("phone") || lowerTipo.includes("movil") || lowerTipo.includes("telefono")) {
      return phoneRe.test(a) ? "" : "Número de teléfono inválido (ej: +34612345678).";
    }

    // Fallback: accept common formats or require minimal length
    if (emailRe.test(a) || ibanEsRe.test(a) || phoneRe.test(a) || a.length >= 5) return "";
    return "Formato de cuenta inválido.";
  };

  const cargarDonaciones = async () => {
    try {
      const data = await getDonaciones();
      setDonaciones(data);
      setLoadError(null);
    } catch (err) {
      console.warn("No se pudieron cargar donaciones:", err);
      setDonaciones([]);
      setLoadError("No se pudieron cargar las donaciones.");
    }
  };

  const cargarPaymentTypes = async () => {
    try {
      const data = await getPaymentTypes();
      setPaymentTypes(data);
    } catch (err) {
      console.warn("No se pudieron cargar los tipos de pago:", err);
      setPaymentTypes([]);
    }
  };

  useEffect(() => {
    cargarDonaciones();
    cargarPaymentTypes();
  }, []);

  useEffect(() => {
    if (!paymentTypes.length) {
      setSelectedPaymentTypeId(null);
      return;
    }

    const exists = paymentTypes.some((item) => item.id === selectedPaymentTypeId);
    if (!exists) {
      setSelectedPaymentTypeId(paymentTypes[0].id);
    }
  }, [paymentTypes, selectedPaymentTypeId]);

  const handlePaymentTypeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation mirroring backend rules
    setFormErrors({});
    const err = validateAccountClient(paymentTypeForm.tipo, paymentTypeForm.account || "");
    if (err) {
      setFormErrors({ account: err });
      return;
    }

    try {
      if (selectedPaymentType) {
        await updatePaymentType(selectedPaymentType.id, paymentTypeForm);
      } else {
        await createPaymentType(paymentTypeForm);
      }
      setPaymentTypeForm({ tipo: "", label: "", account: "" });
      setSelectedPaymentType(null);
      await cargarPaymentTypes();
      await cargarDonaciones();
    } catch (error: any) {
      console.error("Error guardando tipo de pago:", error);
      const message = error?.response?.data?.message || error?.message || "Error al guardar";
      setFormErrors({ server: String(message) });
    }
  };

  const handleEditPaymentType = (type: any) => {
    setSelectedPaymentType(type);
    setSelectedPaymentTypeId(type.id);
    setPaymentTypeForm({ tipo: type.tipo, label: type.label, account: type.account || "" });
    requestAnimationFrame(() => {
      selectionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSelectPaymentType = (typeId: number) => {
    setSelectedPaymentTypeId(typeId);
    requestAnimationFrame(() => {
      selectionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const resetPaymentTypeForm = () => {
    setSelectedPaymentType(null);
    setPaymentTypeForm({ tipo: "", label: "", account: "" });
    setFormErrors({});
  };

  const handleDeletePaymentType = async (id: number) => {
    try {
      await deletePaymentType(id);
      await cargarPaymentTypes();
      await cargarDonaciones();
    } catch (error) {
      console.error("Error eliminando tipo de pago:", error);
    }
  };

  const normalizedDonorSearch = donorSearch.trim().toLocaleLowerCase("es-ES");
  const filteredDonations = donaciones.filter((item) => {
    const donorMatches = !normalizedDonorSearch
      || String(item.nombre || "Anónimo").toLocaleLowerCase("es-ES").includes(normalizedDonorSearch)
      || String(item.email || "").toLocaleLowerCase("es-ES").includes(normalizedDonorSearch);
    return donorMatches;
  });
  const totalRecaudado = filteredDonations.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
  const selectedPaymentTypeItem = paymentTypes.find((item) => item.id === selectedPaymentTypeId) || null;

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">💳 Registro de Donaciones</h1>
            <p style={{ color: "#64748b", margin: "0.25rem 0 0 0" }}>
              Total recaudado: <strong data-testid="donation-total" style={{ color: "#10b981", fontSize: "1.1rem" }}>{totalRecaudado.toFixed(2)} €</strong>
            </p>
            <div className="donation-search-filters" role="search" aria-label="Buscar donaciones por donante">
              <div className="form-group">
                <label htmlFor="donation-donor-search">Buscar por donante</label>
                <input
                  id="donation-donor-search"
                  type="search"
                  placeholder="Nombre o email"
                  value={donorSearch}
                  onChange={(event) => setDonorSearch(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={!donorSearch}
                onClick={() => setDonorSearch("")}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {loadError ? <AdminStateNotice message={loadError} variant="warning" compact /> : null}

        <div className="admin-table-card" style={{ marginBottom: "1.5rem" }}>
          {filteredDonations.length === 0 ? (
            <AdminStateNotice
              message={donaciones.length === 0 ? "No hay registros de donaciones." : "No hay donaciones que coincidan con la búsqueda."}
              variant="empty"
            />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donante</th>
                  <th>Email</th>
                  <th>Importe (€)</th>
                  <th>Tipo de donación</th>
                  <th>Método</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nombre || "Anónimo"}</strong></td>
                    <td>{item.email || "-"}</td>
                    <td><span style={{ fontWeight: 700, color: "#059669" }}>+{item.cantidad} €</span></td>
                    <td><span className="badge" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>{getDonationTypeLabel(item.tipoDonacion)}</span></td>
                    <td><span className="badge" style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}>{item.metodo?.label || item.metodo || "-"}</span></td>
                    <td>{new Date(item.createdAt || Date.now()).toLocaleDateString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-table-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Tipos de pago</h2>
            <span style={{ color: "#475569" }}>{paymentTypes.length} métodos configurados</span>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <form onSubmit={handlePaymentTypeSubmit} className="form-card" style={{ padding: "1rem" }}>
              <h3 style={{ marginTop: 0 }}>{selectedPaymentType ? "Editar tipo de pago" : "Nuevo tipo de pago"}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Clave interna</label>
                  <input
                    value={paymentTypeForm.tipo}
                    onChange={(e) => setPaymentTypeForm({ ...paymentTypeForm, tipo: e.target.value })}
                    placeholder="p.ej. tarjeta_credito"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Etiqueta visible</label>
                  <input
                    value={paymentTypeForm.label}
                    onChange={(e) => setPaymentTypeForm({ ...paymentTypeForm, label: e.target.value })}
                    placeholder="p.ej. Tarjeta de crédito"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cuenta o PayPal</label>
                  <input
                    value={paymentTypeForm.account}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPaymentTypeForm({ ...paymentTypeForm, account: val });
                      const err = validateAccountClient(paymentTypeForm.tipo, val || "");
                      setFormErrors((prev) => ({ ...prev, account: err }));
                    }}
                    placeholder="p.ej. paypal@protectora.com o ES1234567890123456789012"
                  />
                  {formErrors.account && <div style={{ color: "#b91c1c", marginTop: "0.4rem" }}>{formErrors.account}</div>}
                  {formErrors.server && <div style={{ color: "#b91c1c", marginTop: "0.4rem" }}>{formErrors.server}</div>}
                </div>
              </div>
              <button type="submit" className="admin-btn-primary" disabled={Boolean(formErrors.account)}>
                {selectedPaymentType ? "Actualizar tipo" : "Crear tipo"}
              </button>
              {selectedPaymentType && (
                <button
                  type="button"
                  className="admin-btn-danger"
                  style={{ marginLeft: "1rem" }}
                  onClick={() => {
                    setSelectedPaymentType(null);
                    setPaymentTypeForm({ tipo: "", label: "" });
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </form>

            <div className="admin-table-card" style={{ padding: "1rem" }}>
              {paymentTypes.length === 0 ? (
                <AdminStateNotice message="No hay tipos de pago configurados." variant="empty" />
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Clave</th>
                      <th>Etiqueta</th>
                      <th>Cuenta/PayPal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentTypes.map((type) => (
                        <tr
                          key={type.id}
                          className={selectedPaymentTypeId === type.id ? "admin-row-selected" : ""}
                          onClick={() => handleSelectPaymentType(type.id)}
                          style={{ cursor: "pointer" }}
                        >
                        <td>{type.tipo}</td>
                        <td>{type.label}</td>
                        <td>{type.account || "-"}</td>
                        <td>
                            <button
                              className="admin-btn-primary"
                              style={{ marginRight: "0.5rem" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPaymentType(type);
                              }}
                            >
                            Editar
                          </button>
                            <button
                              className="admin-btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePaymentType(type.id);
                              }}
                            >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

                {selectedPaymentTypeItem ? (
                  <div className="admin-selection-panel" style={{ marginTop: "1rem" }} ref={selectionPanelRef}>
                    <div className="admin-selection-title">
                      Seleccionado: <strong>{selectedPaymentTypeItem.label}</strong>
                    </div>
                    <div className="admin-selection-actions">
                      <button type="button" className="admin-btn-secondary" onClick={resetPaymentTypeForm}>
                        Nuevo
                      </button>
                      <button type="button" className="admin-btn-primary" onClick={() => handleEditPaymentType(selectedPaymentTypeItem)}>
                        Modificar
                      </button>
                      <button type="button" className="admin-btn-danger" onClick={() => handleDeletePaymentType(selectedPaymentTypeItem.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : null}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
