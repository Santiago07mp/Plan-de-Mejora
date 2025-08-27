import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Dashboard() {
  const { usuario, token } = useAuth();
  const [stats, setStats] = useState({
    totalTareas: 0,
    tareasPendientes: 0,
    tareasCompletadas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const tareas = await api.getTareas(token);
      
      const totalTareas = tareas.length;
      const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
      const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;

      setStats({ totalTareas, tareasPendientes, tareasCompletadas });
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container">
      <h1 className="text-center mb-4">Dashboard</h1>
      
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Tareas</h5>
              <h2 className="text-primary">{stats.totalTareas}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Pendientes</h5>
              <h2 className="text-warning">{stats.tareasPendientes}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Completadas</h5>
              <h2 className="text-success">{stats.tareasCompletadas}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Gestionar Tareas</h5>
              <p className="card-text">Crear, editar y asignar tareas</p>
              <Link to="/tareas" className="btn btn-primary">
                Ir a Tareas
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Notificaciones</h5>
              <p className="card-text">Revisar tus notificaciones</p>
              <Link to="/notificaciones" className="btn btn-info">
                Ver Notificaciones
              </Link>
            </div>
          </div>
        </div>

        {usuario.rol === 'admin' && (
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <h5 className="card-title">Reportes</h5>
                <p className="card-text">Generar reportes de tareas</p>
                <Link to="/reportes" className="btn btn-success">
                  Generar Reportes
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}