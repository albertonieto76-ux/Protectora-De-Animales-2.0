import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import {
  createVolunteerAppointment,
  deleteVolunteerAppointment,
  deleteVoluntario,
  getVolunteerAppointments,
  getVoluntarios,
  updateVolunteerAppointment,
} from "../../api.js";
import "../styles/adminPages.css";

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const DATE_LABEL = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const TIME_LABEL = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_OPTIONS = [
  { value: "confirmada", label: "Confirmada" },
  { value: "pendiente", label: "Pendiente" },
  { value: "cancelada", label: "Cancelada" },
];

const pad = (value: number) => value.toString().padStart(2, "0");

const toDateKey = (value: string | Date) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toDateInputValue = (value: string | Date) => toDateKey(value);

const toTimeInputValue = (value: string | Date) => {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const combineDateTime = (date: string, time: string) => `${date}T${time}`;

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

const buildInitialForm = (volunteerId: number | null, date: Date) => ({
  voluntarioId: volunteerId ? String(volunteerId) : "",
  fecha: toDateInputValue(date),
  horaInicio: "09:00",
  horaFin: "11:00",
  estado: "confirmada",
  notas: "",
});

const sortAppointmentsByStart = (items: any[]) =>
  [...items].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

export const AdminVolunteers = () => {
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthCursor, setMonthCursor] = useState(getMonthStart(new Date()));
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState(() => buildInitialForm(null, new Date()));

  const loadVoluntarios = () => {
    getVoluntarios()
      .then((data) => {
        setVoluntarios(data);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn("No se pudieron cargar voluntarios:", err);
        setVoluntarios([]);
        setLoadError("No se pudieron cargar los voluntarios.");
      });
  };

  const loadAppointments = () => {
    getVolunteerAppointments()
      .then((data) => {
        setAppointments(data);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn("No se pudieron cargar citas de voluntariado:", err);
        setAppointments([]);
        setLoadError("No se pudieron cargar las citas de voluntariado.");
      });
  };

  useEffect(() => {
    loadVoluntarios();
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!voluntarios.length) {
      return;
    }

    setFormData((current) => {
      if (current.voluntarioId) {
        return current;
      }

      return {
        ...current,
        voluntarioId: String(voluntarios[0].id),
      };
    });
  }, [voluntarios]);

  useEffect(() => {
    if (!selectedAppointmentId) {
      return;
    }

    const appointmentExists = appointments.some((item) => item.id === selectedAppointmentId);
    if (!appointmentExists) {
      setSelectedAppointmentId(null);
      setFormMode("create");
      setFormData(buildInitialForm(voluntarios[0]?.id ?? null, selectedDate));
    }
  }, [appointments, selectedAppointmentId, selectedDate, voluntarios]);

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este voluntario?")) {
      try {
        await deleteVoluntario(id);
        setActionError(null);
        loadVoluntarios();
      } catch (err) {
        setActionError("Error al eliminar el voluntario.");
      }
    }
  };

  const selectedAppointment = appointments.find((item) => item.id === selectedAppointmentId) || null;
  const calendarDays = buildCalendarDays(monthCursor);
  const selectedDateKey = toDateKey(selectedDate);
  const selectedDateAppointments = sortAppointmentsByStart(
    appointments.filter((item) => toDateKey(item.inicio) === selectedDateKey),
  );
  const appointmentForActions = selectedAppointment || selectedDateAppointments[0] || null;

  const startCreateFlow = (date = selectedDate) => {
    setSelectedDate(date);
    setMonthCursor(getMonthStart(date));
    setSelectedAppointmentId(null);
    setFormMode("create");
    setFormData(buildInitialForm(voluntarios[0]?.id ?? null, date));
  };

  const openAppointment = (appointment: any) => {
    const appointmentDate = new Date(appointment.inicio);
    setSelectedAppointmentId(appointment.id);
    setSelectedDate(appointmentDate);
    setMonthCursor(getMonthStart(appointmentDate));
    setFormMode("edit");
    setFormData({
      voluntarioId: String(appointment.voluntarioId),
      fecha: toDateInputValue(appointment.inicio),
      horaInicio: toTimeInputValue(appointment.inicio),
      horaFin: toTimeInputValue(appointment.fin),
      estado: appointment.estado || "confirmada",
      notas: appointment.notas || "",
    });
    requestAnimationFrame(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);

    const dayAppointments = sortAppointmentsByStart(
      appointments.filter((item) => toDateKey(item.inicio) === toDateKey(date)),
    );

    if (dayAppointments.length > 0) {
      openAppointment(dayAppointments[0]);
      return;
    }

    setSelectedAppointmentId(null);
    setFormMode("create");
    setFormData((current) => ({
      ...current,
      fecha: toDateInputValue(date),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        voluntarioId: Number(formData.voluntarioId),
        inicio: combineDateTime(formData.fecha, formData.horaInicio),
        fin: combineDateTime(formData.fecha, formData.horaFin),
        estado: formData.estado,
        notas: formData.notas,
      };

      let savedAppointment: any;

      if (formMode === "edit" && selectedAppointmentId) {
        savedAppointment = await updateVolunteerAppointment(selectedAppointmentId, payload);
      } else {
        savedAppointment = await createVolunteerAppointment(payload);
      }

      const refreshedAppointments = await getVolunteerAppointments();
      setAppointments(refreshedAppointments);
      setLoadError(null);
      setActionError(null);

      if (savedAppointment?.id) {
        const target = refreshedAppointments.find((item) => item.id === savedAppointment.id);
        if (target) {
          openAppointment(target);
          return;
        }
      }

      const fallback = sortAppointmentsByStart(
        refreshedAppointments.filter(
          (item) =>
            Number(item.voluntarioId) === Number(payload.voluntarioId)
            && toDateInputValue(item.inicio) === formData.fecha
            && toTimeInputValue(item.inicio) === formData.horaInicio,
        ),
      )[0];

      if (fallback) {
        openAppointment(fallback);
      } else {
        startCreateFlow(new Date(payload.inicio));
      }
    } catch (err: any) {
      setActionError(err.message || "No se pudo guardar la cita de voluntariado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAppointment = async () => {
    const targetAppointment = appointmentForActions;

    if (!targetAppointment) {
      return;
    }

    if (!confirm("¿Quieres borrar esta cita de voluntariado?")) {
      return;
    }

    setIsDeletingAppointment(true);
    try {
      await deleteVolunteerAppointment(targetAppointment.id);
      setActionError(null);
      loadAppointments();
      startCreateFlow(selectedDate);
    } catch (err: any) {
      setActionError(err.message || "No se pudo eliminar la cita.");
    } finally {
      setIsDeletingAppointment(false);
    }
  };

  const confirmedCountByDay = appointments.reduce((acc: Record<string, number>, appointment) => {
    if (appointment.estado !== "confirmada") {
      return acc;
    }

    const key = toDateKey(appointment.inicio);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">🙋 Gestión de Voluntarios</h1>
          <button className="admin-btn-primary" onClick={() => startCreateFlow(selectedDate)}>
            + Alta de cita
          </button>
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
                  const confirmedCount = confirmedCountByDay[day.key] || 0;
                  const isSelected = day.key === selectedDateKey;
                  const dayAppointments = appointments.filter((item) => toDateKey(item.inicio) === day.key);

                  return (
                    <button
                      key={day.key}
                      type="button"
                      className={[
                        "calendar-day-cell",
                        day.isCurrentMonth ? "" : "calendar-day-outside",
                        confirmedCount > 0 ? "calendar-day-confirmed" : "",
                        isSelected ? "calendar-day-selected" : "",
                      ].join(" ").trim()}
                      onClick={() => handleDateSelection(day.date)}
                    >
                      <span className="calendar-day-number">{day.date.getDate()}</span>
                      <span className="calendar-day-meta">
                        {confirmedCount > 0 ? `${confirmedCount} confirmada${confirmedCount > 1 ? "s" : ""}` : "Sin confirmar"}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="calendar-day-total">{dayAppointments.length} cita{dayAppointments.length > 1 ? "s" : ""}</span>
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
                  <button type="button" className="admin-btn-primary" onClick={() => startCreateFlow(selectedDate)}>
                    Alta
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    disabled={!appointmentForActions}
                    onClick={() => appointmentForActions && openAppointment(appointmentForActions)}
                  >
                    Modificar
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    disabled={!appointmentForActions || isDeletingAppointment}
                    onClick={handleDeleteAppointment}
                  >
                    Borrar
                  </button>
                </div>
              </div>

              {selectedDateAppointments.length > 0 ? (
                <div className="daily-appointments-list">
                  {selectedDateAppointments.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`daily-appointment-chip ${selectedAppointmentId === item.id ? "active" : ""}`}
                      onClick={() => openAppointment(item)}
                    >
                      <span>{TIME_LABEL.format(new Date(item.inicio))} - {TIME_LABEL.format(new Date(item.fin))}</span>
                      <strong>{item.voluntario?.nombre || `Voluntario #${item.voluntarioId}`}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <AdminStateNotice message="No hay citas cargadas para este día." variant="empty" compact />
              )}

              <form className="form-card volunteer-appointment-form" onSubmit={handleFormSubmit}>
                <h3>{formMode === "edit" ? "Modificar cita" : "Alta de nueva cita"}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Voluntario</label>
                    <select
                      required
                      value={formData.voluntarioId}
                      onChange={(e) => setFormData({ ...formData, voluntarioId: e.target.value })}
                    >
                      <option value="">Selecciona un voluntario</option>
                      {voluntarios.map((voluntario) => (
                        <option key={voluntario.id} value={voluntario.id}>
                          {voluntario.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fecha</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) => {
                        setFormData({ ...formData, fecha: e.target.value });
                        setSelectedDate(new Date(`${e.target.value}T12:00:00`));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Hora de inicio</label>
                    <input
                      type="time"
                      required
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Hora de fin</label>
                    <input
                      type="time"
                      required
                      value={formData.horaFin}
                      onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label>Notas</label>
                  <textarea
                    rows={3}
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Actividad prevista, observaciones o recordatorios"
                  />
                </div>

                <button type="submit" className="admin-btn-primary" disabled={isSaving || !voluntarios.length}>
                  {isSaving ? "Guardando..." : formMode === "edit" ? "Guardar cambios" : "Crear cita"}
                </button>
              </form>
            </div>
          </section>

          <aside className="admin-table-card volunteer-list-panel">
            <div className="list-panel-header">
              <div>
                <p className="calendar-overline">Listado lateral</p>
                <h2 className="calendar-title">Todas las citas</h2>
              </div>
              <span className="list-counter">{appointments.length}</span>
            </div>

            {appointments.length === 0 ? (
              <AdminStateNotice message="No hay citas de voluntariado registradas." variant="empty" />
            ) : (
              <div className="appointment-list-scroll">
                {appointments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`appointment-list-item ${selectedAppointmentId === item.id ? "active" : ""}`}
                    onClick={() => openAppointment(item)}
                  >
                    <div className="appointment-list-main">
                      <strong>{item.voluntario?.nombre || `Voluntario #${item.voluntarioId}`}</strong>
                      <span>{DATE_LABEL.format(new Date(item.inicio))}</span>
                    </div>
                    <div className="appointment-list-meta">
                      <span>{TIME_LABEL.format(new Date(item.inicio))} - {TIME_LABEL.format(new Date(item.fin))}</span>
                      <span className={`badge badge-${item.estado || "pendiente"}`}>{item.estado || "pendiente"}</span>
                    </div>
                    {item.notas ? <p>{item.notas}</p> : null}
                  </button>
                ))}
              </div>
            )}

            <div className="volunteer-roster-card">
              <div className="list-panel-header compact">
                <div>
                  <p className="calendar-overline">Voluntarios</p>
                  <h3 className="roster-title">Base actual</h3>
                </div>
                <span className="list-counter muted">{voluntarios.length}</span>
              </div>

              {voluntarios.length === 0 ? (
                <AdminStateNotice message="No hay voluntarios registrados." variant="empty" compact />
              ) : (
                <div className="volunteer-roster-list">
                  {voluntarios.map((item) => (
                    <div key={item.id} className="volunteer-roster-item">
                      <div>
                        <strong>{item.nombre}</strong>
                        <span>{item.disponibilidad || "Sin disponibilidad"}</span>
                        <small>{item.email}</small>
                      </div>
                      <button className="admin-btn-danger" type="button" onClick={() => handleDelete(item.id)}>
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
};
