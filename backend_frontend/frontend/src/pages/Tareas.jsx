import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Swal from "sweetalert2";
import TareaCard from "../components/TareaCard";
import { Link, useNavigate } from "react-router-dom";

export default function Tareas() {
  const { token, usuario, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrearTarea, setShowCrearTarea] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    id_usuario_asignado: "",
    fecha_vencimiento: ""
  });

  useEffect(() => {
    cargarTareasYUsuarios();
  }, []);

  const cargarTareasYUsuarios = async () => {
    try {
      setLoading(true);
      
      // Cargar tareas
      const tareasData = await api.getTareas(token);
      setTareas(Array.isArray(tareasData) ? tareasData : []);
      
      // Intentar cargar usuarios, pero si falla continuar sin ellos
      try {
        const usuariosData = await api.getUsers(token);
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      } catch (error) {
        console.warn("No se pudieron cargar los usuarios:", error);
        setUsuarios([]);
        
        // Mostrar advertencia solo si no es error de autenticación
        if (error.message !== "UNAUTHORIZED" && error.message !== "TOKEN_EXPIRED") {
          Swal.fire({
            title: "Aviso",
            text: "No se pudo cargar la lista de usuarios. Podrás crear tareas pero no asignarlas a otros usuarios.",
            icon: "info",
            confirmButtonText: "Entendido"
          });
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          logout();
          navigate('/login');
        });
      } else {
        Swal.fire("Error", "No se pudieron cargar las tareas", "error");
      }
      
      setTareas([]);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTarea = async (e) => {
    e.preventDefault();
    try {
      // Preparar los datos según lo que espera el backend
      const datosTarea = {
        titulo: nuevaTarea.titulo,
        descripcion: nuevaTarea.descripcion,
        fecha_vencimiento: nuevaTarea.fecha_vencimiento,
        id_usuario_asignado: nuevaTarea.id_usuario_asignado || usuario.id_usuario
      };
      
      const response = await api.post("/tareas", datosTarea, token);
      
      // Agregar la nueva tarea al estado local inmediatamente
      const usuarioAsignado = usuarios.find(u => u.id_usuario === parseInt(datosTarea.id_usuario_asignado)) || usuario;
      
      const nuevaTareaCompleta = {
        id_tarea: response.id_tarea || Date.now(),
        ...datosTarea,
        estado: 'pendiente',
        fecha_creacion: new Date().toISOString(),
        id_usuario_creador: usuario.id_usuario,
        creador_nombre: usuario.nombre,
        asignado_nombre: usuarioAsignado.nombre
      };
      
      setTareas(prevTareas => [nuevaTareaCompleta, ...prevTareas]);
      
      Swal.fire("Éxito", "Tarea creada correctamente", "success");
      setNuevaTarea({
        titulo: "",
        descripcion: "",
        id_usuario_asignado: "",
        fecha_vencimiento: ""
      });
      setShowCrearTarea(false);
    } catch (error) {
      console.error("Error creando tarea:", error);
      Swal.fire("Error", error.message || "Error al crear la tarea", "error");
    }
  };

  const handleEliminarTarea = async (idTarea, tarea) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await api.delete(`/tareas/${idTarea}`, token);
        
        // Eliminar inmediatamente del estado local sin recargar
        setTareas(prevTareas => prevTareas.filter(t => t.id_tarea !== idTarea));
        
        Swal.fire("Éxito", "Tarea eliminada correctamente", "success");
      }
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          logout();
          navigate('/login');
        });
      } else {
        Swal.fire("Error", error.message || "Error al eliminar la tarea", "error");
      }
    }
  };

  const handleActualizarTarea = async (idTarea, datosActualizados) => {
    try {
      // Asegurar que id_usuario_asignado sea número si es necesario
      const datosParaEnviar = {
        ...datosActualizados,
        id_usuario_asignado: datosActualizados.id_usuario_asignado ? 
          parseInt(datosActualizados.id_usuario_asignado) : datosActualizados.id_usuario_asignado
      };
      
      await api.put(`/tareas/${idTarea}`, datosParaEnviar, token);
      
      // Actualizar inmediatamente el estado local
      setTareas(prevTareas => 
        prevTareas.map(t => 
          t.id_tarea === idTarea 
            ? { ...t, ...datosActualizados }
            : t
        )
      );
      
      Swal.fire("Éxito", "Tarea actualizada correctamente", "success");
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          logout();
          navigate('/login');
        });
      } else {
        Swal.fire("Error", error.message || "Error al actualizar la tarea", "error");
      }
      
      // Relanzar el error para que TareaCard pueda manejarlo
      throw error;
    }
  };

  // Filtrar tareas según los criterios seleccionados
  const tareasFiltradas = tareas.filter(tarea => {
    // Filtro por estado
    if (filtroEstado !== "todos" && tarea.estado !== filtroEstado) {
      return false;
    }
    
    // Filtro por usuario asignado
    if (filtroUsuario !== "todos" && tarea.id_usuario_asignado != filtroUsuario) {
      return false;
    }
    
    // Filtro por búsqueda de texto
    if (busqueda && !tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
        !tarea.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Estadísticas rápidas
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasEnProgreso = tareas.filter(t => t.estado === 'en progreso').length;

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando tareas...</p>
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
        <h1>Gestión de Tareas</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCrearTarea(true)}
        >
          <i className="bi bi-plus-circle"></i> Crear Nueva Tarea
        </button>
      </div>

      {/* Tarjetas de estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Tareas</h5>
              <h3>{tareas.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Pendientes</h5>
              <h3>{tareasPendientes}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">En Progreso</h5>
              <h3>{tareasEnProgreso}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Completadas</h5>
              <h3>{tareasCompletadas}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label htmlFor="filtroEstado" className="form-label">Filtrar por estado</label>
              <select
                id="filtroEstado"
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completadas</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="filtroUsuario" className="form-label">Filtrar por usuario</label>
              <select
                id="filtroUsuario"
                className="form-select"
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
              >
                <option value="todos">Todos los usuarios</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="busqueda" className="form-label">Buscar</label>
              <input
                type="text"
                id="busqueda"
                className="form-control"
                placeholder="Buscar en títulos y descripciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear tarea */}
      {showCrearTarea && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nueva Tarea</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCrearTarea(false)}
                ></button>
              </div>
              <form onSubmit={handleCrearTarea}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">Título *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      value={nuevaTarea.titulo}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      rows="3"
                      value={nuevaTarea.descripcion}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="fecha_vencimiento" className="form-label">Fecha Límite</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fecha_vencimiento"
                      value={nuevaTarea.fecha_vencimiento}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, fecha_vencimiento: e.target.value})}
                    />
                  </div>
                  
                  {usuarios.length > 0 && (
                    <div className="mb-3">
                      <label htmlFor="id_usuario_asignado" className="form-label">Asignar a</label>
                      <select
                        className="form-select"
                        id="id_usuario_asignado"
                        value={nuevaTarea.id_usuario_asignado}
                        onChange={(e) => setNuevaTarea({...nuevaTarea, id_usuario_asignado: e.target.value})}
                      >
                        <option value="">Seleccionar usuario (opcional)</option>
                        {usuarios.map(usuario => (
                          <option key={usuario.id_usuario} value={usuario.id_usuario}>
                            {usuario.nombre} ({usuario.rol})
                          </option>
                        ))}
                      </select>
                      <div className="form-text">
                        Si no seleccionas un usuario, la tarea se asignará automáticamente a ti.
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCrearTarea(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear Tarea
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      {tareasFiltradas.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <h3 className="mt-3">No hay tareas</h3>
          <p className="text-muted">
            {busqueda || filtroEstado !== "todos" || filtroUsuario !== "todos" 
              ? "No se encontraron tareas con los filtros aplicados."
              : "Comienza creando tu primera tarea."}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCrearTarea(true)}
          >
            Crear Primera Tarea
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {tareasFiltradas.map(tarea => (
            <div key={tarea.id_tarea} className="col">
              <TareaCard
                tarea={tarea}
                usuarios={usuarios}
                onUpdate={handleActualizarTarea}
                onDelete={handleEliminarTarea}
                esAdmin={isAdmin}
                usuarioActual={usuario}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}