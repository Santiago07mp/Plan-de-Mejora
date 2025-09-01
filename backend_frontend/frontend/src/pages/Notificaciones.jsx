import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Notificaciones() {
  const { token, usuario, logout } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manejar token expirado
  const handleTokenExpired = () => {
    Swal.fire({
      title: "Sesión expirada",
      text: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
      icon: "warning",
      confirmButtonText: "Iniciar sesión"
    }).then(() => {
      logout();
    });
  };

  useEffect(() => {
    if (token) {
      cargarNotificaciones();
      
      // Configurar polling para actualizaciones periódicas (cada 30 segundos)
      const intervalId = setInterval(cargarNotificaciones, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [token]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      
      const response = await api.get("/notificaciones", token);
      
      if (response.success) {
        setNotificaciones(response.notificaciones || []);
      } else {
        throw new Error(response.error || "Error al cargar notificaciones");
      }
      
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        handleTokenExpired();
        return;
      }
      
      Swal.fire('Error', 'No se pudieron cargar las notificaciones', 'error');
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    try {
      await api.patch(`/notificaciones/${idNotificacion}/leida`, {}, token);
      
      // Actualizar estado local
      setNotificaciones(prev => prev.map(notif =>
        notif.id_notificacion === idNotificacion 
          ? { ...notif, leida: true }
          : notif
      ));
      
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        handleTokenExpired();
        return;
      }
      
      Swal.fire('Error', 'No se pudo marcar la notificación como leída', 'error');
    }
  };

  const formatearFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      const ahora = new Date();
      const diferencia = ahora - fecha;
      const minutos = Math.floor(diferencia / (1000 * 60));
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

      if (minutos < 1) return "Ahora mismo";
      if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
      if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
      if (dias < 7) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
      
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando notificaciones..." />;
  }

  const notificacionesPendientes = notificaciones.filter(n => !n.leida).length;
  const notificacionesLeidas = notificaciones.filter(n => n.leida).length;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Mis Notificaciones</h2>
          <p className="text-muted">
            Gestiona tus alertas y notificaciones del sistema
          </p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={cargarNotificaciones}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h3 className="card-title mb-0">{notificaciones.length}</h3>
              <p className="card-text mb-0">Total</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-warning">
            <div className="card-body">
              <h3 className="card-title mb-0">{notificacionesPendientes}</h3>
              <p className="card-text mb-0">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h3 className="card-title mb-0">{notificacionesLeidas}</h3>
              <p className="card-text mb-0">Leídas</p>
            </div>
          </div>
        </div>
      </div>

      {notificaciones.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-bell-slash fs-1 d-block mb-3"></i>
          <h4>No tienes notificaciones</h4>
          <p className="mb-0">Cuando tengas nuevas alertas, aparecerán aquí.</p>
        </div>
      ) : (
        <>
          <div className="list-group mb-4">
            {notificaciones.map(notificacion => (
              <div 
                key={notificacion.id_notificacion} 
                className={`list-group-item list-group-item-action ${
                  !notificacion.leida 
                    ? 'list-group-item-warning border-warning' 
                    : 'border-light'
                }`}
                style={{ 
                  borderLeft: !notificacion.leida ? '4px solid #ffc107' : '4px solid #dee2e6',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 me-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 text-dark">{notificacion.mensaje}</h6>
                      {!notificacion.leida && (
                        <span className="badge bg-warning text-dark ms-2">
                          <i className="bi bi-star-fill me-1"></i>Nuevo
                        </span>
                      )}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {formatearFecha(notificacion.fecha)}
                    </small>
                  </div>
                  {!notificacion.leida && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => marcarComoLeida(notificacion.id_notificacion)}
                      title="Marcar como leída"
                      style={{ minWidth: '40px' }}
                    >
                      <i className="bi bi-check2"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className="btn btn-outline-secondary"
              onClick={cargarNotificaciones}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Recargar
            </button>
          </div>
        </>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-light rounded">
        <h6 className="text-muted">
          <i className="bi bi-info-circle me-2"></i>
          Información
        </h6>
        <p className="small text-muted mb-0">
          Las notificaciones te mantienen informado sobre actividades importantes del sistema, 
          como nuevas tareas asignadas, recordatorios de vencimientos y actualizaciones de estado.
        </p>
      </div>
    </div>
  );
}