import { useAdopciones } from "../hooks/useAdopciones";
import { useEffect, useMemo, useState } from "react";
import { getAnimales } from "../api";
import "./EventosPage.css";
import "./PublicIndexVisual.css";

const FALLBACK_ANIMAL_IMAGE = "/hero-hamsters.jpg";

export default function AdopcionesPage() {
    const { adopciones, loading, crear } = useAdopciones();
    const [animales, setAnimales] = useState([]);
    const [form, setForm] = useState({
        animalId: "",
        nombre: "",
        email: "",
        mensaje: "",
    });
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        getAnimales()
            .then((data) => setAnimales(Array.isArray(data) ? data : []))
            .catch(() => setAnimales([]));
    }, []);

    const animalsById = useMemo(() => {
        const map = new Map();
        animales.forEach((animal) => {
            map.set(Number(animal.id), animal);
        });
        return map;
    }, [animales]);

    if (loading) return <p className="loading-message">Cargando solicitudes...</p>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        const result = await crear(form);
        if (result?.ok) {
            setForm({ animalId: "", nombre: "", email: "", mensaje: "" });
            return;
        }
        setSubmitError(result?.error || "No se pudo enviar la solicitud");
    };

    const formatFecha = (value) => {
        if (!value) return "Sin fecha";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Sin fecha";
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatEstado = (value) => {
        if (!value) return "Pendiente";
        const normalized = String(value).trim().toLowerCase();
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    const resolveImageUrl = (value) => {
        if (!value || typeof value !== "string") return null;
        if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
            return value;
        }
        return value.startsWith("/") ? value : `/${value}`;
    };

    const getFirstImage = (adopcion) => {
        const fromRelation = Array.isArray(adopcion?.animal?.images) ? adopcion.animal.images[0] : null;
        if (fromRelation) return resolveImageUrl(fromRelation);

        const fromAnimalMap = animalsById.get(Number(adopcion?.animalId));
        if (Array.isArray(fromAnimalMap?.images) && fromAnimalMap.images[0]) {
            return resolveImageUrl(fromAnimalMap.images[0]);
        }

        return FALLBACK_ANIMAL_IMAGE;
    };

    const selectedAnimal = animalsById.get(Number(form.animalId));
    const selectedAnimalImage = Array.isArray(selectedAnimal?.images) && selectedAnimal.images[0]
        ? resolveImageUrl(selectedAnimal.images[0])
        : FALLBACK_ANIMAL_IMAGE;

    return (
        <div className="eventos-page public-shell">
            <header className="eventos-header public-hero">
                <h1>Adopta Amigos</h1>
                <p>Explora y registra solicitudes de adopción con el mismo formato visual de Eventos.</p>
            </header>

            <section className="adopciones-feature">
                <article className="event-card">
                    <div className="event-card-top">
                        <span className="event-date">Solicitud</span>
                        <span className="event-location">Nueva</span>
                    </div>
                    <h2 className="event-title">Quiero adoptar</h2>
                    <p className="event-description">Completa los datos para iniciar el proceso de adopción responsable.</p>
                    <form className="public-form" onSubmit={handleSubmit}>
                        {submitError ? <p className="error-message">{submitError}</p> : null}
                        <select
                            value={form.animalId}
                            onChange={(e) => setForm({ ...form, animalId: e.target.value })}
                        >
                            <option value="">Selecciona un animal</option>
                            {animales.map((animal) => (
                                <option key={animal.id} value={animal.id}>
                                    {animal.name || animal.nombre || `Animal #${animal.id}`}
                                </option>
                            ))}
                        </select>
                        {form.animalId ? (
                            <img
                                className="event-public-image"
                                src={selectedAnimalImage}
                                alt={`Foto principal de ${selectedAnimal?.name || selectedAnimal?.nombre || `Animal ${form.animalId}`}`}
                                onError={(e) => {
                                    e.currentTarget.src = FALLBACK_ANIMAL_IMAGE;
                                }}
                            />
                        ) : null}
                        <input
                            placeholder="Nombre"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <textarea
                            placeholder="Mensaje"
                            value={form.mensaje}
                            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                        />
                        <button type="submit">Enviar solicitud</button>
                    </form>
                </article>
            </section>

            <section className="events-grid adopciones-feed">
                {adopciones.length === 0 ? (
                    <article className="event-card">
                        <div className="event-card-top">
                            <span className="event-date">Sin registros</span>
                            <span className="event-location">Adopciones</span>
                        </div>
                        <h2 className="event-title">Aún no hay solicitudes</h2>
                        <p className="event-description">Sé el primero en enviar una solicitud de adopción.</p>
                    </article>
                ) : (
                    adopciones.map((a, index) => {
                        const primaryImage = getFirstImage(a);
                        return (
                        <article key={a.id} className={`event-card${index === 0 ? " event-card-featured" : ""}`}>
                            <img
                                className="event-public-image"
                                src={primaryImage}
                                alt={`Foto principal del animal #${a.animalId}`}
                                onError={(e) => {
                                    e.currentTarget.src = FALLBACK_ANIMAL_IMAGE;
                                }}
                            />
                            <div className="event-card-top">
                                <span className="event-date">{formatFecha(a.createdAt)}</span>
                                <span className="event-location">{formatEstado(a.estado)}</span>
                            </div>
                            <h2 className="event-title">Animal #{a.animalId} · {a.nombre}</h2>
                            <p className="event-description">{a.mensaje || "Solicitud recibida sin mensaje adicional."}</p>
                            <div className="public-muted">{a.email}</div>
                        </article>
                    )})
                )}
            </section>
        </div>
    );
}

