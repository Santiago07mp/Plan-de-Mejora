import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Reportes() {
  const { token } = useContext(AuthContext);
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      const res = await fetch("http://localhost:3000/api/reportes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReportes(data);
    };
    fetchReportes();
  }, [token]);

  return (
    <div className="container mt-5">
      <h2>Reportes</h2>
      <ul className="list-group">
        {reportes.map(r => (
          <li key={r.id} className="list-group-item">
            {r.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}
