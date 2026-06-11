import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

export default function CompanyDashboard({ empresaId }) {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({
    activeOffers: 0,
    applications: 0,
    interviews: 0,
    filled: 0
  });
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const id = empresaId || localStorage.getItem("empresaId");
      
      console.log("ID usado para fetch:", id); // debug temporal

      if (!id || id === "null") {
        setError("Sesión no encontrada. Por favor inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:4000/api/dashboard/empresa/${id}`);
      if (!res.ok) throw new Error("Error al cargar datos del dashboard");

      const data = await res.json();
      setStats(data.stats);
      setOffers(data.offers);
      setRecent(data.recent);
    } catch (err) {
      console.error(err);
      setError("Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [empresaId]);

  if (loading) return <p className="p-6">Cargando dashboard...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <div className="flex items-center">
          <button className="rounded-full w-12 h-12 bg-teal-800 text-white font-bold flex items-center justify-center">
            UC
          </button>
          <h2 className="text-2xl font-bold text-black-800 ml-2">U Conecta</h2>
        </div>
        <p className="text-mn text-teal-800 mb-4">Company Portal</p>
          <button
          onClick={() => navigate("/premium/checkout")}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg shadow transition"
        >
          <Crown size={18} />
           Premium plan 
        </button>
          <button className="block w-full text-left text-gray-700 hover:text-teal-700 font-medium">
            
          </button> 
          <nav className="space-y-3">
          <a href="#" className="block text-gray-700 hover:text-teal-600"> </a>
          <a href="#" className="block text-gray-700 hover:text-teal-600" onClick={() => navigate("/ajustesCuenta")}>Account Settings</a>
          <a href="#" className="block text-gray-700 hover:text-teal-600" onClick={() => navigate("/soporte")}>Help & Support</a>
        </nav>{/*hazte premium botom*/}
       
      </aside>
       

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-center items-center mb-6">
          <section className="bg-teal-100 rounded-2xl p-6 mb-8 grid grid-cols-2 items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Company Dashboard</h1>
              <p className="text-gray-500">
                Post and manage your internship offers, review applications.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-medium border rounded-lg hover:bg-gray-100 bg-white shadow-sm"
                onClick={() => navigate("/Micuenta")}
              >
                My Account
              </button>
            </div>
          </section>
        </header>

        {/* Stats section */}
        <section className="bg-white-50 rounded-2xl p-6 mb-8 grid grid-cols-4 gap-4">
          <div className="bg-white shadow-sm rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Active Offers</p>
            <h2 className="text-xl font-semibold">{stats.activeOffers}</h2>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Applications Received</p>
            <h2 className="text-xl font-semibold">{stats.applications}</h2>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Interviews Scheduled</p>
            <h2 className="text-xl font-semibold">{stats.interviews}</h2>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Positions Filled</p>
            <h2 className="text-xl font-semibold">{stats.filled}</h2>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-8">
          <button className="font-semibold mb-3 text-gray-800">Quick Actions</button>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-teal-100 hover:bg-teal-200 rounded-xl p-4 text-left transition"
              onClick={() => navigate("/PostOfertas")}
            >
              <h3 className="font-medium text-gray-800">Post Internship Offers</h3>
              <p className="text-sm text-gray-600">Create new internship positions</p>
            </button>

            <button
              className="bg-teal-100 hover:bg-teal-200 rounded-xl p-4 text-left transition"
              onClick={() => navigate("/manejarOfertas")}
            >
              <h3 className="font-medium text-gray-800">Manage Applications</h3>
              <p className="text-sm text-gray-600">Review and process candidate applications</p>
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="font-semibold mb-3 text-gray-800">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow divide-y">
            {recent.map((item, index) => (
              <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p><strong>{item.message}</strong></p>
                  <span className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                {item.tipo === "nueva_aplicacion" && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
