import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../layout/AdminLayout";
import { AdminStateNotice } from "../components/AdminStateNotice";
import { getAnimalById, updateAnimal } from "../../api.js";
import "../styles/adminPages.css";

export const AdminAnimalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [animal, setAnimal] = useState<any | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [replacePhotoIndex, setReplacePhotoIndex] = useState<number | null>(null);
  const [replacePhotoFile, setReplacePhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    species: "Perro",
    age: "",
    description: "",
    images: [] as File[],
  });

  useEffect(() => {
    async function loadAnimal() {
      try {
        const data = await getAnimalById(id);
        setAnimal(data);
        setLoadError(null);
        setFormData({
          name: data.name || data.nombre || "",
          species: data.species || data.especie || "Perro",
          age: data.age || data.edad ? String(data.age || data.edad) : "",
          description: data.description || data.descripcion || "",
          images: [],
        });
      } catch (err) {
        console.warn("No se pudo cargar el animal:", err);
        setAnimal(null);
        setLoadError("No se pudo cargar el animal.");
      } finally {
        setLoading(false);
      }
    }

    loadAnimal();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("species", formData.species);
      if (formData.age) payload.append("age", formData.age);
      if (formData.description) payload.append("description", formData.description);

      if (replacePhotoIndex !== null && replacePhotoFile) {
        payload.append("existingImages", JSON.stringify(animal.images || []));
        payload.append("replaceIndex", String(replacePhotoIndex));
        payload.append("images", replacePhotoFile);
      } else {
        formData.images.forEach((file) => payload.append("images", file));
      }

      await updateAnimal(animal.id, payload);
      setActionError(null);
      navigate("/admin/animals");
    } catch (err) {
      setActionError("Error al guardar cambios del animal.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-container">
          <AdminStateNotice message="Cargando animal..." variant="loading" />
        </div>
      </AdminLayout>
    );
  }

  if (!animal) {
    return (
      <AdminLayout>
        <div className="admin-page-container">
          <AdminStateNotice message={loadError || "No se encontró el animal."} variant="warning" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">Editar Animal #{animal.id}</h1>
        </div>

        {actionError ? <AdminStateNotice message={actionError} variant="warning" compact /> : null}

        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Modificar {animal.name || animal.nombre}</h3>

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
              {animal.images?.length > 0 && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  Fotos actuales: {animal.images.length}. Si subes nuevas aquí, sustituirán la galería actual.
                </div>
              )}
            </div>
          </div>

          {animal.images?.length > 0 && (
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Selecciona una foto para reemplazar</label>
              <div className="edit-photo-grid">
                {animal.images.slice(0, 10).map((src: string, index: number) => (
                  <button
                    key={`edit-photo-${animal.id}-${index}`}
                    type="button"
                    className={`edit-photo-thumb ${replacePhotoIndex === index ? "selected" : ""}`}
                    onClick={() => setReplacePhotoIndex(index)}
                  >
                    <img src={src} alt={`${animal.name || animal.nombre} ${index + 1}`} />
                  </button>
                ))}
              </div>
              <label className={`file-picker-btn ${replacePhotoIndex === null ? "disabled" : ""}`}>
                Seleccionar archivo
                <input
                  type="file"
                  accept="image/*"
                  className="file-picker-input"
                  onChange={(e) => setReplacePhotoFile(e.target.files?.[0] || null)}
                  disabled={replacePhotoIndex === null}
                />
              </label>
              <div className="file-picker-status">
                {replacePhotoFile ? replacePhotoFile.name : "No se ha elegido ningún archivo"}
              </div>
              {replacePhotoIndex !== null && (
                <div style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "#475569" }}>
                  Foto seleccionada: #{replacePhotoIndex + 1}
                  {!replacePhotoFile ? " · Elige un archivo para reemplazarla" : ""}
                </div>
              )}
            </div>
          )}

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
              Guardar cambios
            </button>
            <button type="button" className="admin-btn-secondary" onClick={() => navigate("/admin/animals")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
