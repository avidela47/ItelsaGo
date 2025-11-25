"use client";
import { useEffect, useState } from "react";

interface Alert {
  _id: string;
  criteria: Record<string, any>;
  active: boolean;
  createdAt: string;
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/alerts")
      .then(res => res.json())
      .then(data => {
        setAlerts(data.alerts || []);
        setLoading(false);
      });
  }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/user/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active })
    });
    setAlerts(alerts => alerts.map(a => a._id === id ? { ...a, active: !active } : a));
  };

  const deleteAlert = async (id: string) => {
    await fetch(`/api/user/alerts/${id}`, { method: "DELETE" });
    setAlerts(alerts => alerts.filter(a => a._id !== id));
  };

  if (loading) return <div>Cargando alertas...</div>;

  return (
    <div>
      <h2>Mis Alertas Guardadas</h2>
      {alerts.length === 0 ? (
        <p>No tienes alertas guardadas.</p>
      ) : (
        <ul>
          {alerts.map(alert => (
            <li key={alert._id} style={{ marginBottom: 16 }}>
              <pre style={{ display: "inline-block", marginRight: 16 }}>{JSON.stringify(alert.criteria, null, 2)}</pre>
              <button onClick={() => toggleActive(alert._id, alert.active)}>
                {alert.active ? "Desactivar" : "Activar"}
              </button>
              <button onClick={() => deleteAlert(alert._id)} style={{ marginLeft: 8, color: "red" }}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
