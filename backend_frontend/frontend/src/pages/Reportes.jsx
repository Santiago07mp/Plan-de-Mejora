import { useState } from "react";
import api from "../services/api";

function Reportes() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [datos, setDatos] = useState([]);

  const generar = async () => {
    const res = await api.get(`/reportes/tareas?desde=${desde}&hasta=${hasta}`);
    setDatos(res.data);
  };

  return (
    <div>
      <h2>Reporte de Tareas Completadas</h2>
      <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
      <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      <button onClick={generar}>Generar</button>

      <ul>
        {datos.map((d, i) => (
          <li key={i}>
            {d.titulo} - {d.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reportes;
