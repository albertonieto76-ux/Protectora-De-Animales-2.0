import { useDonaciones } from "../hooks/useDonaciones";
import { useState, useEffect } from "react";
import { getPaymentTypes } from "../services/api";
import { DonationTypeSelector } from "../components/DonationTypeSelector";
import "./EventosPage.css";
import "./PublicIndexVisual.css";

export default function DonacionesPage() {
    const { donaciones, loading, crear } = useDonaciones();
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [selectedDonationType, setSelectedDonationType] = useState("");
    const [form, setForm] = useState({
        cantidad: "",
        nombre: "",
        email: "",
        metodoId: "",
        tipoDonacion: "",
    });

    useEffect(() => {
        async function loadPaymentTypes() {
            try {
                const data = await getPaymentTypes();
                setPaymentTypes(data);
            } catch (err) {
                console.error("Error cargando métodos de pago:", err);
            }
        }
        loadPaymentTypes();
    }, []);

    if (loading) return <p className="loading-message">Cargando donaciones...</p>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        await crear(payload);
        setForm({ cantidad: "", nombre: "", email: "", metodoId: "", tipoDonacion: "" });
        setSelectedDonationType("");
    };

    const handleDonationTypeChange = (value) => {
        const defaultAmounts = {
            puntual: "20",
            veterinaria: "35",
            alimentacion: "25",
        };

        setSelectedDonationType(value);
        setForm((prev) => ({
            ...prev,
            tipoDonacion: value,
            cantidad: value ? defaultAmounts[value] || prev.cantidad : prev.cantidad,
        }));
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

    return (
        <div className="eventos-page public-shell">
            <section className="eventos-header public-hero">
                <h1>Donaciones</h1>
                <p>Apoya a la protectora y consulta el historial de aportaciones con formato editorial.</p>
            </section>

            <section className="donaciones-feature">
                <article className="event-card event-card-featured">
                    <div className="event-card-top">
                        <span className="event-date">Donación</span>
                        <span className="event-location">Nueva</span>
                    </div>
                    <h2 className="event-title">Quiero donar</h2>
                    <p className="event-description">Cada aportación ayuda a mejorar la vida de los animales rescatados.</p>
                    <form className="public-form" onSubmit={handleSubmit}>
                        <label className="public-muted" style={{ display: "block", marginBottom: "0.2rem" }}>
                            Tipo de donación
                        </label>
                        <DonationTypeSelector
                            value={selectedDonationType}
                            onChange={handleDonationTypeChange}
                        />
                        <input
                            placeholder="Cantidad"
                            value={form.cantidad}
                            onChange={(e) => setForm((prev) => ({ ...prev, cantidad: e.target.value }))}
                        />
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
                        <select
                            value={form.metodoId}
                            onChange={(e) => setForm({ ...form, metodoId: e.target.value })}
                            required
                        >
                            <option value="" disabled>Selecciona método de pago</option>
                            {paymentTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                        <button type="submit">Enviar donación</button>
                    </form>
                </article>
            </section>

            <section className="events-grid donaciones-feed">
                {donaciones.length === 0 ? (
                    <article className="event-card">
                        <div className="event-card-top">
                            <span className="event-date">Sin registros</span>
                            <span className="event-location">Donaciones</span>
                        </div>
                        <h2 className="event-title">Aún no hay donaciones</h2>
                        <p className="event-description">Tu ayuda puede ser la primera en impulsar esta causa.</p>
                    </article>
                ) : (
                    donaciones.map((d, index) => (
                        <article key={d.id} className={`event-card${index === 0 ? " event-card-featured" : ""}`}>
                            <div className="event-card-top">
                                <span className="event-date">{formatFecha(d.createdAt)}</span>
                                <span className="event-location">{d.metodo?.label || d.metodo || "Método"}</span>
                            </div>
                            <h2 className="event-title">{d.cantidad}€ · {d.nombre || "Donante anónimo"}</h2>
                            <p className="event-description">Aportación registrada para apoyar atención veterinaria y rescates.</p>
                            <div className="public-muted">{d.email || "Sin email"}</div>
                        </article>
                    ))
                )}
            </section>
        </div>
    );
}

