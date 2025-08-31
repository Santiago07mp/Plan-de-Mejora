// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  );
}