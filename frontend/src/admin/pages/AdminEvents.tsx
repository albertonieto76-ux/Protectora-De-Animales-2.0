import { useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { getEventos, createEvento, updateEvento, deleteEvento, getEventAssistants } from "../../api.js";
import "../styles/adminPages.css";

export const toDateTimeLocalValue = (value?: string | Date | null) => {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toEventApiDate = (value: string) => new Date(value).toISOString();

export const AdminEvents = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSelectionPanel, setShowSelectionPanel] = useState(false);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [assistantsLoading, setAssistantsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const eventFormRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    lugar: "",
    images: [] as File[],
  });

  const loadEventos = () => {
    getEventos()
      .then((data) => {
        setEventos(data);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn("No se pudieron cargar eventos:", err);
        setEventos([]);
        setLoadError("No se pudieron cargar los eventos.");
      });
  };

  useEffect(() => {
    loadEventos();
  }, []);

  const loadAssistants = useCallback(async (eventId: number | null) => {
    if (!eventId) {
      setAssistants([]);
      return;
    }

    setAssistantsLoading(true);
    try {
      const [assistantsResponse, eventsResponse] = await Promise.all([
        getEventAssistants(eventId).catch(() => []),
        getEventos().catch(() => []),
      ]);

      const assistantsData = Array.isArray(assistantsResponse) ? assistantsResponse : [];
      const refreshedEvents = Array.isArray(eventsResponse) ? eventsResponse : [];

      if (refreshedEvents.length > 0) {
        setEventos(refreshedEvents);
      }

      const eventResponse = refreshedEvents.find((item: any) => item.id === eventId)
        || eventos.find((item: any) => item.id === eventId)
        || refreshedEvents[0];
      const nestedAssistants = Array.isArray(eventResponse?.asistentes) ? eventResponse.asistentes : [];
      const combinedAssistants = assistantsData.length > 0 ? assistantsData : nestedAssistants;
      setAssistants(combinedAssistants);
    } catch (err) {
      console.warn("No se pudieron cargar los asistentes:", err);
      const eventResponse = eventos.find((item: any) => item.id === eventId);
      const fallbackAssistants = Array.isArray(eventResponse?.asistentes) ? eventResponse.asistentes : [];
      setAssistants(fallbackAssistants);
    } finally {
      setAssistantsLoading(false);
    }
  }, []);

  const refreshEventData = useCallback(async (eventId: number | null) => {
    if (!eventId) return;
    try {
      const data = await getEventos();
      const normalized = Array.isArray(data) ? data : [];
      setEventos(normalized);
      if (selectedEventId === null || selectedEventId === eventId) {
        await loadAssistants(eventId);
      }
    } catch (err) {
      console.warn("No se pudo refrescar la lista de eventos:", err);
    }
  }, [loadAssistants, selectedEventId]);

  useEffect(() => {
    const handleAssistantUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ eventId?: number; timestamp?: number }>;
      const eventId = customEvent.detail?.eventId;
      if (eventId) {
        void refreshEventData(eventId);
      }
    };

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key !== "protectora:event-assistant-updated") return;
      try {
        const data = event.newValue ? JSON.parse(event.newValue) : null;
        if (data?.eventId) {
          void refreshEventData(data.eventId);
        }
      } catch {
        // Ignorar cambios inválidos del almacenamiento.
      }
    };

    window.addEventListener("protectora:event-assistant-updated", handleAssistantUpdated as EventListener);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("protectora:event-assistant-updated", handleAssistantUpdated as EventListener);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refreshEventData]);

  useEffect(() => {
    if (!eventos.length) {
      setSelectedEventId(null);
      setSelectedImageIndex(0);
      return;
    }

    const exists = eventos.some((item) => item.id === selectedEventId);
    if (!exists) {
      setSelectedEventId(eventos[0].id);
      setSelectedImageIndex(0);
    }
  }, [eventos, selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) {
      setAssistants([]);
      return;
    }

    void loadAssistants(selectedEventId);
  }, [selectedEventId, loadAssistants]);

  const selectedEvent = eventos.find((item) => item.id === selectedEventId) || null;

  const handleSelectEvent = async (eventId: number) => {
    setSelectedEventId(eventId);
    setSelectedImageIndex(0);
    setShowSelectionPanel(true);
    setShowForm(false);
    setActionError(null);
    await loadAssistants(eventId);
    setShowSelectionPanel(true);
  };

  const resetForm = () => {
    setFormData({ titulo: "", descripcion: "", fecha: "", lugar: "", images: [] });
    setShowForm(false);
    setFormMode("create");
  };

  const startCreateFlow = () => {
    setActionError(null);
    setFormMode("create");
    setShowForm(true);
    setFormData({ titulo: "", descripcion: "", fecha: "", lugar: "", images: [] });
  };

  const startEditFlow = (eventItem?: any) => {
    const target = eventItem || selectedEvent;
    if (!target) return;

    setSelectedEventId(target.id);
    setActionError(null);
    setFormMode("edit");
    setShowForm(true);
    setFormData({
      titulo: target.titulo || "",
      descripcion: target.descripcion || "",
      fecha: toDateTimeLocalValue(target.fecha),
      lugar: target.lugar || "",
      images: [],
    });
    requestAnimationFrame(() => {
      eventFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("titulo", formData.titulo);
      if (formData.descripcion) payload.append("descripcion", formData.descripcion);
      payload.append("fecha", toEventApiDate(formData.fecha));
      if (formData.lugar) payload.append("lugar", formData.lugar);
      formData.images.slice(0, 10).forEach((file) => payload.append("images", file));

      if (formMode === "edit" && selectedEvent) {
        await updateEvento(selectedEvent.id, payload);
      } else {
        await createEvento(payload);
      }

      resetForm();
      setActionError(null);
      loadEventos();
    } catch (err) {
      setActionError(formMode === "edit" ? "Error al actualizar el evento." : "Error al crear el evento.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        await deleteEvento(id);
        setActionError(null);
        loadEventos();
      } catch (err) {
        setActionError("Error al eliminar el evento.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">📅 Gestión de Eventos</h1>
          {showForm ? (
            <button
              className="admin-btn-secondary"
              onClick={() => {
                resetForm();
              }}
            >
              Cancelar
            </button>
          ) : (
            <button
              className="admin-btn-primary"
              onClick={() => {
                startCreateFlow();
              }}
            >
              + Alta de eventos
            </button>
          )}
        </div>

        {loadError ? <AdminStateNotice message={loadError} variant="warning" compact /> : null}
        {actionError ? <AdminStateNotice message={actionError} variant="warning" compact /> : null}

        {showForm && (
          <form className="form-card" onSubmit={handleSubmit} ref={eventFormRef}>
            <h3>{formMode === "edit" ? "Editar Evento" : "Añadir Nuevo Evento"}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Título del Evento</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fecha y hora</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Lugar</label>
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fotos del evento (hasta 10)</label>
                <label className="file-picker-btn">
                  Seleccionar archivos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="file-picker-input"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        images: e.target.files ? Array.from(e.target.files).slice(0, 10) : [],
                      })
                    }
                  />
                </label>
                <div className="file-picker-status">
                  {formData.images.length > 0
                    ? `${formData.images.length} archivo(s) seleccionado(s)`
                    : "No se ha elegido ningun archivo"}
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Descripción</label>
              <textarea
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <button type="submit" className="admin-btn-primary">
              Guardar Evento
            </button>
          </form>
        )}

        <div className="admin-table-card">
          {eventos.length === 0 ? (
            <AdminStateNotice message="No hay eventos programados." variant="empty" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Portada</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Descripción</th>
                  <th>Fotos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedEvent?.id === item.id ? "admin-row-selected" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleSelectEvent(item.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td><strong>{item.titulo}</strong></td>
                    <td>
                      {Array.isArray(item.images) && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={`Portada de ${item.titulo}`}
                          className="event-thumb"
                        />
                      ) : (
                        <span className="event-thumb-placeholder">Sin foto</span>
                      )}
                    </td>
                    <td>{new Date(item.fecha).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td>{item.lugar || "Sin definir"}</td>
                    <td>{item.descripcion || "Sin descripción"}</td>
                    <td>{Array.isArray(item.images) ? item.images.length : 0}</td>
                    <td>
                      <button
                        className="admin-btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditFlow(item);
                        }}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Modificar
                      </button>
                      <button
                        className="admin-btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
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
        </div>

        {showSelectionPanel && selectedEvent ? (
          <div className="admin-selection-panel">
            <div className="admin-selection-title">
              Seleccionado: <strong>{selectedEvent.titulo}</strong>
            </div>
            <div className="admin-selection-actions">
              <button type="button" className="admin-btn-primary" onClick={() => startEditFlow(selectedEvent)}>
                Modificar
              </button>
              <button type="button" className="admin-btn-danger" onClick={() => handleDelete(selectedEvent.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ) : null}

        {selectedEvent ? (
          <>
            <div className="form-card" style={{ marginTop: "1.25rem" }}>
              <h3>Vista previa del evento seleccionado</h3>
              <p style={{ marginTop: 0, color: "#475569" }}>
                {selectedEvent.titulo} · {new Date(selectedEvent.fecha).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
              </p>

              {Array.isArray(selectedEvent.images) && selectedEvent.images.length > 0 ? (
                <div className="event-gallery-wrap">
                  <img
                    src={selectedEvent.images[selectedImageIndex] || selectedEvent.images[0]}
                    alt={`Foto ${selectedImageIndex + 1} de ${selectedEvent.titulo}`}
                    className="event-gallery-main"
                  />
                  <div className="event-gallery-thumbs">
                    {selectedEvent.images.map((src: string, index: number) => (
                      <button
                        key={`event-image-${selectedEvent.id}-${index}`}
                        type="button"
                        className={`event-gallery-thumb-btn ${selectedImageIndex === index ? "active" : ""}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img src={src} alt={`Miniatura ${index + 1}`} className="event-gallery-thumb" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <AdminStateNotice message="El evento seleccionado no tiene fotos cargadas." variant="empty" compact />
              )}
            </div>

            <div className="form-card" style={{ marginTop: "1.25rem", border: "2px solid #f59e0b" }}>
              <h3>Personas apuntadas</h3>
              <div style={{ color: "#92400e", fontSize: "1rem", marginBottom: "0.75rem", fontWeight: 600 }}>
                {assistantsLoading ? "Cargando apuntados..." : `${assistants.length} personas apuntadas`}
              </div>

              {assistants.length === 0 ? (
                <AdminStateNotice message="Todavía no hay personas apuntadas a este evento." variant="empty" compact />
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {assistants.map((assistant: any) => (
                    <div key={assistant.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.8rem", background: "#fff" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{assistant.nombre || "Sin nombre"}</div>
                      <div style={{ color: "#475569", fontSize: "0.95rem" }}>{assistant.email || "Sin email"}</div>
                      {assistant.telefono ? <div style={{ color: "#475569", fontSize: "0.95rem" }}>Tel: {assistant.telefono}</div> : null}
                      {assistant.mensaje ? <div style={{ color: "#475569", fontSize: "0.95rem", marginTop: "0.25rem" }}>{assistant.mensaje}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};
