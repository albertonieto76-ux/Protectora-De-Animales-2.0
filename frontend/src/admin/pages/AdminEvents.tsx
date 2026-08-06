import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { getEventos, createEvento, deleteEvento } from "../../api.js";
import "../styles/adminPages.css";

export const AdminEvents = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    lugar: "",
  });

  const loadEventos = () => {
    getEventos()
      .then(setEventos)
      .catch((err) => {
        console.warn("No se pudieron cargar eventos, usando mock:", err);
        setEventos([
          { id: 1, titulo: "Jornada de Adopción Responsable", fecha: "2026-09-15", lugar: "Parque Central", descripcion: "Ven a conocer a nuestros peludos." },
          { id: 2, titulo: "Taller de Cuidado Canino", fecha: "2026-10-01", lugar: "Centro Comunitario", descripcion: "Aprende nutrición y educación básica." },
        ]);
      });
  };

  useEffect(() => {
    loadEventos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvento(formData);
      setFormData({ titulo: "", descripcion: "", fecha: "", lugar: "" });
      setShowForm(false);
      loadEventos();
    } catch (err) {
      alert("Error al crear el evento.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        await deleteEvento(id);
        loadEventos();
      } catch (err) {
        alert("Error al eliminar el evento.");
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
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancelar" : "+ Nuevo Evento"}
          </button>
        </div>

        {showForm && (
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Añadir Nuevo Evento</h3>
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
            <div className="empty-state">No hay eventos programados.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td><strong>{item.titulo}</strong></td>
                    <td>{new Date(item.fecha).toLocaleDateString()}</td>
                    <td>{item.lugar || "Sin definir"}</td>
                    <td>{item.descripcion || "Sin descripción"}</td>
                    <td>
                      <button
                        className="admin-btn-danger"
                        onClick={() => handleDelete(item.id)}
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
      </div>
    </AdminLayout>
  );
};
