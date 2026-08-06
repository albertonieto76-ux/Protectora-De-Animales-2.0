import { useVoluntarios } from "../hooks/useVoluntarios";
import { useState } from "react";

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
            {/* ──────────────── HERO ──────────────── */}
            <section style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)",
                padding: "5rem 2rem 4rem",
                textAlign: "center",
                color: "white",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Círculos decorativos */}
                <div style={{
                    position: "absolute", top: "-60px", left: "-60px",
                    width: "240px", height: "240px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                }} />
                <div style={{
                    position: "absolute", bottom: "-40px", right: "-40px",
                    width: "180px", height: "180px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🙋</div>
                    <h1 style={{
                        fontSize: "2.8rem", fontWeight: "800",
                        margin: "0 0 1rem", letterSpacing: "-0.02em",
                        fontFamily: "Inter, sans-serif",
                    }}>
                        Únete como Voluntario
                    </h1>
                    <p style={{
                        fontSize: "1.15rem", maxWidth: "560px",
                        margin: "0 auto 2rem", opacity: 0.88, lineHeight: 1.6,
                    }}>
                        Tu tiempo y dedicación marcan la diferencia en la vida de nuestros animales.
                        Apúntate y empieza a ayudar hoy mismo.
                    </p>

                    <button
                        id="btn-suscribirse-voluntario"
                        onClick={() => setModalOpen(true)}
                        style={{
                            background: "white",
                            color: "#4f46e5",
                            border: "none",
                            padding: "1rem 2.5rem",
                            borderRadius: "50px",
                            fontSize: "1.05rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                            transition: "transform 0.25s ease, box-shadow 0.25s ease",
                            fontFamily: "Inter, sans-serif",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
                            e.currentTarget.style.boxShadow = "0 14px 40px rgba(0,0,0,0.28)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.2)";
                        }}
                    >
                        ✨ Quiero ser voluntario
                    </button>
                </div>
            </section>

            {/* ──────────────── STATS RÁPIDOS ──────────────── */}
            <section style={{
                display: "flex", justifyContent: "center", gap: "2rem",
                flexWrap: "wrap", padding: "2.5rem 2rem",
                background: "#f8faff",
            }}>
                {[
                    { icon: "👥", value: loading ? "..." : voluntarios.length, label: "Voluntarios activos" },
                    { icon: "🐾", value: "14+", label: "Animales atendidos" },
                    { icon: "📅", value: "Flexible", label: "Horario adaptable" },
                ].map((s, i) => (
                    <div key={i} style={{
                        textAlign: "center", minWidth: "160px",
                        padding: "1.5rem 2rem",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 4px 16px rgba(79,70,229,0.08)",
                    }}>
                        <div style={{ fontSize: "2rem" }}>{s.icon}</div>
                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#4f46e5", marginTop: "0.25rem" }}>{s.value}</div>
                        <div style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "0.2rem" }}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ──────────────── LISTADO ──────────────── */}
            <section style={{ padding: "2rem 2rem 4rem", maxWidth: "900px", margin: "0 auto" }}>
                <h2 style={{
                    fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem",
                    color: "#1f2937", fontFamily: "Inter, sans-serif",
                }}>
                    Nuestros voluntarios
                </h2>

                {loading ? (
                    <p style={{ color: "#6b7280" }}>Cargando voluntarios...</p>
                ) : voluntarios.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontStyle: "italic" }}>Aún no hay voluntarios registrados. ¡Sé el primero!</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                        {voluntarios.map((v) => (
                            <div key={v.id} style={{
                                background: "white", borderRadius: "14px",
                                padding: "1.25rem 1.5rem",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                                borderLeft: "4px solid #4f46e5",
                                transition: "transform 0.2s ease",
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "#1f2937", marginBottom: "0.35rem" }}>
                                    🙋 {v.nombre}
                                </div>
                                <div style={{ fontSize: "0.88rem", color: "#6b7280" }}>✉️ {v.email}</div>
                                {v.telefono && <div style={{ fontSize: "0.88rem", color: "#6b7280" }}>📞 {v.telefono}</div>}
                                {v.disponibilidad && (
                                    <span style={{
                                        display: "inline-block", marginTop: "0.6rem",
                                        background: "#ede9fe", color: "#6d28d9",
                                        padding: "0.2rem 0.75rem", borderRadius: "20px",
                                        fontSize: "0.8rem", fontWeight: "600",
                                    }}>
                                        🕐 {v.disponibilidad}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ──────────────── MODAL ──────────────── */}
            {modalOpen && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
                    style={{
                        position: "fixed", inset: 0, zIndex: 2000,
                        background: "rgba(15,10,40,0.55)",
                        backdropFilter: "blur(6px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "1rem",
                        animation: "fadeInOverlay 0.2s ease",
                    }}
                >
                    <div style={{
                        background: "white", borderRadius: "20px",
                        padding: "2.5rem", width: "100%", maxWidth: "460px",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                        animation: "slideUpModal 0.3s cubic-bezier(0.16,1,0.3,1)",
                        position: "relative",
                    }}>
                        {/* Cerrar */}
                        <button
                            onClick={() => setModalOpen(false)}
                            style={{
                                position: "absolute", top: "1rem", right: "1rem",
                                background: "#f3f4f6", border: "none", borderRadius: "50%",
                                width: "32px", height: "32px", cursor: "pointer",
                                fontSize: "1rem", color: "#6b7280",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >✕</button>

                        {enviado ? (
                            <div style={{ textAlign: "center", padding: "1rem 0" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#10b981" }}>¡Gracias!</h3>
                                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Te has inscrito como voluntario correctamente.</p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{
                                    fontSize: "1.5rem", fontWeight: "800", color: "#1f2937",
                                    marginBottom: "0.4rem", fontFamily: "Inter, sans-serif",
                                }}>
                                    Inscríbete como voluntario
                                </h2>
                                <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
                                    Rellena el formulario y nos pondremos en contacto contigo.
                                </p>

                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                                            style={{
                                                padding: "0.85rem 1rem", borderRadius: "10px",
                                                border: "1.5px solid #e5e7eb", fontSize: "0.95rem",
                                                outline: "none", fontFamily: "Inter, sans-serif",
                                                transition: "border-color 0.2s ease",
                                            }}
                                            onFocus={e => e.target.style.borderColor = "#4f46e5"}
                                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                        />
                                    ))}

                                    <select
                                        value={form.disponibilidad}
                                        onChange={(e) => setForm({ ...form, disponibilidad: e.target.value })}
                                        style={{
                                            padding: "0.85rem 1rem", borderRadius: "10px",
                                            border: "1.5px solid #e5e7eb", fontSize: "0.95rem",
                                            outline: "none", background: "white",
                                            fontFamily: "Inter, sans-serif", color: form.disponibilidad ? "#1f2937" : "#9ca3af",
                                        }}
                                    >
                                        <option value="" disabled>Disponibilidad horaria</option>
                                        {DISPONIBILIDADES.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        style={{
                                            marginTop: "0.5rem",
                                            background: enviando
                                                ? "#a5b4fc"
                                                : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                            color: "white", border: "none",
                                            padding: "1rem", borderRadius: "12px",
                                            fontSize: "1rem", fontWeight: "700",
                                            cursor: enviando ? "not-allowed" : "pointer",
                                            transition: "opacity 0.2s, transform 0.2s",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                        onMouseEnter={e => { if (!enviando) e.currentTarget.style.transform = "translateY(-2px)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                                    >
                                        {enviando ? "Enviando..." : "🙋 Inscribirme como voluntario"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Animaciones globales */}
            <style>{`
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpModal {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
}
