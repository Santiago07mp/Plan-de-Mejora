import { useEffect, useState } from "react";
import api from "../services/api";

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);

  const cargar = async () => {
    const res = await api.get("/notificaciones");
    setNotificaciones(res.data);
  };

  const marcarLeida = async (id) => {
    await api.put(`/notificaciones/${id}/leida`);
    cargar();
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div>
      <h2>Notificaciones</h2>
      {notificaciones.map((n) => (
        <div key={n.id_notificacion}>
          <p>{n.mensaje}</p>
          <p>{n.leida ? "Leída" : "No leída"}</p>
          {!n.leida && <button onClick={() => marcarLeida(n.id_notificacion)}>Marcar como leída</button>}
        </div>
      ))}
    </div>
  );
}

export default Notificaciones;
