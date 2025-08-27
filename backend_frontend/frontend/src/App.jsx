import { useAuth } from './context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Notificaciones from './pages/Notificaciones';
import Reportes from './pages/Reportes';
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
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tareas" 
            element={
              <PrivateRoute>
                <Tareas />
              </PrivateRoute>
            } 
          />
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
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;