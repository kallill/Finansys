import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Reports from './pages/Reports';
import Cards from './pages/Cards';
import BankImport from './pages/BankImport';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin CRM Imports
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminOS from './pages/admin/AdminOS';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfile from './pages/admin/AdminProfile';
import AdminPlans from './pages/admin/AdminPlans';
import PlaceholderPage from './pages/admin/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rotas Protegidas de Usuário (Antigas) */}
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/import" element={<ProtectedRoute><BankImport /></ProtectedRoute>} />

        {/* CRM Admin System (Cerasus) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/os" element={<AdminProtectedRoute><AdminOS /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
        
        {/* Placeholders e Módulos Ativos */}
        <Route path="/admin/clients" element={<AdminProtectedRoute><PlaceholderPage title="Clientes & Prospects" /></AdminProtectedRoute>} />
        <Route path="/admin/plans" element={<AdminProtectedRoute><AdminPlans /></AdminProtectedRoute>} />
        <Route path="/admin/financial" element={<AdminProtectedRoute><PlaceholderPage title="Financeiro" /></AdminProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
