// src/App.jsx
import { useAuth } from './context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Reportes from './pages/Reportes';
import GestionUsuarios from './pages/Gestion_Usuarios';
import Notificaciones from './pages/Notificaciones';

import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <div className="container-fluid mt-3">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
            } 
          />
          
          {/* Ruta para Dashboard (ambos roles) */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Ruta para Tareas (ambos roles) */}
          <Route 
            path="/tareas" 
            element={
              <PrivateRoute>
                <Tareas />
              </PrivateRoute>
            } 
          />
          
          {/* Ruta para Notificaciones (ambos roles) */}
          <Route 
            path="/notificaciones" 
            element={
              <PrivateRoute>
                <Notificaciones />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/reportes" 
            element={
              <PrivateRoute adminOnly={true}>
                <Reportes />
              </PrivateRoute>
            } 
          />
          
          {/* Ruta para gestión de usuarios (solo admin) */}
          <Route 
            path="/admin/usuarios" 
            element={
              <PrivateRoute adminOnly={true}>
                <GestionUsuarios />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* Ruta de fallback para páginas no encontradas */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;