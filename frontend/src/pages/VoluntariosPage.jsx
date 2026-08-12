import { useVoluntarios } from "../hooks/useVoluntarios";
import { useState } from "react";
import { VolunteerAvailabilitySelector } from "../components/VolunteerAvailabilitySelector";
import { broadcastVolunteerUpdated } from "../utils/volunteerSignals";
import "./EventosPage.css";
import "./PublicIndexVisual.css";

const DISPONIBILIDADES = ["Fines de semana", "Entre semana", "Mañanas", "Tardes", "Flexible"];

export default function VoluntariosPage() {
    const { voluntarios, loading, crear } = useVoluntarios();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        telefono: "",
        disponibilidad: "",
    });
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await crear(form);
            broadcastVolunteerUpdated({ source: "public-volunteer-form" });
            setEnviado(true);
            setForm({ nombre: "", email: "", telefono: "", disponibilidad: "" });
            setTimeout(() => {
                setEnviado(false);
                setModalOpen(false);
            }, 2000);
        } catch {
            // error silencioso, el hook ya lo gestiona
        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            <div className="eventos-page public-shell">
                <section className="eventos-header public-hero">
                    <h1>Únete como Voluntario</h1>
                    <p>
                        Tu tiempo y dedicación marcan la diferencia en la vida de nuestros animales.
                        Apúntate y empieza a ayudar hoy mismo.
                    </p>
                    <button
                        id="btn-suscribirse-voluntario"
                        className="public-hero-cta"
                        onClick={() => setModalOpen(true)}
                    >
                        Quiero ser voluntario
                    </button>
                </section>

                <section className="volunteer-stats-grid">
                    {[
                        { icon: "👥", value: loading ? "..." : voluntarios.length, label: "Voluntarios activos" },
                        { icon: "🐾", value: "14+", label: "Animales atendidos" },
                        { icon: "📅", value: "Flexible", label: "Horario adaptable" },
                    ].map((s, i) => (
                        <article key={i} className="volunteer-stat-card">
                            <div className="volunteer-stat-icon">{s.icon}</div>
                            <div className="volunteer-stat-value">{s.value}</div>
                            <div className="public-muted">{s.label}</div>
                        </article>
                    ))}
                </section>

                <section className="voluntarios-feature">
                    <article className="event-card event-card-featured">
                        <div className="event-card-top">
                            <span className="event-date">Voluntariado</span>
                            <span className="event-location">Inscripción abierta</span>
                        </div>
                        <h2 className="event-title">Hazte voluntario hoy</h2>
                        <p className="event-description">
                            Participa en rescates, cuidados diarios y eventos solidarios.
                        </p>
                        <button
                            className="public-hero-cta volunteer-feature-cta"
                            onClick={() => setModalOpen(true)}
                        >
                            Completar inscripción
                        </button>
                    </article>
                </section>

                <section className="events-grid voluntarios-feed">
                    {loading ? (
                        <article className="event-card">
                            <h2 className="event-title">Cargando voluntarios...</h2>
                        </article>
                    ) : voluntarios.length === 0 ? (
                        <article className="event-card">
                            <div className="event-card-top">
                                <span className="event-date">Sin registros</span>
                                <span className="event-location">Voluntariado</span>
                            </div>
                            <h2 className="event-title">Aún no hay voluntarios</h2>
                            <p className="event-description">Sé la primera persona en sumarte al equipo.</p>
                        </article>
                    ) : (
                        voluntarios.map((v, index) => (
                            <article key={v.id} className={`event-card${index === 0 ? " event-card-featured" : ""}`}>
                                <div className="event-card-top">
                                    <span className="event-date">Voluntario #{v.id}</span>
                                    <span className="event-location">{v.disponibilidad || "Sin horario"}</span>
                                </div>
                                <h2 className="event-title">{v.nombre}</h2>
                                <p className="event-description">Persona inscrita para apoyar labores de la protectora.</p>
                                <div className="public-muted">✉️ {v.email}</div>
                                {v.telefono ? <div className="public-muted">📞 {v.telefono}</div> : null}
                            </article>
                        ))
                    )}
                </section>
            </div>

            {/* ──────────────── MODAL ──────────────── */}
            {modalOpen && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
                    className="public-modal-overlay"
                >
                    <div className="public-modal-card">
                        {/* Cerrar */}
                        <button
                            onClick={() => setModalOpen(false)}
                            className="public-modal-close"
                        >✕</button>

                        {enviado ? (
                            <div className="volunteer-modal-success">
                                <div className="volunteer-modal-emoji">🎉</div>
                                <h3>¡Gracias!</h3>
                                <p>Te has inscrito como voluntario correctamente.</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="volunteer-modal-title">Inscríbete como voluntario</h2>
                                <p className="public-muted" style={{ marginBottom: "1rem" }}>
                                    Rellena el formulario y nos pondremos en contacto contigo.
                                </p>

                                <form onSubmit={handleSubmit} className="public-form">
                                    {[
                                        { field: "nombre", placeholder: "Nombre completo *", type: "text", required: true },
                                        { field: "email", placeholder: "Correo electrónico *", type: "email", required: true },
                                        { field: "telefono", placeholder: "Teléfono (opcional)", type: "tel", required: false },
                                    ].map(({ field, placeholder, type, required }) => (
                                        <input
                                            key={field}
                                            type={type}
                                            placeholder={placeholder}
                                            required={required}
                                            value={form[field]}
                                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                        />
                                    ))}

                                    <label className="public-muted" style={{ marginTop: "0.4rem", display: "block" }}>
                                        Selecciona tu disponibilidad
                                    </label>
                                    <VolunteerAvailabilitySelector
                                        value={form.disponibilidad}
                                        onChange={(value) => setForm({ ...form, disponibilidad: value })}
                                    />

                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className="volunteer-modal-submit"
                                    >
                                        {enviando ? "Enviando..." : "Inscribirme como voluntario"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
