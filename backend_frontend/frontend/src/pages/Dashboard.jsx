import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/LoadingSpinner";
import "../css/Dashboard.css";

export default function Dashboard() {
  const { usuario, token, isAdmin, logout, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalTareas: 0,
    tareasPendientes: 0,
    tareasCompletadas: 0,
    tareasEnProgreso: 0,
    tareasPorVencer: 0,
    misTareasPendientes: 0,
    misTareasCompletadas: 0,
    usuariosActivos: 0,
    usuariosTotales: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [misTareasRecientes, setMisTareasRecientes] = useState([]);

  // Manejar token expirado
  const handleTokenExpired = useCallback(() => {
    Swal.fire({
      title: "Sesión expirada",
      text: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
      icon: "warning",
      confirmButtonText: "Iniciar sesión"
    }).then(() => {
      logout();
    });
  }, [logout]);

  const cargarDatosDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      await Promise.all([
        cargarEstadisticas(),
        cargarActividadesRecientes(),
        cargarMisTareasRecientes()
      ]);
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        handleTokenExpired();
        return;
      }
      
      Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, handleTokenExpired]);

  useEffect(() => {
    if (isAuthenticated && token) {
      cargarDatosDashboard();
    }
  }, [cargarDatosDashboard, isAuthenticated, token]);

  const cargarEstadisticas = async () => {
    try {
      const tareasData = await api.getTareas(token);
      const hoy = new Date();
      
      // Estadísticas generales (solo para admin)
      const totalTareas = isAdmin ? tareasData.length : 0;
      const tareasPendientes = isAdmin ? tareasData.filter(t => t.estado === 'pendiente').length : 0;
      const tareasCompletadas = isAdmin ? tareasData.filter(t => t.estado === 'completada').length : 0;
      const tareasEnProgreso = isAdmin ? tareasData.filter(t => t.estado === 'en progreso').length : 0;
      
      // Tareas por vencer (para todos los usuarios)
      const tareasPorVencer = tareasData.filter(t => {
        if (t.estado === 'completada' || !t.fecha_vencimiento) return false;
        const fechaLimite = new Date(t.fecha_vencimiento);
        const diferenciaDias = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
        return diferenciaDias <= 3 && diferenciaDias >= 0;
      }).length;

      // Estadísticas del usuario actual
      const misTareas = tareasData.filter(t => t.id_usuario_asignado === usuario?.id_usuario);
      const misTareasPendientes = misTareas.filter(t => t.estado === 'pendiente').length;
      const misTareasCompletadas = misTareas.filter(t => t.estado === 'completada').length;

      // Estadísticas de usuarios (solo para admin)
      let usuariosActivos = 0;
      let usuariosTotales = 0;
      
      if (isAdmin) {
        try {
          const usuariosData = await api.getUsers(token);
          usuariosTotales = Array.isArray(usuariosData) ? usuariosData.length : 0;
          usuariosActivos = Array.isArray(usuariosData) ? usuariosData.filter(u => u.activo).length : 0;
        } catch (error) {
          console.error("Error cargando usuarios:", error);
        }
      }

      setStats({ 
        totalTareas, 
        tareasPendientes, 
        tareasCompletadas,
        tareasEnProgreso,
        tareasPorVencer,
        misTareasPendientes,
        misTareasCompletadas,
        usuariosActivos,
        usuariosTotales
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      throw error;
    }
  };

  const cargarActividadesRecientes = async () => {
    try {
      // Este endpoint podría implementarse en el backend en el futuro
      // Por ahora dejamos vacío ya que no existe el endpoint
      setRecentActivities([]);
    } catch (error) {
      console.error("Error cargando actividades recientes:", error);
      setRecentActivities([]);
    }
  };

  const cargarMisTareasRecientes = async () => {
    try {
      const tareasData = await api.getTareas(token);
      const misTareas = tareasData
        .filter(t => t.id_usuario_asignado === usuario?.id_usuario)
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .slice(0, 5);
      
      setMisTareasRecientes(misTareas);
    } catch (error) {
      console.error("Error cargando mis tareas recientes:", error);
      setMisTareasRecientes([]);
    }
  };

  const handleRefresh = () => {
    cargarDatosDashboard();
  };

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  // Componente para mostrar tarjetas de estadísticas
  const StatCard = ({ title, value, color, subtitle }) => (
    <div className="col-md-4 mb-3">
      <div className="stat-card card text-center h-100">
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <h2 className={`text-${color}`}>{value}</h2>
          <div className="small text-muted">{subtitle}</div>
        </div>
      </div>
    </div>
  );

  // Componente para mostrar tarjetas de acción
  const ActionCard = ({ icon, title, description, buttonText, link, buttonColor }) => (
    <div className="col-md-4 mb-3">
      <div className="card h-100 hover-lift">
        <div className="card-body text-center">
          <h5 className="card-title">
            <i className={`${icon} text-${buttonColor} me-2`}></i>
            {title}
          </h5>
          <p className="card-text">{description}</p>
          <Link to={link} className={`btn btn-${buttonColor} w-100`}>
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container fade-in">
      {/* Header del Dashboard */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-gradient">Dashboard {isAdmin ? "Administrador" : "Usuario"}</h1>
          <p className="text-muted">
            Bienvenido/a, <strong>{usuario?.nombre}</strong>. {isAdmin ? 
              "Panel de administración del sistema" : 
              "Gestión de tus tareas y actividades"
            }
          </p>
        </div>
        <button className="btn btn-outline-primary" onClick={handleRefresh}>
          <i className="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row">
        {/* Estadísticas para todos los usuarios */}
        <StatCard 
          title="Mis Tareas Pendientes" 
          value={stats.misTareasPendientes} 
          color="warning" 
          subtitle="Esperando realización" 
        />
        
        <StatCard 
          title="Mis Tareas Completadas" 
          value={stats.misTareasCompletadas} 
          color="success" 
          subtitle="Tareas finalizadas" 
        />
        
        <StatCard 
          title="Tareas por Vencer" 
          value={stats.tareasPorVencer} 
          color="danger" 
          subtitle="Próximos a vencer" 
        />

        {/* Estadísticas solo para admin */}
        {isAdmin && (
          <>
            <StatCard 
              title="Total Tareas" 
              value={stats.totalTareas} 
              color="primary" 
              subtitle="Gestión total de tareas" 
            />
            
            <StatCard 
              title="Tareas Pendientes" 
              value={stats.tareasPendientes} 
              color="warning" 
              subtitle="Esperando realización" 
            />
            
            <StatCard 
              title="Tareas Completadas" 
              value={stats.tareasCompletadas} 
              color="success" 
              subtitle="Tareas finalizadas" 
            />

            <StatCard 
              title="Tareas en Progreso" 
              value={stats.tareasEnProgreso} 
              color="info" 
              subtitle="En proceso" 
            />

            <StatCard 
              title="Usuarios Activos" 
              value={stats.usuariosActivos} 
              color="primary" 
              subtitle={`De ${stats.usuariosTotales} totales`} 
            />
          </>
        )}
      </div>

      {/* Sección de acciones rápidas */}
      <div className="row mt-4">
        <ActionCard 
          icon="bi bi-list-task" 
          title="Gestionar Tareas" 
          description="Crear, editar y asignar tareas" 
          buttonText="Ir a Tareas" 
          link="/tareas" 
          buttonColor="primary" 
        />

        <ActionCard 
          icon="bi bi-bell" 
          title="Notificaciones" 
          description="Revisar tus notificaciones" 
          buttonText="Ver Notificaciones" 
          link="/notificaciones" 
          buttonColor="info" 
        />

        {/* Acciones solo para admin */}
        {isAdmin && (
          <>
            <ActionCard 
              icon="bi bi-graph-up" 
              title="Reportes" 
              description="Generar reportes de tareas" 
              buttonText="Generar Reportes" 
              link="/reportes" 
              buttonColor="success" 
            />
            
            <ActionCard 
              icon="bi bi-people" 
              title="Gestión de Usuarios" 
              description="Administrar usuarios del sistema" 
              buttonText="Gestionar Usuarios" 
              link="/admin/usuarios" 
              buttonColor="warning" 
            />
          </>
        )}
      </div>

      {/* Sección de Mis Tareas Recientes y Actividad */}
      <div className="row mt-4">
        {/* Mis Tareas Recientes (para todos los usuarios) */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Mis Tareas Recientes</h5>
              <span className="badge bg-primary">{misTareasRecientes.length}</span>
            </div>
            <div className="card-body">
              {misTareasRecientes.length > 0 ? (
                <div className="list-group">
                  {misTareasRecientes.map(tarea => (
                    <div key={tarea.id_tarea} className="list-group-item slide-in">
                      <div className="d-flex w-100 justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{tarea.titulo}</h6>
                          <span className={`badge bg-${
                            tarea.estado === 'completada' ? 'success' :
                            tarea.estado === 'en progreso' ? 'info' : 'warning'
                          }`}>
                            {tarea.estado}
                          </span>
                        </div>
                        <small className="text-muted">
                          {tarea.fecha_vencimiento ? 
                            new Date(tarea.fecha_vencimiento).toLocaleDateString() : 
                            'Sin fecha límite'
                          }
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="mt-2 text-muted">No tienes tareas recientes</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <Link to="/tareas" className="btn btn-outline-primary btn-sm">
                Ver todas mis tareas
              </Link>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Actividad Reciente</h5>
            </div>
            <div className="card-body">
              {recentActivities.length > 0 ? (
                <div className="list-group">
                  {recentActivities.map(actividad => (
                    <div key={actividad.id} className="list-group-item slide-in">
                      <div className="d-flex w-100 justify-content-between">
                        <div>
                          <h6 className="mb-1">
                            <span className={`badge bg-${
                              actividad.tipo === 'tarea' ? 'primary' : 
                              actividad.tipo === 'usuario' ? 'info' : 
                              actividad.tipo === 'sistema' ? 'secondary' : 'warning'
                            } me-2`}>
                              {actividad.tipo}
                            </span>
                            {actividad.accion}: {actividad.objetivo}
                          </h6>
                        </div>
                        <small className="text-muted">{actividad.tiempo}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-activity display-4 text-muted"></i>
                  <p className="mt-2 text-muted">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}