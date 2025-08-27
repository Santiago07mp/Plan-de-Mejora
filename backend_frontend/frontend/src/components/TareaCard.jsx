function TareaCard({ tarea, onUpdate, onDelete }) {
  return (
    <div style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
      <h3>{tarea.titulo}</h3>
      <p>{tarea.descripcion}</p>
      <p>Estado: {tarea.estado}</p>
      <button onClick={() => onUpdate(tarea.id_tarea)}>Actualizar</button>
      <button onClick={() => onDelete(tarea.id_tarea)}>Eliminar</button>
    </div>
  );
}

export default TareaCard;
