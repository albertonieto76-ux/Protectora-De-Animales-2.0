import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { getAdopciones, updateAdopcionStatus, deleteAdopcion } from "../../api.js";
import "../styles/adminPages.css";

const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const DATE_LABEL = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const DATETIME_LABEL = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const pad = (value: number) => value.toString().padStart(2, "0");

const toDateKey = (value: string | Date) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getCalendarStart = (date: Date) => {
  const start = getMonthStart(date);
  const day = start.getDay();
  const offset = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - offset);
  return start;
};

const buildCalendarDays = (monthCursor: Date) => {
  const start = getCalendarStart(monthCursor);
  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return {
      date: current,
      key: toDateKey(current),
      isCurrentMonth: current.getMonth() === monthCursor.getMonth(),
    };
  });
};

const sortAdoptionsByCreatedAt = (items: any[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const AdminAdoptions = () => {
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedAdoptionId, setSelectedAdoptionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthCursor, setMonthCursor] = useState(getMonthStart(new Date()));
  const detailPanelRef = useRef<HTMLDivElement | null>(null);

  const loadAdoptions = () => {
    getAdopciones()
      .then((data) => {
        setAdoptions(data);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn("No se pudieron cargar solicitudes de adopción:", err);
        setAdoptions([]);
        setLoadError("No se pudieron cargar las solicitudes de adopción.");
      });
  };

  useEffect(() => {
    loadAdoptions();
  }, []);

  useEffect(() => {
    if (!adoptions.length) {
      setSelectedAdoptionId(null);
      return;
    }

    const selectedExists = adoptions.some((item) => item.id === selectedAdoptionId);
    if (!selectedExists) {
      setSelectedAdoptionId(adoptions[0].id);
    }
  }, [adoptions, selectedAdoptionId]);

  const selectedAdoption = adoptions.find((item) => item.id === selectedAdoptionId) || null;
  const sortedAdoptions = sortAdoptionsByCreatedAt(adoptions);
  const selectedDateKey = toDateKey(selectedDate);
  const selectedDateAdoptions = sortAdoptionsByCreatedAt(
    adoptions.filter((item) => toDateKey(item.createdAt) === selectedDateKey),
  );
  const adoptionForActions = selectedAdoption || selectedDateAdoptions[0] || null;
  const calendarDays = buildCalendarDays(monthCursor);

  const openAdoption = (item: any) => {
    const createdAt = new Date(item.createdAt);
    setSelectedAdoptionId(item.id);
    setSelectedDate(createdAt);
    setMonthCursor(getMonthStart(createdAt));
    requestAnimationFrame(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
    const dayAdoptions = sortAdoptionsByCreatedAt(adoptions.filter((item) => toDateKey(item.createdAt) === toDateKey(date)));
    if (dayAdoptions.length > 0) {
      setSelectedAdoptionId(dayAdoptions[0].id);
      return;
    }

    setSelectedAdoptionId(null);
  };

  const handleStatusChange = async (newStatus: string, id?: number) => {
    const targetId = id || adoptionForActions?.id;
    if (!targetId) {
      return;
    }

    try {
      await updateAdopcionStatus(targetId, newStatus);
      setActionError(null);
      loadAdoptions();
    } catch (err) {
      setActionError("Error al actualizar el estado de la solicitud.");
    }
  };

  const handleDelete = async (id?: number) => {
    const targetId = id || adoptionForActions?.id;
    if (!targetId) {
      return;
    }

    if (confirm("¿Estás seguro de eliminar esta solicitud?")) {
      try {
        await deleteAdopcion(targetId);
        setActionError(null);
        loadAdoptions();
      } catch (err) {
        setActionError("Error al eliminar la solicitud.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">❤️ Solicitudes de Adopción</h1>
        </div>

        {loadError ? <AdminStateNotice message={loadError} variant="warning" compact /> : null}
        {actionError ? <AdminStateNotice message={actionError} variant="warning" compact /> : null}

        <div className="volunteer-scheduler-grid">
          <section className="admin-table-card volunteer-calendar-panel">
            <div className="calendar-toolbar">
              <div>
                <p className="calendar-overline">Calendario mensual</p>
                <h2 className="calendar-title">{MONTH_LABEL.format(monthCursor)}</h2>
              </div>
              <div className="calendar-nav-actions">
                <button
                  className="admin-btn-secondary"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                  type="button"
                >
                  Mes anterior
                </button>
                <button
                  className="admin-btn-secondary"
                  onClick={() => setMonthCursor(getMonthStart(new Date()))}
                  type="button"
                >
                  Hoy
                </button>
                <button
                  className="admin-btn-secondary"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                  type="button"
                >
                  Mes siguiente
                </button>
              </div>
            </div>

            <div className="calendar-grid-wrapper">
              <div className="calendar-grid calendar-grid-head">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
              </div>

              <div className="calendar-grid calendar-grid-body">
                {calendarDays.map((day) => {
                  const dayRequests = adoptions.filter((item) => toDateKey(item.createdAt) === day.key);
                  const pendingCount = dayRequests.filter((item) => item.estado === "pendiente").length;
                  const approvedCount = dayRequests.filter((item) => item.estado === "aprobado").length;
                  const rejectedCount = dayRequests.filter((item) => item.estado === "rechazado").length;
                  const isSelected = day.key === selectedDateKey;

                  return (
                    <button
                      key={day.key}
                      type="button"
                      className={[
                        "calendar-day-cell",
                        day.isCurrentMonth ? "" : "calendar-day-outside",
                        dayRequests.length > 0 ? "calendar-day-confirmed" : "",
                        isSelected ? "calendar-day-selected" : "",
                      ].join(" ").trim()}
                      onClick={() => handleDateSelection(day.date)}
                    >
                      <span className="calendar-day-number">{day.date.getDate()}</span>
                      <span className="calendar-day-meta">
                        {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? "s" : ""}` : "Sin pendientes"}
                      </span>
                      {dayRequests.length > 0 ? (
                        <div className="adoption-day-status-strip">
                          <span className="adoption-day-status pending">P {pendingCount}</span>
                          <span className="adoption-day-status approved">A {approvedCount}</span>
                          <span className="adoption-day-status rejected">R {rejectedCount}</span>
                        </div>
                      ) : null}
                      {dayRequests.length > 0 && (
                        <span className="calendar-day-total">
                          {dayRequests.length} solicitud{dayRequests.length > 1 ? "es" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="volunteer-editor-panel" ref={detailPanelRef}>
              <div className="editor-header-row">
                <div>
                  <p className="calendar-overline">Detalle del día</p>
                  <h3 className="editor-title">{DATE_LABEL.format(selectedDate)}</h3>
                </div>
                <div className="editor-action-group">
                  <button
                    type="button"
                    className="admin-btn-primary"
                    disabled={!adoptionForActions || adoptionForActions.estado === "aprobado"}
                    onClick={() => handleStatusChange("aprobado")}
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    disabled={!adoptionForActions || adoptionForActions.estado === "rechazado"}
                    onClick={() => handleStatusChange("rechazado")}
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    disabled={!adoptionForActions}
                    onClick={() => handleDelete()}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {selectedDateAdoptions.length > 0 ? (
                <div className="daily-appointments-list">
                  {selectedDateAdoptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`daily-appointment-chip ${selectedAdoptionId === item.id ? "active" : ""}`}
                      onClick={() => openAdoption(item)}
                    >
                      <span>#{item.id}</span>
                      <strong>{item.nombre}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <AdminStateNotice message="No hay solicitudes en este día." variant="empty" compact />
              )}

              {adoptionForActions ? (
                <div className="form-card volunteer-appointment-form">
                  <h3>Solicitud seleccionada</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Solicitante</label>
                      <div>{adoptionForActions.nombre}</div>
                    </div>
                    <div className="form-group">
                      <label>Animal</label>
                      <div>Animal #{adoptionForActions.animalId}</div>
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <div>
                        <span className={`badge badge-${adoptionForActions.estado}`}>
                          {adoptionForActions.estado}
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Fecha de solicitud</label>
                      <div>{DATETIME_LABEL.format(new Date(adoptionForActions.createdAt))}</div>
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <div>{adoptionForActions.email}</div>
                    </div>
                    <div className="form-group">
                      <label>Telefono</label>
                      <div>{adoptionForActions.telefono || "Sin telefono"}</div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label>Mensaje</label>
                    <textarea rows={3} value={adoptionForActions.mensaje || "Sin mensaje"} readOnly />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="admin-table-card volunteer-list-panel">
            <div className="list-panel-header">
              <div>
                <p className="calendar-overline">Listado lateral</p>
                <h2 className="calendar-title">Todas las solicitudes</h2>
              </div>
              <span className="list-counter">{adoptions.length}</span>
            </div>

            {sortedAdoptions.length === 0 ? (
              <AdminStateNotice message="No hay solicitudes de adopcion registradas." variant="empty" />
            ) : (
              <div className="appointment-list-scroll">
                {sortedAdoptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`appointment-list-item ${selectedAdoptionId === item.id ? "active" : ""}`}
                    onClick={() => openAdoption(item)}
                  >
                    <div className="appointment-list-main">
                      <strong>{item.nombre}</strong>
                      <span>Animal #{item.animalId}</span>
                    </div>
                    <div className="appointment-list-meta">
                      <span>{DATETIME_LABEL.format(new Date(item.createdAt))}</span>
                      <span className={`badge badge-${item.estado}`}>{item.estado}</span>
                    </div>
                    <p>{item.email}</p>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
};
