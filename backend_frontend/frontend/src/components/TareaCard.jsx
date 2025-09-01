import { useState } from "react";
import Swal from "sweetalert2";

export default function TareaCard({ tarea, usuarios, onUpdate, onDelete, esAdmin, usuarioActual }) {
  const [editando, setEditando] = useState(false);
  const [tareaEditada, setTareaEditada] = useState({ ...tarea });
  const [guardando, setGuardando] = useState(false);

  // Verificar si el usuario actual es el asignado de la tarea
  const esAsignadoDeTarea = usuarioActual && usuarioActual.id_usuario === tarea.id_usuario_asignado;

  // Verificar si el usuario actual es el creador de la tarea
  const esCreadorDeTarea = usuarioActual && usuarioActual.id_usuario === tarea.id_usuario_creador;

  // Verificar si el usuario puede eliminar la tarea (admin o creador) - ACTUALIZADO
  const puedeEliminarTarea = esAdmin || esCreadorDeTarea;

  // Verificar si el usuario puede editar la tarea (admin o creador)
  const puedeEditarTarea = esAdmin || esCreadorDeTarea;

  // Verificar si el usuario puede cambiar la asignación (admin o creador)
  const puedeCambiarAsignacion = esAdmin || esCreadorDeTarea;

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // Preparar datos para enviar (asegurar tipos correctos)
      const datosActualizados = {
        ...tareaEditada,
        // Asegurar que id_usuario_asignado sea número si es necesario
        id_usuario_asignado: tareaEditada.id_usuario_asignado ? 
          parseInt(tareaEditada.id_usuario_asignado) : tareaEditada.id_usuario_asignado
      };
      
      await onUpdate(tarea.id_tarea, datosActualizados);
      setEditando(false);
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      Swal.fire("Error", "No se pudo actualizar la tarea", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setTareaEditada({ ...tarea });
    setEditando(false);
  };

  const handleEstadoChange = async (nuevoEstado) => {
    try {
      // Enviar solo el nuevo estado
      await onUpdate(tarea.id_tarea, { 
        estado: nuevoEstado
      });
      Swal.fire("Éxito", "Estado actualizado correctamente", "success");
    } catch (error) {
      console.error("Error cambiando estado:", error);
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  // Función segura para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
      return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener valor de fecha para input type="date"
  const getDateInputValue = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'en progreso': return 'info';
      case 'pendiente': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{tarea.titulo}</h6>
        <span className={`badge bg-${getEstadoColor(tarea.estado)}`}>
          {tarea.estado}
        </span>
      </div>
      
      <div className="card-body">
        {editando ? (
          <div>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                value={tareaEditada.titulo || ''}
                onChange={(e) => setTareaEditada({...tareaEditada, titulo: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows="3"
                value={tareaEditada.descripcion || ''}
                onChange={(e) => setTareaEditada({...tareaEditada, descripcion: e.target.value})}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Fecha Límite</label>
              <input
                type="date"
                className="form-control"
                value={getDateInputValue(tareaEditada.fecha_vencimiento)}
                onChange={(e) => setTareaEditada({...tareaEditada, fecha_vencimiento: e.target.value})}
              />
            </div>
            
            {puedeCambiarAsignacion && (
              <div className="mb-3">
                <label className="form-label">Asignado a</label>
                {usuarios && usuarios.length > 0 ? (
                  <select
                    className="form-select"
                    value={tareaEditada.id_usuario_asignado || ''}
                    onChange={(e) => setTareaEditada({...tareaEditada, id_usuario_asignado: e.target.value})}
                  >
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="alert alert-warning py-2">
                    <small>No hay usuarios disponibles para asignar</small>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="card-text">{tarea.descripcion}</p>
            
            <div className="mb-2">
              <strong>Asignado a:</strong>{' '}
              {usuarios && usuarios.find(u => u.id_usuario === tarea.id_usuario_asignado)?.nombre || 'Desconocido'}
            </div>
            
            <div className="mb-2">
              <strong>Creado por:</strong>{' '}
              {tarea.creador_nombre || 'Desconocido'}
            </div>
            
            <div className="mb-2">
              <strong>Fecha límite:</strong>{' '}
              {formatDate(tarea.fecha_vencimiento)}
            </div>
            
            <div className="mb-2">
              <strong>Creado:</strong>{' '}
              {formatDate(tarea.fecha_creacion)}
            </div>

            {/* NUEVO: Mostrar fecha de modificación si existe */}
            {tarea.fecha_modificacion && (
              <div className="mb-2">
                <strong>Última modificación:</strong>{' '}
                {formatDate(tarea.fecha_modificacion)}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="card-footer">
        {editando ? (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-success btn-sm" 
              onClick={handleGuardar}
              disabled={guardando}
            >
              <i className="bi bi-check"></i> {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleCancelar}
              disabled={guardando}
            >
              <i className="bi bi-x"></i> Cancelar
            </button>
          </div>
        ) : (
          <div className="d-flex gap-2 flex-wrap">
            {/* Botón de editar - para admin y creadores */}
            {puedeEditarTarea && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setEditando(true)}
              >
                <i className="bi bi-pencil"></i> Editar
              </button>
            )}
            
            {/* Selector de estado - solo para el usuario asignado a la tarea */}
            {esAsignadoDeTarea && (
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={tarea.estado || 'pendiente'}
                onChange={(e) => handleEstadoChange(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            )}
            
            {/* Botón de eliminar - para admin y creadores (REQUERIMIENTO #1) */}
            {puedeEliminarTarea && onDelete && (
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(tarea.id_tarea, tarea)}
              >
                <i className="bi bi-trash"></i> Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}