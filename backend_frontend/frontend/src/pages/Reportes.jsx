import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

// Importación corregida para jsPDF
import { jsPDF } from "jspdf";
// Importamos autoTable por separado
import autoTable from 'jspdf-autotable';

export default function Reportes() {
  const { token, usuario, isAdmin } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tareasData, usuariosData] = await Promise.all([
        api.getTareas(token),
        api.getUsers(token)
      ]);

      setTareas(Array.isArray(tareasData) ? tareasData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
      setTareas([]);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fechas a formato YYYY-MM-DD para comparación
  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Filtrar tareas según los criterios seleccionados (solo tareas completadas)
  const tareasFiltradas = tareas.filter(tarea => {
    // Solo mostrar tareas completadas
    if (tarea.estado !== 'completada') {
      return false;
    }
    
    // Filtro por usuario asignado
    if (filtroUsuario !== "todos" && tarea.id_usuario_asignado != filtroUsuario) {
      return false;
    }
    
    // Obtener fecha de modificación (cuando se completó la tarea)
    const fechaCompletada = formatDateForComparison(tarea.fecha_modificacion);
    
    // Filtro por fecha de inicio
    if (fechaInicio && fechaCompletada < fechaInicio) {
      return false;
    }
    
    // Filtro por fecha de fin
    if (fechaFin && fechaCompletada > fechaFin) {
      return false;
    }
    
    return true;
  });

  const validarFechas = () => {
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      Swal.fire("Error", "La fecha de inicio no puede ser mayor que la fecha de fin", "error");
      return false;
    }
    return true;
  };

  const aplicarFiltros = () => {
    if (!validarFechas()) {
      return;
    }
    // El filtrado se realiza automáticamente a través del estado
  };

  const exportarCSV = () => {
    if (tareasFiltradas.length === 0) {
      Swal.fire("Info", "No hay datos para exportar", "info");
      return;
    }

    // Encabezados CSV
    let csvContent = "Título,Descripción,Usuario Asignado,Creador,Fecha Creación,Fecha Vencimiento,Fecha Completada\n";
    
    // Datos
    tareasFiltradas.forEach(tarea => {
      csvContent += `"${tarea.titulo || ''}","${tarea.descripcion || ''}",${tarea.asignado_nombre || ''},${tarea.creador_nombre || ''},${tarea.fecha_creacion || ''},${tarea.fecha_vencimiento || ''},${tarea.fecha_modificacion || ''}\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_tareas_completadas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire("Éxito", "Reporte exportado en formato CSV", "success");
  };

  const exportarPDF = () => {
    if (tareasFiltradas.length === 0) {
      Swal.fire("Info", "No hay datos para exportar", "info");
      return;
    }

    // Crear instancia de jsPDF
    const doc = new jsPDF();
    
    // Título del reporte
    doc.setFontSize(18);
    doc.text("Reporte de Tareas Completadas", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    // Información del rango de fechas
    let fechaInfo = "Todas las fechas";
    if (fechaInicio || fechaFin) {
      fechaInfo = `${fechaInicio || 'Inicio'} - ${fechaFin || 'Fin'}`;
    }
    doc.text(`Período: ${fechaInfo} | Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Preparar datos para la tabla
    const tableData = tareasFiltradas.map(tarea => [
      tarea.titulo || '',
      tarea.asignado_nombre || '',
      tarea.creador_nombre || '',
      tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toLocaleDateString() : '',
      tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento).toLocaleDateString() : '',
      tarea.fecha_modificacion ? new Date(tarea.fecha_modificacion).toLocaleDateString() : 'N/A'
    ]);
    
    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 45,
      head: [['Título', 'Asignado a', 'Creado por', 'Fecha Creación', 'Fecha Vencimiento', 'Fecha Completada']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    // Guardar PDF
    doc.save(`reporte_tareas_completadas_${new Date().toISOString().split('T')[0]}.pdf`);
    
    Swal.fire("Éxito", "Reporte exportado en formato PDF", "success");
  };

  // Estadísticas para el dashboard
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
          <p className="mt-2">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Botón para volver al inicio - Mismo estilo que en Tareas.jsx */}
      <div className="mb-3">
        <Link to="/dashboard" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Inicio
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Reportes de Tareas Completadas</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={exportarCSV}>
            <i className="bi bi-file-earmark-spreadsheet"></i> Exportar CSV
          </button>
          <button className="btn btn-danger" onClick={exportarPDF}>
            <i className="bi bi-file-earmark-pdf"></i> Exportar PDF
          </button>
        </div>
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

      {/* Filtros para reportes - Solo para tareas completadas */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filtros de Reporte (Solo tareas completadas)</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label htmlFor="filtroUsuario" className="form-label">Usuario</label>
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
              <label htmlFor="fechaInicio" className="form-label">Fecha Inicio (Completadas)</label>
              <input
                type="date"
                id="fechaInicio"
                className="form-control"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="fechaFin" className="form-label">Fecha Fin (Completadas)</label>
              <input
                type="date"
                id="fechaFin"
                className="form-control"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12 text-end">
              <button 
                className="btn btn-primary me-2"
                onClick={aplicarFiltros}
              >
                <i className="bi bi-funnel me-1"></i> Aplicar Filtros
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFiltroUsuario("todos");
                  setFechaInicio("");
                  setFechaFin("");
                }}
              >
                <i className="bi bi-x-circle me-1"></i> Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            Tareas Completadas
            <span className="badge bg-primary ms-2">{tareasFiltradas.length}</span>
          </h5>
        </div>
        <div className="card-body">
          {tareasFiltradas.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Usuario Asignado</th>
                    <th>Creado por</th>
                    <th>Fecha Creación</th>
                    <th>Fecha Vencimiento</th>
                    <th>Fecha Completada</th>
                  </tr>
                </thead>
                <tbody>
                  {tareasFiltradas.map(tarea => (
                    <tr key={tarea.id_tarea}>
                      <td>{tarea.titulo}</td>
                      <td>{tarea.asignado_nombre}</td>
                      <td>{tarea.creador_nombre}</td>
                      <td>{tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toLocaleDateString() : ''}</td>
                      <td>{tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento).toLocaleDateString() : ''}</td>
                      <td>
                        {tarea.fecha_modificacion ? new Date(tarea.fecha_modificacion).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-inbox display-4 text-muted"></i>
              <p className="mt-3 text-muted">No hay tareas completadas que coincidan con los filtros seleccionados.</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => {
                  setFiltroUsuario("todos");
                  setFechaInicio("");
                  setFechaFin("");
                }}
              >
                <i className="bi bi-arrow-clockwise"></i> Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}