import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { getAdopciones, updateAdopcionStatus, deleteAdopcion } from "../../api.js";
import "../styles/adminPages.css";

export const AdminAdoptions = () => {
  const [adoptions, setAdoptions] = useState<any[]>([]);

  const loadAdoptions = () => {
    getAdopciones()
      .then(setAdoptions)
      .catch((err) => {
        console.warn("No se pudieron cargar solicitudes de adopción, usando mock:", err);
        setAdoptions([
          { id: 1, nombre: "María García", email: "maria@example.com", telefono: "600123456", animalId: 1, estado: "pendiente", mensaje: "Tengo jardín y experiencia." },
          { id: 2, nombre: "Juan Pérez", email: "juan@example.com", telefono: "611987654", animalId: 2, estado: "aprobado", mensaje: "Busco un gato tranquilo." },
        ]);
      });
  };

  useEffect(() => {
    loadAdoptions();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateAdopcionStatus(id, newStatus);
      loadAdoptions();
    } catch (err) {
      alert("Error al actualizar el estado de la solicitud.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta solicitud?")) {
      try {
        await deleteAdopcion(id);
        loadAdoptions();
      } catch (err) {
        alert("Error al eliminar la solicitud.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">❤️ Solicitudes de Adopción</h1>
        </div>

        <div className="admin-table-card">
          {adoptions.length === 0 ? (
            <div className="empty-state">No hay solicitudes de adopción registradas.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitante</th>
                  <th>Contacto</th>
                  <th>Animal #ID</th>
                  <th>Estado</th>
                  <th>Mensaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {adoptions.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td><strong>{item.nombre}</strong></td>
                    <td>
                      <div>{item.email}</div>
                      <small style={{ color: "#64748b" }}>{item.telefono || "Sin teléfono"}</small>
                    </td>
                    <td>Animal #{item.animalId}</td>
                    <td>
                      <span className={`badge badge-${item.estado}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td>{item.mensaje || "Sin mensaje"}</td>
                    <td style={{ display: "flex", gap: "0.4rem" }}>
                      {item.estado !== "aprobado" && (
                        <button
                          style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
                          onClick={() => handleStatusChange(item.id, "aprobado")}
                        >
                          Aprobar
                        </button>
                      )}
                      {item.estado !== "rechazado" && (
                        <button
                          style={{ backgroundColor: "#f59e0b", color: "white", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
                          onClick={() => handleStatusChange(item.id, "rechazado")}
                        >
                          Rechazar
                        </button>
                      )}
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
