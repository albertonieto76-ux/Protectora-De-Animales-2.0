import { useEventos } from "../hooks/useEventos";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { registerEventAssistant } from "../api.js";
import "./EventosPage.css";
import "./PublicIndexVisual.css";

export default function EventosPage() {
    const { eventos, loading } = useEventos();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedEventImageIndex, setSelectedEventImageIndex] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [modalStep, setModalStep] = useState("ficha");
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: "",
    });

    useEffect(() => {
        const closeHandler = () => {
            setModalOpen(false);
            setSelectedEvent(null);
            setSelectedEventImageIndex(0);
            setModalStep("ficha");
            setEnviado(false);
        };

        window.addEventListener("close-page-level-modals", closeHandler);
        return () => window.removeEventListener("close-page-level-modals", closeHandler);
    }, []);

    const abrirModalEvento = (evento) => {
        setSelectedEvent(evento);
        setSelectedEventImageIndex(0);
        setModalOpen(true);
        setModalStep("ficha");
        setEnviado(false);
        setForm({
            nombre: "",
            email: "",
            telefono: "",
            mensaje: "",
        });
    };

    const abrirFormularioEvento = (evento) => {
        abrirModalEvento(evento);
        setModalStep("form");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await registerEventAssistant(selectedEvent?.id, {
                ...form,
                mensaje: form.mensaje?.trim()
                    ? form.mensaje.trim()
                    : selectedEvent?.titulo
                        ? `Inscripción desde eventos para: ${selectedEvent.titulo}`
                        : "Inscripción desde página de eventos",
            });
            const eventId = selectedEvent?.id;
            if (eventId) {
                const payload = { eventId, timestamp: Date.now() };
                window.dispatchEvent(new CustomEvent("protectora:event-assistant-updated", { detail: payload }));
                window.localStorage.setItem("protectora:event-assistant-updated", JSON.stringify(payload));
            }
            setEnviado(true);
            setTimeout(() => {
                setEnviado(false);
                setModalOpen(false);
                setSelectedEvent(null);
            }, 2000);
        } catch {
            // El hook ya gestiona el estado de error.
        } finally {
            setEnviando(false);
        }
    };

    const getEventImages = (evento) => {
        if (!evento) return [];
        if (Array.isArray(evento.images)) {
            return evento.images.filter((img) => typeof img === "string" && img.trim());
        }
        if (typeof evento.images === "string" && evento.images.trim()) {
            try {
                const parsed = JSON.parse(evento.images);
                if (Array.isArray(parsed)) {
                    return parsed.filter((img) => typeof img === "string" && img.trim());
                }
            } catch {
                return [evento.images.trim()];
            }
        }
        return [];
    };

    const selectedEventImages = getEventImages(selectedEvent);
    const selectedEventImageCount = selectedEventImages.length;
    const safeSelectedEventImageIndex =
        selectedEventImageCount > 0
            ? ((selectedEventImageIndex % selectedEventImageCount) + selectedEventImageCount) % selectedEventImageCount
            : 0;
    const currentEventImage =
        selectedEventImageCount > 0
            ? selectedEventImages[safeSelectedEventImageIndex]
            : null;

    if (loading) return <p className="loading-message">Cargando eventos...</p>;

    return (
        <>
            <div className="eventos-page public-shell">
                <header className="eventos-header public-hero">
                    <Link to="/" className="public-back-link">
                        ← Volver a la página principal
                    </Link>
                    <h1>Eventos</h1>
                    <p>Explora las próximas actividades y encuentros organizados por la protectora.</p>
                </header>

                <div className="events-grid">
                    {eventos.map((ev, index) => (
                        <article
                            key={ev.id}
                            className={`event-card${index === 0 ? " event-card-featured" : ""}`}
                            onClick={(e) => {
                                if (e.target instanceof HTMLElement && e.target.closest("button")) {
                                    return;
                                }
                                abrirModalEvento(ev);
                            }}
                        >
                            {Array.isArray(ev.images) && ev.images[0] ? (
                                <img className="event-public-image" src={ev.images[0]} alt={`Portada de ${ev.titulo}`} />
                            ) : null}
                            <div className="event-card-top">
                                <span className="event-date">{ev.fecha}</span>
                                <span className="event-location">{ev.lugar}</span>
                            </div>
                            <h2 className="event-title">{ev.titulo}</h2>
                            {ev.descripcion && <p className="event-description">{ev.descripcion}</p>}
                            <button
                                type="button"
                                className="public-hero-cta volunteer-feature-cta"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    abrirFormularioEvento(ev);
                                }}
                            >
                                Apuntarme
                            </button>
                        </article>
                    ))}
                </div>
            </div>

            {modalOpen && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
                    className="public-modal-overlay"
                >
                    <div className="public-modal-card">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="public-modal-close"
                        >✕</button>

                        {enviado ? (
                            <div className="volunteer-modal-success">
                                <div className="volunteer-modal-emoji">🎉</div>
                                <h3>¡Inscripción enviada!</h3>
                                <p>Nos pondremos en contacto contigo para este evento.</p>
                            </div>
                        ) : modalStep === "ficha" ? (
                            <>
                                <h2 className="volunteer-modal-title">Ficha del evento</h2>
                                {currentEventImage ? (
                                    <div className="event-ficha-gallery">
                                        <div className="event-ficha-main-image-wrap">
                                            {selectedEventImageCount > 1 ? (
                                                <button
                                                    type="button"
                                                    className="event-ficha-nav prev"
                                                    onClick={() => setSelectedEventImageIndex((prev) => prev - 1)}
                                                >
                                                    ‹
                                                </button>
                                            ) : null}
                                            <img
                                                className="event-public-image event-ficha-main-image"
                                                src={currentEventImage}
                                                alt={`Foto ${safeSelectedEventImageIndex + 1} de ${selectedEvent.titulo}`}
                                            />
                                            {selectedEventImageCount > 1 ? (
                                                <button
                                                    type="button"
                                                    className="event-ficha-nav next"
                                                    onClick={() => setSelectedEventImageIndex((prev) => prev + 1)}
                                                >
                                                    ›
                                                </button>
                                            ) : null}
                                        </div>

                                        {selectedEventImageCount > 1 ? (
                                            <>
                                                <div className="event-ficha-counter">
                                                    {safeSelectedEventImageIndex + 1} / {selectedEventImageCount}
                                                </div>
                                                <div className="event-ficha-thumbs">
                                                    {selectedEventImages.map((img, idx) => (
                                                        <button
                                                            key={`${img}-${idx}`}
                                                            type="button"
                                                            className={`event-ficha-thumb ${idx === safeSelectedEventImageIndex ? "active" : ""}`}
                                                            onClick={() => setSelectedEventImageIndex(idx)}
                                                        >
                                                            <img src={img} alt={`Miniatura ${idx + 1} de ${selectedEvent.titulo}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                ) : null}
                                <div className="event-card-top" style={{ marginBottom: "0.6rem" }}>
                                    <span className="event-date">{selectedEvent?.fecha || "Fecha pendiente"}</span>
                                    <span className="event-location">{selectedEvent?.lugar || "Ubicación pendiente"}</span>
                                </div>
                                <h3 style={{ marginTop: 0 }}>{selectedEvent?.titulo || "Evento"}</h3>
                                {selectedEvent?.descripcion ? <p className="public-muted">{selectedEvent.descripcion}</p> : null}
                                <button
                                    type="button"
                                    className="volunteer-modal-submit"
                                    onClick={() => setModalStep("form")}
                                >
                                    Quiero apuntarme
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="volunteer-modal-title">Apuntarme al evento</h2>
                                <p className="public-muted" style={{ marginBottom: "1rem" }}>
                                    {selectedEvent?.titulo
                                        ? `Te apuntas a: ${selectedEvent.titulo}`
                                        : "Completa tus datos para apuntarte."}
                                </p>

                                <form onSubmit={handleSubmit} className="public-form">
                                    <input
                                        type="text"
                                        placeholder="Nombre completo *"
                                        required
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo electrónico *"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Teléfono (opcional)"
                                        value={form.telefono}
                                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                    />
                                    <textarea
                                        rows={3}
                                        placeholder="Mensaje (opcional)"
                                        value={form.mensaje}
                                        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                                    />
                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className="volunteer-modal-submit"
                                    >
                                        {enviando ? "Enviando..." : "Confirmar inscripción"}
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

