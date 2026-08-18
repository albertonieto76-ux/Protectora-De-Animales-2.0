import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createVoluntario, getAnimales, createAdopcion, createDonacion, getPaymentTypes } from "../services/api";
import { VolunteerAvailabilitySelector } from "./VolunteerAvailabilitySelector";
import { broadcastVolunteerUpdated } from "../utils/volunteerSignals";
import { DonationTypeSelector } from "./DonationTypeSelector";
import "./Navbar.css";

const DISPONIBILIDADES = ["Fines de semana", "Entre semana", "Mañanas", "Tardes", "Flexible"];
const formVolInicial = { nombre: "", email: "", telefono: "", disponibilidad: "" };
const formAdopInicial = { nombre: "", email: "", telefono: "", mensaje: "" };
const formDonacionInicial = { cantidad: "", nombre: "", email: "", metodoId: "", tipoDonacion: "" };
const DONATION_PRESETS = {
  puntual: { label: "Aporte puntual", amount: "20" },
  veterinaria: { label: "Veterinaria", amount: "35" },
  alimentacion: { label: "Alimentación", amount: "25" },
};
const ADOPTION_MODAL_IMAGE = "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80";
const ADOPTION_LOCAL_FALLBACK_IMAGE = "/hero-hamsters.jpg";
const DONATION_MODAL_IMAGE = "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80";
const VOLUNTEER_MODAL_IMAGE = "https://images.unsplash.com/photo-1526976668912-1a811878dd37?auto=format&fit=crop&w=1200&q=80";
const VOLUNTEER_SMILE_IMAGE = "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80";

