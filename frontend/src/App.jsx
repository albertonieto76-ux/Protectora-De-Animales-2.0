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
import { AdminAnimalEdit } from "./admin/pages/AdminAnimalEdit";
import { AdminAdoptions } from "./admin/pages/AdminAdoptions";
import { AdminVolunteers } from "./admin/pages/AdminVolunteers";
import { AdminEvents } from "./admin/pages/AdminEvents";
import { AdminDonations } from "./admin/pages/AdminDonations";
import { AdminLogin } from "./admin/pages/AdminLogin";
import { AdminSecurity } from "./admin/pages/AdminSecurity";
import { ProtectedAdminRoute } from "./admin/components/ProtectedAdminRoute";

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
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
                <Route path="/admin/animals" element={<ProtectedAdminRoute><AdminAnimals /></ProtectedAdminRoute>} />
                <Route path="/admin/animals/:id/edit" element={<ProtectedAdminRoute><AdminAnimalEdit /></ProtectedAdminRoute>} />
                <Route path="/admin/adoptions" element={<ProtectedAdminRoute><AdminAdoptions /></ProtectedAdminRoute>} />
                <Route path="/admin/volunteers" element={<ProtectedAdminRoute><AdminVolunteers /></ProtectedAdminRoute>} />
                <Route path="/admin/events" element={<ProtectedAdminRoute><AdminEvents /></ProtectedAdminRoute>} />
                <Route path="/admin/donations" element={<ProtectedAdminRoute><AdminDonations /></ProtectedAdminRoute>} />
                <Route path="/admin/security" element={<ProtectedAdminRoute><AdminSecurity /></ProtectedAdminRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
