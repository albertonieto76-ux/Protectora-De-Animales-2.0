import { useEventos } from "../hooks/useEventos";
import "./EventosPage.css";

export default function EventosPage() {
    const { eventos, loading } = useEventos();

    if (loading) return <p className="loading-message">Cargando eventos...</p>;

    return (
        <div className="eventos-page">
            <header className="eventos-header">
                <h1>Eventos</h1>
                <p>Explora las próximas actividades y encuentros organizados por la protectora.</p>
            </header>

            <div className="events-grid">
                {eventos.map((ev) => (
                    <article key={ev.id} className="event-card">
                        <div className="event-card-top">
                            <span className="event-date">{ev.fecha}</span>
                            <span className="event-location">{ev.lugar}</span>
                        </div>
                        <h2 className="event-title">{ev.titulo}</h2>
                        {ev.descripcion && <p className="event-description">{ev.descripcion}</p>}
                    </article>
                ))}
            </div>
        </div>
    );
}

