import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../layout/AdminLayout";
import { getAnimales, createAnimal, deleteAnimal } from "../../api.js";
import "../styles/adminPages.css";

export const AdminAnimals = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedAnimalId, setExpandedAnimalId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "Perro",
    age: "",
    description: "",
    images: [] as File[],
  });

  const loadAnimals = () => {
    getAnimales()
      .then(setAnimals)
      .catch((err) => {
        console.warn("No se pudieron cargar animales de la API, usando mock:", err);
        setAnimals([
          { id: 1, name: "Max", species: "Perro", age: 3, description: "Amigable y activo", images: [] },
          { id: 2, name: "Luna", species: "Gato", age: 2, description: "Tranquila y cariñosa", images: [] },
          { id: 3, name: "Rocky", species: "Perro", age: 5, description: "Muy obediente", images: [] },
        ]);
      });
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", species: "Perro", age: "", description: "", images: [] });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("species", formData.species);
      if (formData.age) payload.append("age", formData.age);
      if (formData.description) payload.append("description", formData.description);
      formData.images.forEach((file) => payload.append("images", file));
      await createAnimal(payload);

      resetForm();
      loadAnimals();
    } catch (err) {
      alert("Error al crear el animal. Verifica que el backend esté ejecutándose.");
    }
  };

  const togglePreview = (animalId: number) => {
    setExpandedAnimalId((current) => (current === animalId ? null : animalId));
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
                <label>Fotos del animal (hasta 10)</label>
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
                        images: e.target.files ? Array.from(e.target.files) : [],
                      })
                    }
                  />
                </label>
                <div className="file-picker-status">
                  {formData.images.length > 0
                    ? `${formData.images.length} archivo(s) seleccionado(s)`
                    : "No se ha elegido ningún archivo"}
                </div>
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

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="admin-btn-primary">
                Guardar Animal
              </button>
              <button type="button" className="admin-btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
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
                  <Fragment key={animal.id}>
                    <tr>
                      <td>#{animal.id}</td>
                      <td>
                        <button
                          type="button"
                          className="animal-name-link"
                          onClick={() => togglePreview(animal.id)}
                        >
                          <strong>{animal.name || animal.nombre}</strong>
                        </button>
                      </td>
                      <td>{animal.species || animal.especie}</td>
                      <td>{animal.age || animal.edad ? `${animal.age || animal.edad} años` : "N/D"}</td>
                      <td>{animal.description || animal.descripcion || "Sin descripción"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <Link
                            to={`/admin/animals/${animal.id}/edit`}
                            className="admin-btn-primary"
                            style={{ textDecoration: "none" }}
                          >
                            Modificar
                          </Link>
                          <button
                            className="admin-btn-danger"
                            onClick={() => handleDelete(animal.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedAnimalId === animal.id && animal.images?.length > 0 && (
                      <tr className="animal-preview-row" key={`preview-${animal.id}`}>
                        <td colSpan={6}>
                          <div className="animal-preview-box">
                            {animal.images.map((src: string, index: number) => (
                              <img key={`${animal.id}-${index}`} src={src} alt={`${animal.name || animal.nombre} ${index + 1}`} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
