import { useEffect, useState } from "react";
import api from "../services/api";
import TareaCard from "../components/TareaCard";

function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const cargarTareas = async () => {
    const res = await api.get("/tareas");
    setTareas(res.data);
  };

  const crearTarea = async (e) => {
    e.preventDefault();
    await api.post("/tareas", { titulo, descripcion });
    setTitulo("");
    setDescripcion("");
    cargarTareas();
  };

  const actualizarTarea = async (id) => {
    await api.put(`/tareas/${id}`, { estado: "completada" });
    cargarTareas();
  };

  const eliminarTarea = async (id) => {
    await api.delete(`/tareas/${id}`);
    cargarTareas();
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  return (
    <div>
      <h2>Mis Tareas</h2>
      <form onSubmit={crearTarea}>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" />
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" />
        <button type="submit">Crear</button>
      </form>
      {tareas.map((t) => (
        <TareaCard key={t.id_tarea} tarea={t} onUpdate={actualizarTarea} onDelete={eliminarTarea} />
      ))}
    </div>
  );
}

export default Tareas;
