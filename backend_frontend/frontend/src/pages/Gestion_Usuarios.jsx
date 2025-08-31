import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

export default function GestionUsuarios() {
  const { token, usuario, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState("todos");
  const [cambiandoRol, setCambiandoRol] = useState(false);

  // Verificar si el usuario es administrador y está autenticado
  const esAdmin = usuario && usuario.rol === "admin" && isAuthenticated;

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Redirigir si no es admin
    if (!esAdmin) {
      navigate("/dashboard");
      return;
    }

    // Cargar usuarios solo si es admin y está autenticado
    cargarUsuarios();
  }, [isAuthenticated, esAdmin, navigate]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const users = await api.getUsers(token);
      setUsuarios(users);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          logout();
          navigate("/login");
        });
      } else {
        Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const cambiarRolUsuario = async (idUsuario, nuevoRol) => {
    try {
      setCambiandoRol(true);
      await api.put(`/usuarios/${idUsuario}/rol`, { rol: nuevoRol }, token);
      
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(user => 
          user.id_usuario === idUsuario ? { ...user, rol: nuevoRol } : user
        )
      );
      
      Swal.fire("Éxito", "Rol actualizado correctamente", "success");
    } catch (error) {
      console.error("Error cambiando rol:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          logout();
          navigate("/login");
        });
      } else {
        Swal.fire("Error", "No se pudo cambiar el rol del usuario", "error");
      }
    } finally {
      setCambiandoRol(false);
    }
  };

  const confirmarCambioRol = (usuario, nuevoRol) => {
    Swal.fire({
      title: `¿Cambiar rol de ${usuario.nombre}?`,
      text: `El rol actual es '${usuario.rol}'. ¿Deseas cambiarlo a '${nuevoRol}'?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        cambiarRolUsuario(usuario.id_usuario, nuevoRol);
      }
    });
  };

  const filtrarUsuarios = () => {
    return usuarios.filter(user => {
      if (filtroRol !== "todos" && user.rol !== filtroRol) {
        return false;
      }
      return true;
    });
  };

  const usuariosFiltrados = filtrarUsuarios();

  if (!esAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Acceso restringido</h4>
          <p>No tienes permisos para acceder a esta sección. Solo los administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Botón para volver al inicio */}
      <div className="mb-3">
        <Link to="/dashboard" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Inicio
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Usuarios</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={cargarUsuarios}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      {/* Panel de información */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Usuarios</h5>
              <p className="card-text display-6">{usuarios.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Administradores</h5>
              <p className="card-text display-6">
                {usuarios.filter(u => u.rol === "admin").length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Usuarios Regulares</h5>
              <p className="card-text display-6">
                {usuarios.filter(u => u.rol === "usuario").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-4">
              <label htmlFor="filtroRol" className="form-label">Filtrar por rol</label>
              <select
                id="filtroRol"
                className="form-select"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="todos">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="usuario">Usuarios</option>
              </select>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => setFiltroRol("todos")}
              >
                <i className="bi bi-x-circle me-2"></i>
                Limpiar Filtro
              </button>
            </div>
            <div className="col-md-4 text-end">
              <span className="badge bg-primary">
                {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Usuarios del Sistema</h5>
        </div>
        <div className="card-body">
          {usuariosFiltrados.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(user => (
                    <tr key={user.id_usuario}>
                      <td>{user.id_usuario}</td>
                      <td>{user.nombre}</td>
                      <td>{user.correo}</td>
                      <td>
                        <span className={`badge bg-${user.rol === 'admin' ? 'danger' : 'secondary'}`}>
                          {user.rol}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          {user.rol === "usuario" ? (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => confirmarCambioRol(user, "admin")}
                              disabled={cambiandoRol}
                              title="Hacer administrador"
                            >
                              {cambiandoRol ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <>
                                  <i className="bi bi-person-check me-1"></i>
                                  Hacer Admin
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => confirmarCambioRol(user, "usuario")}
                              disabled={cambiandoRol}
                              title="Quitar permisos de administrador"
                            >
                              {cambiandoRol ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <>
                                  <i className="bi bi-person-dash me-1"></i>
                                  Quitar Admin
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-people display-4 text-muted"></i>
              <p className="mt-3 text-muted">No hay usuarios que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}