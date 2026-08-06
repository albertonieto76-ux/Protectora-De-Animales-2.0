import { useAdopciones } from "../hooks/useAdopciones";
import { useState } from "react";

export default function AdopcionesPage() {
    const { adopciones, loading, crear } = useAdopciones();
    const [form, setForm] = useState({
        animalId: "",
        nombre: "",
        email: "",
        mensaje: "",
    });

    if (loading) return <p>Cargando solicitudes...</p>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await crear(form);
        setForm({ animalId: "", nombre: "", email: "", mensaje: "" });
    };

    return (
        <div>
            <h1>Solicitudes de Adopción</h1>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="ID Animal"
                    value={form.animalId}
                    onChange={(e) => setForm({ ...form, animalId: e.target.value })}
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
                <textarea
                    placeholder="Mensaje"
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                />
                <button type="submit">Crear solicitud</button>
            </form>

            <ul>
                {adopciones.map((a) => (
                    <li key={a.id}>
                        Animal #{a.animalId} — {a.nombre} — {a.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

