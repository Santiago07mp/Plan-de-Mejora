import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Swal from "sweetalert2";
import TareaCard from "../components/TareaCard";

export default function Tareas() {
  const { token } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrearTarea, setShowCrearTarea] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    id_usuario_asignado: ""
  });

  useEffect(() => {
    cargarTareasYUsuarios();
  }, []);

  const cargarTareasYUsuarios = async () => {
    try {
      setLoading(true);
      const [tareasData, usuariosData] = await Promise.all([
        api.getTareas(token).catch(() => []), // Si falla, devuelve array vacío
        api.getUsers(token).catch(() => [])   // Si falla, devuelve array vacío
      ]);

      // Asegurarse de que siempre sean arrays
      setTareas(Array.isArray(tareasData) ? tareasData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setTareas([]);
      setUsuarios([]);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTarea = async (e) => {
    e.preventDefault();
    try {
      await api.createTarea(token, nuevaTarea);
      Swal.fire("Éxito", "Tarea creada correctamente", "success");
      setNuevaTarea({ titulo: "", descripcion: "", id_usuario_asignado: "" });
      setShowCrearTarea(false);
      cargarTareasYUsuarios();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando tareas...</div>;
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Tareas</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCrearTarea(true)}
        >
          Crear Nueva Tarea
        </button>
      </div>

      {showCrearTarea && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Crear Nueva Tarea</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCrearTarea}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Título"
                  value={nuevaTarea.titulo}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="Descripción"
                  value={nuevaTarea.descripcion}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="mb-3">
                <select
                  className="form-select"
                  value={nuevaTarea.id_usuario_asignado}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, id_usuario_asignado: e.target.value})}
                  required
                >
                  <option value="">Seleccionar usuario asignado</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Crear Tarea
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCrearTarea(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <h3>Lista de Tareas</h3>
          {/* VERIFICACIÓN SEGURA: Solo renderizar si tareas es un array */}
          {Array.isArray(tareas) && tareas.length > 0 ? (
            tareas.map(tarea => (
              <TareaCard 
                key={tarea.id_tarea} 
                tarea={tarea} 
                usuarios={usuarios}
                onUpdate={cargarTareasYUsuarios}
              />
            ))
          ) : (
            <div className="alert alert-info">
              No hay tareas disponibles. Crea la primera tarea.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}