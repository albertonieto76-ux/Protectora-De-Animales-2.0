import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { getVoluntarios, deleteVoluntario } from "../../api.js";
import "../styles/adminPages.css";

export const AdminVolunteers = () => {
  const [voluntarios, setVoluntarios] = useState<any[]>([]);

  const loadVoluntarios = () => {
    getVoluntarios()
      .then(setVoluntarios)
      .catch((err) => {
        console.warn("No se pudieron cargar voluntarios, usando mock:", err);
        setVoluntarios([
          { id: 1, nombre: "Carlos López", email: "carlos@example.com", telefono: "622111222", disponibilidad: "Fines de semana", mensaje: "Me gustaría pasear perros." },
          { id: 2, nombre: "Ana Martínez", email: "ana@example.com", telefono: "633444555", disponibilidad: "Tardes laborables", mensaje: "Apoyo en recepción y difusión." },
        ]);
      });
  };

  useEffect(() => {
    loadVoluntarios();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este voluntario?")) {
      try {
        await deleteVoluntario(id);
        loadVoluntarios();
      } catch (err) {
        alert("Error al eliminar el voluntario.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">🙋 Gestión de Voluntarios</h1>
        </div>

        <div className="admin-table-card">
          {voluntarios.length === 0 ? (
            <div className="empty-state">No hay voluntarios registrados.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Disponibilidad</th>
                  <th>Mensaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {voluntarios.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td><strong>{item.nombre}</strong></td>
                    <td>{item.email}</td>
                    <td>{item.telefono || "N/D"}</td>
                    <td>{item.disponibilidad || "No especificada"}</td>
                    <td>{item.mensaje || "Sin observaciones"}</td>
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
