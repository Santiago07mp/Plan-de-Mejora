import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Notificaciones() {
  const { token } = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const res = await fetch("http://localhost:3000/api/notificaciones", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotificaciones(data);
    };
    fetchNotificaciones();
  }, [token]);

  return (
    <div className="container mt-5">
      <h2>Notificaciones</h2>
      <ul className="list-group">
        {notificaciones.map(n => (
          <li key={n.id_notificacion} className="list-group-item">
            {n.mensaje} {n.leido ? "(Leído)" : "(Pendiente)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
