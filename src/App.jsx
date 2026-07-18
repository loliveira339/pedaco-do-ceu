import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProdutosPage from './pages/admin/ProdutosPage';
import CategoriasPage from './pages/admin/CategoriasPage';
import IngredientesPage from './pages/admin/IngredientesPage';
import GaleriaPage from './pages/admin/GaleriaPage';
import CalculadoraPage from './pages/admin/CalculadoraPage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="ingredientes" element={<IngredientesPage />} />
        <Route path="galeria" element={<GaleriaPage />} />
        <Route path="calculadora" element={<CalculadoraPage />} />
      </Route>

      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
