import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Swal from 'sweetalert2';

const TareaCard = ({ tarea, onUpdate, usuarios }) => {
  const { token, usuario } = useAuth();
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    estado: tarea.estado,
    id_usuario_asignado: tarea.id_usuario_asignado
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateTarea(token, tarea.id_tarea, formData);
      Swal.fire('Éxito', 'Tarea actualizada correctamente', 'success');
      setEditando(false);
      onUpdate();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteTarea(token, tarea.id_tarea);
        Swal.fire('Eliminada', 'La tarea ha sido eliminada', 'success');
        onUpdate();
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const puedeEditar = usuario.id_usuario === tarea.id_usuario_creador || usuario.rol === 'admin';
  const puedeCambiarEstado = usuario.id_usuario === tarea.id_usuario_asignado;

  return (
    <div className="card mb-3">
      <div className="card-body">
        {editando ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-2">
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="form-control"
                rows="3"
              />
            </div>
            <div className="mb-2">
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="form-select"
                disabled={!puedeCambiarEstado}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
            {usuario.rol === 'admin' && (
              <div className="mb-2">
                <select
                  name="id_usuario_asignado"
                  value={formData.id_usuario_asignado}
                  onChange={handleChange}
                  className="form-select"
                >
                  {usuarios.map(user => (
                    <option key={user.id_usuario} value={user.id_usuario}>
                      {user.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success btn-sm">
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <h5 className="card-title">{tarea.titulo}</h5>
            <p className="card-text">{tarea.descripcion}</p>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className={`badge bg-${
                  tarea.estado === 'completada' ? 'success' :
                  tarea.estado === 'en progreso' ? 'warning' : 'secondary'
                }`}>
                  {tarea.estado}
                </span>
                <small className="text-muted ms-2">
                  Asignada a: {tarea.asignado_nombre}
                </small>
              </div>
              <div>
                {puedeEditar && (
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => setEditando(true)}
                  >
                    Editar
                  </button>
                )}
                {puedeEditar && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDelete}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TareaCard;