export default function Navbar() {
  const [isAdminOpen, setIsAdminOpen]     = useState(false);

  // Modal voluntario
  const [volModalOpen, setVolModalOpen]   = useState(false);
  const [volForm, setVolForm]             = useState(formVolInicial);
  const [volEnviando, setVolEnviando]     = useState(false);
  const [volEnviado, setVolEnviado]       = useState(false);
  const [volError, setVolError]           = useState("");

  // Modal adopción
  const [adopModalOpen, setAdopModalOpen] = useState(false);
  const [animales, setAnimales]           = useState([]);
  const [animalesLoading, setAnimalesLoading] = useState(false);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [filterSpecies, setFilterSpecies] = useState("Todos");
  const [selectedAnimal, setSelectedAnimal]   = useState(null); // paso 1 → paso 2
  const [selectedAnimalImages, setSelectedAnimalImages] = useState([]);
  const [showAnimalDetails, setShowAnimalDetails] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [adopForm, setAdopForm]           = useState(formAdopInicial);
  const [adopEnviando, setAdopEnviando]   = useState(false);
  const [adopEnviado, setAdopEnviado]     = useState(false);

  // Modal donación
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationForm, setDonationForm]           = useState(formDonacionInicial);
  const [donationSending, setDonationSending]     = useState(false);
  const [donationSent, setDonationSent]           = useState(false);
  const [donationPreset, setDonationPreset]       = useState("puntual");
  const [paymentTypes, setPaymentTypes]           = useState([]);
  const [copiedAccount, setCopiedAccount]         = useState(null);

  const location = useLocation();
  const dropdownRef = useRef(null);

  const showAdminMenu = location.pathname !== "/" && location.pathname !== "/eventos";

  const closePageLevelModals = () => {
    window.dispatchEvent(new Event("close-page-level-modals"));
  };

  const closeNavbarModals = () => {
    setAdopModalOpen(false);
    setDonationModalOpen(false);
    setVolModalOpen(false);
    setAdopEnviado(false);
    setDonationSent(false);
    setVolEnviado(false);
  };

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

  // Close open modals when navigating to another route so pages are never blocked.
  useEffect(() => {
    closeNavbarModals();
    setIsAdminOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const activeImagesLength = selectedAnimalImages.length || selectedAnimal?.images?.length || 0;
    if (!adopModalOpen || !showAnimalDetails || !activeImagesLength) return;

    const handleArrowNavigation = (event) => {
      if (event.key === "ArrowRight") {
        setSelectedImageIndex((current) => (current + 1) % activeImagesLength);
      }
      if (event.key === "ArrowLeft") {
        setSelectedImageIndex((current) => (current - 1 + activeImagesLength) % activeImagesLength);
      }
    };

    window.addEventListener("keydown", handleArrowNavigation);
    return () => window.removeEventListener("keydown", handleArrowNavigation);
  }, [adopModalOpen, showAnimalDetails, selectedAnimal, selectedAnimalImages]);

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

  const getAnimalSpecies = (animal) =>
    animal?.species || animal?.especie || animal?.type || animal?.tipo || "";

  const normalizeImageSource = (input) => {
    if (typeof input === "string") {
      const value = input.trim();
      return value || null;
    }

    if (input && typeof input === "object") {
      const candidate = input.url || input.src || input.path || input.image || input.foto || input.photo || input.thumbnail;
      return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
    }

    return null;
  };

  const getValidAnimalImages = (animal) => {
    const fromArray = Array.isArray(animal?.images) ? animal.images : [];
    const fromString = typeof animal?.images === "string"
      ? (() => {
          const raw = animal.images.trim();
          if (!raw) return [];
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === "object") {
              return [parsed];
            }
            return [raw];
          } catch {
            return raw.includes(",") ? raw.split(",") : [raw];
          }
        })()
      : [];
    const fromLegacy = [animal?.image, animal?.foto, animal?.photo, animal?.thumbnail].filter(Boolean);

    return [...fromArray, ...fromString, ...fromLegacy]
      .map((img) => normalizeImageSource(img))
      .filter(Boolean);
  };

  const getFirstAnimalImage = (animal) => {
    const images = getValidAnimalImages(animal);
    return images[0] || ADOPTION_LOCAL_FALLBACK_IMAGE;
  };

  const buildFallbackChain = (primarySrc, candidates = []) => {
    const normalized = [primarySrc, ...candidates, ADOPTION_MODAL_IMAGE, ADOPTION_LOCAL_FALLBACK_IMAGE]
      .filter((src) => typeof src === "string")
      .map((src) => src.trim())
      .filter(Boolean);

    return Array.from(new Set(normalized));
  };

  const handleImageFallback = (event, chain = []) => {
    const imgEl = event.currentTarget;
    if (!imgEl) return;

    const currentIndex = Number(imgEl.dataset.fallbackIndex || "0");
    const nextIndex = currentIndex + 1;

    if (nextIndex < chain.length) {
      imgEl.dataset.fallbackIndex = String(nextIndex);
      imgEl.src = chain[nextIndex];
      return;
    }

    // Guaranteed last-resort local image to avoid empty cards/details.
    imgEl.onerror = null;
    imgEl.src = ADOPTION_LOCAL_FALLBACK_IMAGE;
  };

  const handleImageLoad = (event) => {
    const imgEl = event.currentTarget;
    if (!imgEl) return;
    imgEl.style.display = "";
  };

  const getPreferredImageIndex = () => {
    return 0;
  };

  const getAnimalPreviewImage = (animal, cardIndex = 0) => {
    const images = getValidAnimalImages(animal);
    if (!images.length) return ADOPTION_LOCAL_FALLBACK_IMAGE;
    const preferredIndex = getPreferredImageIndex(animal, cardIndex);
    return images[preferredIndex] || images[0] || ADOPTION_LOCAL_FALLBACK_IMAGE;
  };

  const getAnimalDetailImages = (animal, preferredIndex = 0, maxImages = 4) => {
    const source = getValidAnimalImages(animal);
    if (!source.length) return [ADOPTION_LOCAL_FALLBACK_IMAGE];
    if (source.length <= maxImages) return source;
    return source.slice(0, maxImages);
  };

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

  const applyDonationPreset = (presetKey) => {
    const preset = DONATION_PRESETS[presetKey];
    if (!preset) return;
    setDonationPreset(presetKey);
    setDonationForm((prev) => ({ ...prev, cantidad: preset.amount, tipoDonacion: presetKey }));
  };

  /* ── cargar animales al abrir modal adopción ── */
  const openAdopModal = async () => {
    setAdopModalOpen(true);
    setSelectedAnimal(null);
    setSelectedAnimalImages([]);
    setShowAnimalDetails(false);
    setSelectedImageIndex(0);
    setAdopForm(formAdopInicial);
    setFilterSpecies("Todos");
    setAdopEnviado(false);
    setAnimalesLoading(true);
    try {
      const data = await getAnimales();
      setAnimales(data);
      const species = Array.from(
        new Set([
          ...data.map((animal) => getAnimalSpecies(animal)).filter(Boolean),
          "Otros",
        ])
      );
      setSpeciesOptions(species);
    } catch {
      setAnimales([]);
      setSpeciesOptions([]);
    } finally {
      setAnimalesLoading(false);
    }
  };

  /* ── submit voluntario ── */
  const handleVolSubmit = async (e) => {
    e.preventDefault();
    setVolEnviando(true);
    setVolError("");
    try {
      await createVoluntario(volForm);
      broadcastVolunteerUpdated({ source: "navbar-volunteer-form" });
      setVolEnviado(true);
      setVolForm(formVolInicial);
      setTimeout(() => { setVolEnviado(false); setVolModalOpen(false); }, 2200);
    } catch (err) {
      console.error("Error al inscribir voluntario:", err);
      setVolError(err instanceof Error ? err.message : "No se pudo completar la inscripción. Inténtalo de nuevo.");
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
      setTimeout(() => { setAdopEnviado(false); setAdopModalOpen(false); setSelectedAnimal(null); setSelectedAnimalImages([]); }, 2400);
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
      const payload = {
        ...donationForm,
        tipoDonacion: donationForm.tipoDonacion || donationPreset || "",
      };
      await createDonacion(payload);
      setDonationSent(true);
      setDonationForm(formDonacionInicial);
      setDonationPreset("puntual");
      setTimeout(() => { setDonationSent(false); setDonationModalOpen(false); }, 2400);
    } catch (err) {
      console.error("Error al enviar donación:", err);
    } finally {
      setDonationSending(false);
    }
  };

  const filteredAnimales = animales.filter((a) => {
    const especie = getAnimalSpecies(a);
    const knownSpecies = speciesOptions.filter((option) => option !== "Otros");

    if (filterSpecies === "Todos") return true;
    if (filterSpecies === "Otros") {
      return !especie || !knownSpecies.includes(especie);
    }

    return especie === filterSpecies;
  });

  const visibleSpeciesOptions = speciesOptions.filter((option) => {
    if (option === "Otros") {
      return animales.some((animal) => {
        const especie = getAnimalSpecies(animal);
        return !especie || !speciesOptions.filter((item) => item !== "Otros").includes(especie);
      });
    }

    return animales.some((animal) => getAnimalSpecies(animal) === option);
  });

  const fallbackDetailImages = selectedAnimal
    ? getAnimalDetailImages(selectedAnimal, getPreferredImageIndex(selectedAnimal), 4)
    : [];
  const activeDetailImages = selectedAnimalImages.length > 0 ? selectedAnimalImages : fallbackDetailImages;
  const safeDetailIndex = activeDetailImages.length > 0 ? selectedImageIndex % activeDetailImages.length : 0;
  const currentDetailImage =
    activeDetailImages[safeDetailIndex] ||
    getFirstAnimalImage(selectedAnimal) ||
    ADOPTION_LOCAL_FALLBACK_IMAGE;
  const currentDetailFallbackChain = selectedAnimal
    ? buildFallbackChain(currentDetailImage, getValidAnimalImages(selectedAnimal))
    : [ADOPTION_LOCAL_FALLBACK_IMAGE];

  return (
    <>
      <nav className={`main-navbar ${location.pathname === "/" ? "home-navbar" : ""}`}>
        <div className="nav-right">
          {/* ── Botón Adopta Amigos ── */}
          <button
            id="btn-adopta-amigos"
            className="adopt-cta-btn"
            onClick={() => {
              closeNavbarModals();
              closePageLevelModals();
              openAdopModal();
            }}
          >
            🐾 Adopta Amigos
          </button>

          {/* ── Botón Informar Evento ── */}
          <Link
            to="/eventos"
            className="event-cta-btn"
            onClick={() => {
              closeNavbarModals();
              closePageLevelModals();
            }}
          >
            🗓️ Eventos
          </Link>

          {/* ── Botón Donar ── */}
          <button
            className="donation-cta-btn"
            onClick={() => {
              closeNavbarModals();
              closePageLevelModals();
              setDonationForm({ ...formDonacionInicial, cantidad: DONATION_PRESETS.puntual.amount });
              setDonationPreset("puntual");
              setDonationSent(false);
              setDonationModalOpen(true);
            }}
          >
            💳 Donar
          </button>

          {/* ── Botón Ser Voluntario ── */}
          <button
            id="btn-navbar-voluntario"
            className="volunteer-cta-btn"
            onClick={() => {
              closeNavbarModals();
              closePageLevelModals();
              setVolForm(formVolInicial);
              setVolEnviado(false);
              setVolError("");
              setVolModalOpen(true);
            }}
          >
            🤝 Ser Voluntario
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

            {/* PASO 2: Detalle del animal */}
            {!adopEnviado && selectedAnimal && showAnimalDetails && (
              <>
                <button className="back-btn" onClick={() => { setSelectedAnimal(null); setSelectedAnimalImages([]); setShowAnimalDetails(false); }}>← Volver a los animales</button>
                <div className="modal-editorial-hero compact">
                  <div className="modal-editorial-media">
                    <img
                      src={currentDetailImage}
                      alt={selectedAnimal.name}
                      style={{ display: "block" }}
                      data-fallback-index="0"
                      onLoad={handleImageLoad}
                      onError={(e) => handleImageFallback(e, currentDetailFallbackChain)}
                    />
                  </div>
                  <div className="modal-editorial-copy">
                    <div className="modal-kicker-row">
                      <span className="modal-kicker">Adopción</span>
                      <span className="modal-kicker muted">Ficha abierta</span>
                    </div>
                    <h2>{selectedAnimal.name}</h2>
                    <p>{selectedAnimal.description || "Consulta sus imágenes y avanza al formulario cuando lo tengas claro."}</p>
                    <div className="modal-typology-row">
                      <span className="modal-typology-pill">{selectedAnimal.species}</span>
                      {selectedAnimal.age ? <span className="modal-typology-pill">{selectedAnimal.age} años</span> : null}
                      <span className="modal-typology-pill accent">Perfil adoptable</span>
                    </div>
                  </div>
                </div>
                <div className="animal-detail-section">
                  {activeDetailImages.length > 0 ? (
                    <div className="animal-detail-gallery">
                      <div className="animal-detail-thumbnails">
                        {activeDetailImages.map((src, index) => (
                          <button
                            key={`${src}-${index}`}
                            type="button"
                            className={`animal-detail-thumb ${selectedImageIndex === index ? "active" : ""}`}
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <img src={src} alt={`${selectedAnimal.name} ${index + 1}`} />
                          </button>
                        ))}
                      </div>
                      <div className="animal-detail-main-block">
                        <div className="animal-detail-main-image">
                          <button
                            type="button"
                            className="image-nav-btn prev"
                            onClick={() => setSelectedImageIndex((current) => (current - 1 + activeDetailImages.length) % activeDetailImages.length)}
                          >
                            ‹
                          </button>
                          <img
                            src={currentDetailImage}
                            alt={`${selectedAnimal.name} ${safeDetailIndex + 1}`}
                            style={{ display: "block" }}
                            data-fallback-index="0"
                            onLoad={handleImageLoad}
                            onError={(e) => handleImageFallback(e, currentDetailFallbackChain)}
                          />
                          <button
                            type="button"
                            className="image-nav-btn next"
                            onClick={() => setSelectedImageIndex((current) => (current + 1) % activeDetailImages.length)}
                          >
                            ›
                          </button>
                        </div>
                        <div className="animal-detail-info">
                          {selectedAnimal.description && <p>{selectedAnimal.description}</p>}
                          <button className="modal-submit-btn adopt-submit" onClick={() => setShowAnimalDetails(false)}>
                            🐾 Solicitar adopción
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="animal-card-img">
                        <img
                          src={ADOPTION_LOCAL_FALLBACK_IMAGE}
                          alt={selectedAnimal.name || "Animal disponible"}
                          style={{ display: "block" }}
                          data-fallback-index="0"
                          onLoad={handleImageLoad}
                          onError={(e) => handleImageFallback(e, [ADOPTION_LOCAL_FALLBACK_IMAGE])}
                        />
                      </div>
                      <div className="animal-detail-info">
                        {selectedAnimal.description && <p>{selectedAnimal.description}</p>}
                        <button className="modal-submit-btn adopt-submit" onClick={() => setShowAnimalDetails(false)}>
                          🐾 Solicitar adopción
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* PASO 3: Formulario */}
            {!adopEnviado && selectedAnimal && !showAnimalDetails && (
              <>
                <button className="back-btn" onClick={() => { setSelectedAnimal(null); setSelectedAnimalImages([]); }}>← Volver a los animales</button>
                <div className="modal-editorial-hero compact">
                  <div className="modal-editorial-media">
                    <img
                      src={currentDetailImage}
                      alt={selectedAnimal.name}
                      style={{ display: "block" }}
                      data-fallback-index="0"
                      onLoad={handleImageLoad}
                      onError={(e) => handleImageFallback(e, currentDetailFallbackChain)}
                    />
                  </div>
                  <div className="modal-editorial-copy">
                    <div className="modal-kicker-row">
                      <span className="modal-kicker">Solicitud</span>
                      <span className="modal-kicker muted">Adopta Amigos</span>
                    </div>
                    <h2>Adoptar a <em>{selectedAnimal.name}</em></h2>
                    <p>Completa la solicitud con una presentación más visual, como una ficha destacada de evento.</p>
                    <div className="modal-typology-row">
                      <span className="modal-typology-pill">{selectedAnimal.species}</span>
                      {selectedAnimal.age ? <span className="modal-typology-pill">{selectedAnimal.age} años</span> : null}
                      <span className="modal-typology-pill accent">Solicitud responsable</span>
                    </div>
                  </div>
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
                <div className="modal-editorial-hero">
                  <div className="modal-editorial-media">
                    <img src={ADOPTION_MODAL_IMAGE} alt="Animales disponibles para adopción" />
                  </div>
                  <div className="modal-editorial-copy">
                    <div className="modal-kicker-row">
                      <span className="modal-kicker">Adopta Amigos</span>
                      <span className="modal-kicker muted">Selección abierta</span>
                    </div>
                    <h2>Explora perfiles con foto y tipología</h2>
                    <p>Elige el animal que quieres acoger en tu hogar en una vista inspirada en Eventos: imagen principal, lectura rápida y fichas mejor jerarquizadas.</p>
                  </div>
                </div>

                <div className="animal-filter-row">
                  <label htmlFor="animal-type-select">Selecciona el tipo de animal:</label>
                  <select
                    id="animal-type-select"
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                    className="modal-select"
                  >
                    <option value="Todos">Todos</option>
                    {visibleSpeciesOptions.length > 0 ? (
                      visibleSpeciesOptions.map((species) => (
                        <option key={species} value={species}>{species}</option>
                      ))
                    ) : (
                      <option value="Todos" disabled>No hay tipos disponibles</option>
                    )}
                  </select>
                </div>

                {animalesLoading ? (
                  <p className="adopt-loading">Cargando animales disponibles...</p>
                ) : animales.length === 0 ? (
                  <p className="adopt-empty">No hay animales disponibles en este momento.</p>
                ) : (
                  <>
                    {filteredAnimales.length === 0 ? (
                      <p className="adopt-empty">No hay animales de este tipo. Prueba con otro filtro.</p>
                    ) : (
                      <div className="animals-grid event-style-grid">
                        {filteredAnimales.map((a, index) => {
                          const preferredIndex = getPreferredImageIndex(a, index);
                          const previewImage = getFirstAnimalImage(a);
                          const imageCandidates = getValidAnimalImages(a);
                          const cardFallbackChain = buildFallbackChain(previewImage, imageCandidates);

                          return (
                          <button
                            key={a.id}
                            className="animal-card-btn event-animal-card"
                            onClick={() => {
                              const detailImages = getAnimalDetailImages(a, preferredIndex, 4);
                              setSelectedAnimal(a);
                              setSelectedAnimalImages(detailImages);
                              setShowAnimalDetails(true);
                              setSelectedImageIndex(0);
                              setAdopForm(formAdopInicial);
                            }}
                          >
                            <div
                              className="animal-card-img"
                              style={{
                                width: "100%",
                                height: "120px",
                                minHeight: "120px",
                                maxHeight: "120px",
                                overflow: "hidden",
                                position: "relative",
                                display: "block",
                              }}
                            >
                              <img
                                src={previewImage}
                                alt={a.name}
                                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                                data-fallback-index="0"
                                onLoad={handleImageLoad}
                                onError={(e) => handleImageFallback(e, cardFallbackChain)}
                              />
                            </div>
                            <div className="animal-card-info">
                              <div className="animal-card-meta">
                                <span>{a.species || "Animal"}</span>
                                <span>{a.age ? `${a.age} años` : "Perfil"}</span>
                              </div>
                              <strong>{a.name}</strong>
                              <span>{a.species}{a.age ? ` · ${a.age} años` : ""}</span>
                              {a.description && <span className="animal-desc">{a.description}</span>}
                            </div>
                            <span className="animal-adopt-tag">Adoptar →</span>
                          </button>
                          );
                        })}
                      </div>
                    )}
                  </>
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
                <div className="modal-editorial-hero">
                  <div className="modal-editorial-media">
                    <img src={DONATION_MODAL_IMAGE} alt="Donaciones a la protectora" />
                  </div>
                  <div className="modal-editorial-copy">
                    <div className="modal-kicker-row">
                      <span className="modal-kicker">Donaciones</span>
                      <span className="modal-kicker muted">Apoyo activo</span>
                    </div>
                    <h2>Haz tu donación</h2>
                    <p>Elige el monto y la forma de pago para apoyar a la protectora.</p>
                    <DonationTypeSelector
                      value={donationPreset}
                      onChange={(value) => applyDonationPreset(value)}
                    />
                  </div>
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
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setVolModalOpen(false)}
              aria-label="Cerrar formulario de voluntariado"
            >✕</button>

            {volEnviado ? (
              <div className="modal-success">
                <div className="success-icon">🎉</div>
                <h3>¡Gracias por apuntarte!</h3>
                <p>Nos pondremos en contacto contigo muy pronto.</p>
              </div>
            ) : (
              <>
                <div className="modal-editorial-hero">
                  <div className="modal-editorial-media">
                    <img src={VOLUNTEER_MODAL_IMAGE} alt="Voluntariado con animales" />
                  </div>
                  <div className="modal-editorial-copy">
                    <div className="modal-kicker-row">
                      <span className="modal-kicker">Voluntariado</span>
                      <span className="modal-kicker muted">Inscripción abierta</span>
                    </div>
                    <h2>¡APÚNTATE!</h2>
                    <p>Tu ayuda marca la diferencia. Comparte tu tiempo, tu energía y tu cariño con los animales que más lo necesitan.</p>
                    <div className="modal-typology-row">
                      {DISPONIBILIDADES.slice(0, 4).map((d) => <span key={d} className="modal-typology-pill">{d}</span>)}
                    </div>
                    <div style={{ marginTop: "0.9rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <img
                        src={VOLUNTEER_SMILE_IMAGE}
                        alt="Caballo sonriendo"
                        style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "50%", border: "2px solid #f59e0b" }}
                      />
                      <span style={{ color: "#92400e", fontWeight: 700, fontSize: "0.95rem" }}>Tu sonrisa también ayuda</span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleVolSubmit} className="modal-form">
                  <input type="text"  placeholder="Nombre completo *"      required className="modal-input" value={volForm.nombre}        onChange={(e) => setVolForm({ ...volForm, nombre:        e.target.value })} />
                  <input type="email" placeholder="Correo electrónico *"   required className="modal-input" value={volForm.email}         onChange={(e) => setVolForm({ ...volForm, email:         e.target.value })} />
                  <input type="tel"   placeholder="Teléfono (opcional)"             className="modal-input" value={volForm.telefono}      onChange={(e) => setVolForm({ ...volForm, telefono:      e.target.value })} />
                  <label className="modal-field-label">Selecciona tu disponibilidad</label>
                  <VolunteerAvailabilitySelector
                    value={volForm.disponibilidad}
                    onChange={(value) => setVolForm({ ...volForm, disponibilidad: value })}
                    className="modal-availability-selector"
                  />
                  {volError ? <p className="modal-form-error" role="alert">{volError}</p> : null}
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
