import { useEffect, useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { getAnimales, createAnimal, deleteAnimal } from "../../api.js";
import "../styles/adminPages.css";

export const AdminAnimals = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "Perro",
    age: "",
    description: "",
    imageUrl: "",
  });

  const loadAnimals = () => {
    getAnimales()
      .then(setAnimals)
      .catch((err) => {
        console.warn("No se pudieron cargar animales de la API, usando mock:", err);
        setAnimals([
          { id: 1, name: "Max", species: "Perro", age: 3, description: "Amigable y activo", imageUrl: "" },
          { id: 2, name: "Luna", species: "Gato", age: 2, description: "Tranquila y cariñosa", imageUrl: "" },
          { id: 3, name: "Rocky", species: "Perro", age: 5, description: "Muy obediente", imageUrl: "" },
        ]);
      });
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnimal({
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
      });
      setFormData({ name: "", species: "Perro", age: "", description: "", imageUrl: "" });
      setShowForm(false);
      loadAnimals();
    } catch (err) {
      alert("Error al crear el animal. Verifica que el backend esté ejecutándose.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este animal?")) {
      try {
        await deleteAnimal(id);
        loadAnimals();
      } catch (err) {
        alert("Error al eliminar el animal.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">🐾 Gestión de Animales</h1>
          <button
            className="admin-btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancelar" : "+ Nuevo Animal"}
          </button>
        </div>

        {showForm && (
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Añadir Nuevo Animal</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Especie</label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Edad (años)</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>URL Imagen</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Descripción</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="admin-btn-primary">
              Guardar Animal
            </button>
          </form>
        )}

        <div className="admin-table-card">
          {animals.length === 0 ? (
            <div className="empty-state">No hay animales registrados.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Edad</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr key={animal.id}>
                    <td>#{animal.id}</td>
                    <td><strong>{animal.name || animal.nombre}</strong></td>
                    <td>{animal.species || animal.especie}</td>
                    <td>{animal.age || animal.edad ? `${animal.age || animal.edad} años` : "N/D"}</td>
                    <td>{animal.description || animal.descripcion || "Sin descripción"}</td>
                    <td>
                      <button
                        className="admin-btn-danger"
                        onClick={() => handleDelete(animal.id)}
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
