import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { getEventos, createEvento, updateEvento, deleteEvento } from "../../api.js";
import "../styles/adminPages.css";

export const AdminEvents = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

  const selectedEvent = eventos.find((item) => item.id === selectedEventId) || null;

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

    setActionError(null);
    setFormMode("edit");
    setShowForm(true);
    setFormData({
      titulo: target.titulo || "",
      descripcion: target.descripcion || "",
      fecha: target.fecha ? new Date(target.fecha).toISOString().slice(0, 10) : "",
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
      payload.append("fecha", formData.fecha);
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
          <button
            className="admin-btn-primary"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                startCreateFlow();
              }
            }}
          >
            {showForm ? "Cancelar" : "+ Nuevo Evento"}
          </button>
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
                <label>Fecha</label>
                <input
                  type="date"
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
                  <th>ID</th>
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
                    onClick={() => {
                      setSelectedEventId(item.id);
                      setSelectedImageIndex(0);
                      startEditFlow(item);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>#{item.id}</td>
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
                    <td>{new Date(item.fecha).toLocaleDateString()}</td>
                    <td>{item.lugar || "Sin definir"}</td>
                    <td>{item.descripcion || "Sin descripción"}</td>
                    <td>{Array.isArray(item.images) ? item.images.length : 0}</td>
                    <td>
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

        {selectedEvent ? (
          <div className="admin-selection-panel">
            <div className="admin-selection-title">
              Seleccionado: <strong>{selectedEvent.titulo}</strong>
            </div>
            <div className="admin-selection-actions">
              <button type="button" className="admin-btn-secondary" onClick={startCreateFlow}>
                Nuevo
              </button>
              <button type="button" className="admin-btn-primary" onClick={startEditFlow}>
                Modificar
              </button>
              <button type="button" className="admin-btn-danger" onClick={() => handleDelete(selectedEvent.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ) : null}

        {selectedEvent ? (
          <div className="form-card" style={{ marginTop: "1.25rem" }}>
            <h3>Vista previa del evento seleccionado</h3>
            <p style={{ marginTop: 0, color: "#475569" }}>
              {selectedEvent.titulo} · {new Date(selectedEvent.fecha).toLocaleDateString()}
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
        ) : null}
      </div>
    </AdminLayout>
  );
};
