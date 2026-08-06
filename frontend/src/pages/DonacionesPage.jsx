import { useDonaciones } from "../hooks/useDonaciones";
import { useState, useEffect } from "react";
import { getPaymentTypes } from "../services/api";

export default function DonacionesPage() {
    const { donaciones, loading, crear } = useDonaciones();
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [form, setForm] = useState({
        cantidad: "",
        nombre: "",
        email: "",
        metodoId: "",
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

    if (loading) return <p>Cargando donaciones...</p>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await crear(form);
        setForm({ cantidad: "", nombre: "", email: "", metodoId: "" });
    };

    return (
        <div>
            <h1>Donaciones</h1>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Cantidad"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
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
                <button type="submit">Crear donación</button>
            </form>

            <ul>
                {donaciones.map((d) => (
                    <li key={d.id}>
                        {d.cantidad}€ — {d.nombre} — {d.metodo?.label || d.metodo}
                    </li>
                ))}
            </ul>
        </div>
    );
}

