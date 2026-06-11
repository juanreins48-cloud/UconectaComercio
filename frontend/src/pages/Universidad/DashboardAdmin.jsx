import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UniversityDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    internships: 0,
    successRate: 0,
  });

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // soporte
  const [showSupportPanel, setShowSupportPanel] = useState(false);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const res = await fetch(
          `https://uconecta-backend.onrender.com/api/dashboard/universidad/${userId}`
        );
        const data = await res.json();

        if (data.success) {
          setStats(data.stats);
          setRecent(data.recent);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // cargar mensajes de soporte (cuando se abra el panel)
  const loadSupportMessages = async () => {
    try {
      setSupportLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://uconecta-backend.onrender.com/api/soporte", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSupportMessages(data.data || []);
      } else {
        console.error("Error loading support messages:", data.message);
      }
    } catch (err) {
      console.error("Error loading support messages:", err);
    } finally {
      setSupportLoading(false);
    }
  };

  const openSupportPanel = () => {
    setShowSupportPanel(true);
    loadSupportMessages();
  };

  const closeSupportPanel = () => {
    setShowSupportPanel(false);
    setSelectedMessage(null);
  };

  const viewMessageDetail = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://uconecta-backend.onrender.com/api/soporte/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedMessage(data.data);
      } else {
        alert(data.message || "No se pudo cargar el mensaje");
      }
    } catch (err) {
      console.error("Error fetching message detail:", err);
      alert("Error al obtener detalle del mensaje");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md p-6">
        <div className="flex items-center">
          <button className="rounded-full w-12 h-12 bg-purple-300 text-white font-bold flex items-center justify-center">
            UC
          </button>

          <h2 className="text-2xl font-bold text-black-800 ml-2">U Conecta</h2>
        </div>

        <nav className="space-y-3 mt-5">
          <button className="block w-full text-left text-gray-700 hover:text-blue-600">
            
          </button>

          <button
            className="block w-full text-left text-gray-700 hover:text-blue-600"
            onClick={() => navigate("/ajustesCuenta")}
          >
            Account Settings
          </button>

          {/* ahora abre panel de soporte */}
          <button
            className="block w-full text-left text-gray-700 hover:text-blue-600"
            onClick={openSupportPanel}
          >
            Support
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        {/* HEADER */}
        <section className="bg-purple-100 rounded-2xl p-6 mb-8 grid grid-cols-2 items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">University Dashboard</h1>
            <p className="text-gray-500">Monitor internship activity across the platform.</p>
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

        {/* METRICS */}
        <section className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-gray-600">Registered Students</p>
            <h2 className="text-2xl font-semibold">{stats.students}</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-gray-600">Partner Companies</p>
            <h2 className="text-2xl font-semibold">{stats.companies}</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-gray-600">Active Internships</p>
            <h2 className="text-2xl font-semibold">{stats.internships}</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-gray-600">Success Rate</p>
            <h2 className="text-2xl font-semibold">{stats.successRate}%</h2>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-3 gap-4">
          <button
            className="bg-purple-100 hover:bg-purple-200 rounded-xl p-4 text-left"
            onClick={() => navigate("/validate-students")}
          >
            <h3 className="font-medium">Validate Students</h3>
            <p className="text-sm text-gray-600">Approve student profiles for eligibility</p>
          </button>

          <button
            className="bg-purple-100 hover:bg-purple-200 rounded-xl p-4 text-left"
            onClick={() => navigate("/validate-companies")}
          >
            <h3 className="font-medium">Validate Companies</h3>
            <p className="text-sm text-gray-600">Approve companies to post offers</p>
          </button>

          <button
            className="bg-purple-100 hover:bg-purple-200 rounded-xl p-4 text-left"
            onClick={() => navigate("/generate-statistics")}
          >
            <h3 className="font-medium">Generate Statistics</h3>
            <p className="text-sm text-gray-600">View analytics on internships</p>
          </button>
        </div>

        {/* RECENT ACTIVITY */}
        <section className="mt-8">
          <h2 className="font-semibold mb-3">Recent Activity</h2>

          <div className="bg-white rounded-xl shadow divide-y">
            {recent.length === 0 ? (
              <div className="p-4 text-gray-500">No recent activity</div>
            ) : (
              recent.map((item, index) => (
                <div key={index} className="p-4">
                  <p>{item.descripcion}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(item.creada_en).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ---------- SUPPORT PANEL (drawer/modal) ---------- */}
      {showSupportPanel && (
        <div className="fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={closeSupportPanel}
          />

          <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Support Messages</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedMessage(null); }}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  List
                </button>
                <button
                  onClick={closeSupportPanel}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 border-r pr-4">
                {supportLoading ? (
                  <div>Loading messages...</div>
                ) : supportMessages.length === 0 ? (
                  <div className="text-gray-500">No support messages</div>
                ) : (
                  supportMessages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => viewMessageDetail(m.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{m.subject}</p>
                          <p className="text-sm text-gray-500">{m.sender_name || m.sender_email}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(m.enviada_en).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="col-span-2 pl-4">
                {selectedMessage ? (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{selectedMessage.subject}</h4>
                    <p className="text-sm text-gray-500 mb-2">From: {selectedMessage.sender_name} — {selectedMessage.sender_email}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedMessage.message}</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Back to list
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Select a message to view details</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
