import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createVoluntario, getAnimales, createAdopcion, createDonacion, getPaymentTypes } from "../services/api";
import "./Navbar.css";

const DISPONIBILIDADES = ["Fines de semana", "Entre semana", "Mañanas", "Tardes", "Flexible"];
const formVolInicial = { nombre: "", email: "", telefono: "", disponibilidad: "" };
const formAdopInicial = { nombre: "", email: "", telefono: "", mensaje: "" };
const formDonacionInicial = { cantidad: "", nombre: "", email: "", metodoId: "" };

export default function Navbar() {
  const [isAdminOpen, setIsAdminOpen]     = useState(false);

  // Modal voluntario
  const [volModalOpen, setVolModalOpen]   = useState(false);
  const [volForm, setVolForm]             = useState(formVolInicial);
  const [volEnviando, setVolEnviando]     = useState(false);
  const [volEnviado, setVolEnviado]       = useState(false);

  // Modal adopción
  const [adopModalOpen, setAdopModalOpen] = useState(false);
  const [animales, setAnimales]           = useState([]);
  const [animalesLoading, setAnimalesLoading] = useState(false);
  const [selectedAnimal, setSelectedAnimal]   = useState(null); // paso 1 → paso 2
  const [adopForm, setAdopForm]           = useState(formAdopInicial);
  const [adopEnviando, setAdopEnviando]   = useState(false);
  const [adopEnviado, setAdopEnviado]     = useState(false);

  // Modal donación
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationForm, setDonationForm]           = useState(formDonacionInicial);
  const [donationSending, setDonationSending]     = useState(false);
  const [donationSent, setDonationSent]           = useState(false);
  const [paymentTypes, setPaymentTypes]           = useState([]);
  const [copiedAccount, setCopiedAccount]         = useState(null);

  const location = useLocation();
  const dropdownRef = useRef(null);

  const showAdminMenu = location.pathname !== "/" && location.pathname !== "/eventos";

  /* ── cerrar dropdown al click fuera ── */
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsAdminOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── bloquear scroll con cualquier modal abierto ── */
  const anyModal = volModalOpen || adopModalOpen || donationModalOpen;
  useEffect(() => {
    document.body.style.overflow = anyModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModal]);

  useEffect(() => {
    async function loadPaymentTypes() {
      try {
        const data = await getPaymentTypes();
        setPaymentTypes(data);
      } catch (err) {
        console.error("Error cargando tipos de pago:", err);
      }
    }
    loadPaymentTypes();
  }, []);

  const handleCopyAccount = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(text);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      console.error("Error copiando cuenta:", err);
    }
  };

  /* ── cargar animales al abrir modal adopción ── */
  const openAdopModal = async () => {
    setAdopModalOpen(true);
    setSelectedAnimal(null);
    setAdopForm(formAdopInicial);
    setAdopEnviado(false);
    setAnimalesLoading(true);
    try {
      const data = await getAnimales();
      setAnimales(data);
    } catch {
      setAnimales([]);
    } finally {
      setAnimalesLoading(false);
    }
  };

  /* ── submit voluntario ── */
  const handleVolSubmit = async (e) => {
    e.preventDefault();
    setVolEnviando(true);
    try {
      await createVoluntario(volForm);
      setVolEnviado(true);
      setVolForm(formVolInicial);
      setTimeout(() => { setVolEnviado(false); setVolModalOpen(false); }, 2200);
    } catch (err) {
      console.error("Error al inscribir voluntario:", err);
    } finally {
      setVolEnviando(false);
    }
  };

  /* ── submit solicitud adopción ── */
  const handleAdopSubmit = async (e) => {
    e.preventDefault();
    setAdopEnviando(true);
    try {
      await createAdopcion({ ...adopForm, animalId: selectedAnimal.id });
      setAdopEnviado(true);
      setTimeout(() => { setAdopEnviado(false); setAdopModalOpen(false); setSelectedAnimal(null); }, 2400);
    } catch (err) {
      console.error("Error al crear solicitud:", err);
    } finally {
      setAdopEnviando(false);
    }
  };

  /* ── submit donación ── */
  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setDonationSending(true);
    try {
      await createDonacion(donationForm);
      setDonationSent(true);
      setDonationForm(formDonacionInicial);
      setTimeout(() => { setDonationSent(false); setDonationModalOpen(false); }, 2400);
    } catch (err) {
      console.error("Error al enviar donación:", err);
    } finally {
      setDonationSending(false);
    }
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="nav-right">
          {/* ── Botón Adopta Amigos ── */}
          <button
            id="btn-adopta-amigos"
            className="adopt-cta-btn"
            onClick={openAdopModal}
          >
            🐾 Adopta Amigos
          </button>

          {/* ── Botón Informar Evento ── */}
          <Link to="/eventos" className="event-cta-btn">
            📅 Eventos
          </Link>

          {/* ── Botón Donar ── */}
          <button
            className="donation-cta-btn"
            onClick={() => { setDonationForm(formDonacionInicial); setDonationSent(false); setDonationModalOpen(true); }}
          >
            💳 Donar
          </button>

          {/* ── Botón Ser Voluntario ── */}
          <button
            id="btn-navbar-voluntario"
            className="volunteer-cta-btn"
            onClick={() => { setVolForm(formVolInicial); setVolEnviado(false); setVolModalOpen(true); }}
          >
            🙋 Ser Voluntario
          </button>

          {showAdminMenu && (
            <div className="admin-dropdown-container" ref={dropdownRef}>
              <button
                className={`admin-trigger-btn ${isAdminOpen ? "active" : ""}`}
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                aria-expanded={isAdminOpen}
              >
                <span>⚙️ Panel Admin</span>
                <span className={`dropdown-chevron ${isAdminOpen ? "open" : ""}`}>▼</span>
              </button>

              {isAdminOpen && (
                <div className="admin-menu-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-title">Administración</p>
                    <p className="dropdown-subtitle">Gestión del Sistema</p>
                  </div>
                  <div className="dropdown-section">
                    <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setIsAdminOpen(false)}><span className="item-icon">📊</span><span>Dashboard General</span></Link>
                    <Link to="/admin/animals"   className="dropdown-item" onClick={() => setIsAdminOpen(false)}><span className="item-icon">🐾</span><span>Gestionar Animales</span></Link>
                    <Link to="/admin/adoptions" className="dropdown-item" onClick={() => setIsAdminOpen(false)}><span className="item-icon">❤️</span><span>Solicitudes Adopción</span></Link>
                    <Link to="/admin/volunteers" className="dropdown-item" onClick={() => setIsAdminOpen(false)}><span className="item-icon">🙋</span><span>Gestionar Voluntarios</span></Link>
                    <Link to="/admin/events"    className="dropdown-item" onClick={() => setIsAdminOpen(false)}><span className="item-icon">📅</span><span>Gestionar Eventos</span></Link>
                    <Link to="/admin/donations" className="dropdown-item" onClick={() => setIsAdminOpen(false)}><span className="item-icon">💳</span><span>Registro Donaciones</span></Link>
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-footer">
                    <span>Modo Admin</span>
                    <span className="status-badge"><span className="status-dot" /> Activo</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ══════════ MODAL ADOPTA AMIGOS ══════════ */}
      {adopModalOpen && (
        <div
          className="volunteer-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setAdopModalOpen(false); }}
        >
          <div className="volunteer-modal adopt-modal">
            <button className="modal-close-btn" onClick={() => setAdopModalOpen(false)}>✕</button>

            {/* PASO 3: Éxito */}
            {adopEnviado && (
              <div className="modal-success">
                <div className="success-icon">🎉</div>
                <h3>¡Solicitud enviada!</h3>
                <p>Nos pondremos en contacto contigo pronto para gestionar la adopción de <strong>{selectedAnimal?.name}</strong>.</p>
              </div>
            )}

            {/* PASO 2: Formulario */}
            {!adopEnviado && selectedAnimal && (
              <>
                <button className="back-btn" onClick={() => setSelectedAnimal(null)}>← Volver a los animales</button>
                <div className="modal-header">
                  <span className="modal-emoji">❤️</span>
                  <h2>Adoptar a <em>{selectedAnimal.name}</em></h2>
                  <p>{selectedAnimal.species}{selectedAnimal.age ? ` · ${selectedAnimal.age} años` : ""}</p>
                </div>
                <form onSubmit={handleAdopSubmit} className="modal-form">
                  <input type="text"  placeholder="Tu nombre completo *" required className="modal-input" value={adopForm.nombre}   onChange={(e) => setAdopForm({ ...adopForm, nombre:   e.target.value })} />
                  <input type="email" placeholder="Tu correo electrónico *" required className="modal-input" value={adopForm.email}    onChange={(e) => setAdopForm({ ...adopForm, email:    e.target.value })} />
                  <input type="tel"   placeholder="Teléfono (opcional)"  className="modal-input" value={adopForm.telefono} onChange={(e) => setAdopForm({ ...adopForm, telefono: e.target.value })} />
                  <textarea
                    placeholder="¿Por qué quieres adoptar a este animal? (opcional)"
                    className="modal-input modal-textarea"
                    rows={3}
                    value={adopForm.mensaje}
                    onChange={(e) => setAdopForm({ ...adopForm, mensaje: e.target.value })}
                  />
                  <button type="submit" disabled={adopEnviando} className={`modal-submit-btn adopt-submit ${adopEnviando ? "loading" : ""}`}>
                    {adopEnviando ? "Enviando solicitud..." : `🐾 Solicitar adopción de ${selectedAnimal.name}`}
                  </button>
                </form>
              </>
            )}

            {/* PASO 1: Galería de animales */}
            {!adopEnviado && !selectedAnimal && (
              <>
                <div className="modal-header">
                  <span className="modal-emoji">🐾</span>
                  <h2>Adopta Amigos</h2>
                  <p>Elige el animal que quieres acoger en tu hogar y envía tu solicitud.</p>
                </div>

                {animalesLoading ? (
                  <p className="adopt-loading">Cargando animales disponibles...</p>
                ) : animales.length === 0 ? (
                  <p className="adopt-empty">No hay animales disponibles en este momento.</p>
                ) : (
                  <div className="animals-grid">
                    {animales.map((a) => (
                      <button
                        key={a.id}
                        className="animal-card-btn"
                        onClick={() => { setSelectedAnimal(a); setAdopForm(formAdopInicial); }}
                      >
                        <div className="animal-card-img">
                          {a.imageUrl
                            ? <img src={a.imageUrl} alt={a.name} />
                            : <span className="animal-placeholder">{a.species === "Perro" ? "🐶" : a.species === "Gato" ? "🐱" : "🐾"}</span>
                          }
                        </div>
                        <div className="animal-card-info">
                          <strong>{a.name}</strong>
                          <span>{a.species}{a.age ? ` · ${a.age} años` : ""}</span>
                          {a.description && <span className="animal-desc">{a.description}</span>}
                        </div>
                        <span className="animal-adopt-tag">Adoptar →</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════ MODAL VOLUNTARIO ══════════ */}
      {donationModalOpen && (
        <div
          className="volunteer-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setDonationModalOpen(false); }}
        >
          <div className="volunteer-modal">
            <button className="modal-close-btn" onClick={() => setDonationModalOpen(false)}>✕</button>

            {donationSent ? (
              <div className="modal-success">
                  <div className="success-icon">🎉</div>
                  <h3>¡Gracias por tu compromiso!</h3>
                  <p>Tu donación ha sido recibida. ¡Muchísimas gracias!</p>
                </div>
            ) : (
              <>
                <div className="modal-header">
                  <span className="modal-emoji">💳</span>
                  <h2>Donar</h2>
                  <p>Elige el monto y la forma de pago para apoyar a nuestros animales.</p>
                </div>
                <form onSubmit={handleDonationSubmit} className="modal-form">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Cantidad (€) *"
                    required
                    className="modal-input"
                    value={donationForm.cantidad}
                    onChange={(e) => setDonationForm({ ...donationForm, cantidad: e.target.value })}
                  />
                  <input type="text" placeholder="Nombre completo *" required className="modal-input" value={donationForm.nombre} onChange={(e) => setDonationForm({ ...donationForm, nombre: e.target.value })} />
                  <input type="email" placeholder="Correo electrónico *" required className="modal-input" value={donationForm.email} onChange={(e) => setDonationForm({ ...donationForm, email: e.target.value })} />
                  <select
                    required
                    className="modal-input modal-select"
                    value={donationForm.metodoId}
                    onChange={(e) => setDonationForm({ ...donationForm, metodoId: Number(e.target.value) })}
                  >
                    <option value="" disabled>Selecciona método de pago</option>
                    {paymentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>

                  {/* Mostrar la cuenta/PayPal asociada al método seleccionado */}
                  {(() => {
                    const selected = paymentTypes.find(
                      (p) => p.id === donationForm.metodoId || String(p.id) === String(donationForm.metodoId)
                    );
                    if (!selected) return null;
                    const lowerLabel = (selected.label || "").toLowerCase();
                    let descriptor = "";
                    if (lowerLabel.includes("paypal")) descriptor = "Cuenta PayPal";
                    else if (lowerLabel.includes("bizum") || lowerLabel.includes("telefono") || lowerLabel.includes("móvil") || lowerLabel.includes("movil")) descriptor = "Número Bizum";
                    else if (lowerLabel.includes("tarjeta") || lowerLabel.includes("card") || lowerLabel.includes("credito")) descriptor = "Cuenta bancaria";
                    else descriptor = "Cuenta/PayPal";

                    return (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.95rem", color: "#374151", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div>
                          <strong>{selected.label}{descriptor ? ` (${descriptor})` : ""}:</strong>
                          {selected.account ? (
                            <span style={{ marginLeft: "0.5rem", color: "#111" }}>{selected.account}</span>
                          ) : (
                            <em style={{ marginLeft: "0.5rem", color: "#6b7280" }}>No configurada</em>
                          )}
                        </div>
                        {selected.account && (
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(selected.account)}
                            className="copy-account-btn"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", cursor: "pointer" }}
                          >
                            {copiedAccount === selected.account ? "Copiado" : "Copiar"}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                  <button type="submit" disabled={donationSending} className={`modal-submit-btn ${donationSending ? "loading" : ""}`}>
                    {donationSending ? "Enviando..." : "💚 Donar"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {volModalOpen && (
        <div
          className="volunteer-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setVolModalOpen(false); }}
        >
          <div className="volunteer-modal">
            <button className="modal-close-btn" onClick={() => setVolModalOpen(false)}>✕</button>

            {volEnviado ? (
              <div className="modal-success">
                <div className="success-icon">🎉</div>
                <h3>¡Gracias por apuntarte!</h3>
                <p>Nos pondremos en contacto contigo muy pronto.</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <span className="modal-emoji">🙋</span>
                  <h2>Inscríbete como voluntario</h2>
                  <p>Tu ayuda marca la diferencia. Rellena el formulario y te contactamos.</p>
                </div>
                <form onSubmit={handleVolSubmit} className="modal-form">
                  <input type="text"  placeholder="Nombre completo *"      required className="modal-input" value={volForm.nombre}        onChange={(e) => setVolForm({ ...volForm, nombre:        e.target.value })} />
                  <input type="email" placeholder="Correo electrónico *"   required className="modal-input" value={volForm.email}         onChange={(e) => setVolForm({ ...volForm, email:         e.target.value })} />
                  <input type="tel"   placeholder="Teléfono (opcional)"             className="modal-input" value={volForm.telefono}      onChange={(e) => setVolForm({ ...volForm, telefono:      e.target.value })} />
                  <select value={volForm.disponibilidad} onChange={(e) => setVolForm({ ...volForm, disponibilidad: e.target.value })} className="modal-input modal-select">
                    <option value="" disabled>Disponibilidad horaria</option>
                    {DISPONIBILIDADES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button type="submit" disabled={volEnviando} className={`modal-submit-btn ${volEnviando ? "loading" : ""}`}>
                    {volEnviando ? "Enviando..." : "✨ Inscribirme como voluntario"}
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
