import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import AnimalesPage from "./pages/AnimalesPage";
import AdopcionesPage from "./pages/AdopcionesPage";
import VoluntariosPage from "./pages/VoluntariosPage";
import EventosPage from "./pages/EventosPage";
import DonacionesPage from "./pages/DonacionesPage";

// Admin Pages
import { Dashboard } from "./admin/pages/Dashboard";
import { AdminAnimals } from "./admin/pages/AdminAnimals";
import { AdminAdoptions } from "./admin/pages/AdminAdoptions";
import { AdminVolunteers } from "./admin/pages/AdminVolunteers";
import { AdminEvents } from "./admin/pages/AdminEvents";
import { AdminDonations } from "./admin/pages/AdminDonations";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/animales" element={<AnimalesPage />} />
                    <Route path="/adopciones" element={<AdopcionesPage />} />
                    <Route path="/voluntarios" element={<VoluntariosPage />} />
                    <Route path="/eventos" element={<EventosPage />} />
                    <Route path="/donaciones" element={<DonacionesPage />} />
                </Route>

                {/* Rutas de Administración */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/" element={<Dashboard />} />
                <Route path="/admin/animals" element={<AdminAnimals />} />
                <Route path="/admin/adoptions" element={<AdminAdoptions />} />
                <Route path="/admin/volunteers" element={<AdminVolunteers />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/donations" element={<AdminDonations />} />
            </Routes>
        </BrowserRouter>
    );
}
