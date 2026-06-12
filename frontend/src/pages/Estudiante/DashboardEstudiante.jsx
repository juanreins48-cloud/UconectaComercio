import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    recommendations: 0,
    views: 0,
  });

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔔 NOTIFICACIONES
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // 🔗 Cargar Dashboard

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const res = await fetch(`https://uconecta-backend.onrender.com/api/dashboard/estudiante/${userId}`);
        const data = await res.json();

        setStats(data.stats);
        setRecent(data.recent);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos del dashboard");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔔 Cargar Notificaciones
const loadNotifications = async () => {
  const studentId = localStorage.getItem("studentId");

  try {
    const res = await fetch(`https://uconecta-backend.onrender.com/api/notificaciones/${studentId}`);
    const data = await res.json();

    // ✅ aseguramos que siempre sea un array
    const notiArray = Array.isArray(data.notifications)
      ? data.notifications
      : Array.isArray(data)
      ? data
      : [];

    setNotifications(notiArray);
    setShowNotifications(true);
  } catch (error) {
    console.error("Error loading notifications:", error);
    setNotifications([]); // fallback seguro
    setShowNotifications(true);
  }
};


  if (loading)
    return <div className="p-10 text-center text-gray-600">Loading information...</div>;

  if (error)
    return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-sm p-6">
        <div className="flex items-center">
          <button className="rounded-full w-12 h-12 bg-teal-800 text-white font-bold flex items-center justify-center">
            UC
          </button>
          <h2 className="text-2xl font-bold text-black-800 ml-2">U Conecta</h2>
        </div>

        <p className="text-mn text-teal-800 mb-4">Student Portal</p>

        <nav className="space-y-4">
         {/*hazte premium botom*/}
          <button
          onClick={() => navigate("/premium/checkout")}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg shadow transition"
        >
          <Crown size={18} />
           Premium plan 
        </button>
          <button className="block w-full text-left text-gray-700 hover:text-teal-700 font-medium">
            
          </button>

          {/* 🔔 botón para abrir notificaciones */}
          <button
            onClick={loadNotifications}
            className="block w-full text-left text-gray-700 hover:text-teal-700 font-medium"
          >
            Notifications
          </button>

          <a
            href="#"
            className="block text-gray-700 hover:text-teal-600"
            onClick={() => navigate("/ajustesCuenta")}
          >
            Account Settings
          </a>
          <a
            href="#"
            className="block text-gray-700 hover:text-teal-600"
            onClick={() => navigate("/soporte")}
          >
            Help & Support
          </a>
          <button
  onClick={() => {
    localStorage.clear();
    navigate("/");
  }}
  className="block w-full text-left text-red-600 hover:text-red-800 font-medium"
>
  Logout
</button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <section className="bg-teal-100 rounded-2xl p-6 mb-8 grid grid-cols-2 items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
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

        {/* METRICS */}
        <section className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Applications Sent</p>
            <h2 className="text-3xl font-bold text-teal-700">{stats.applications}</h2>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Interviews Scheduled</p>
            <h2 className="text-3xl font-bold text-teal-700">{stats.interviews}</h2>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Offers Received</p>
            <h2 className="text-3xl font-bold text-teal-700">{stats.recommendations}</h2>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Profile Views</p>
            <h2 className="text-3xl font-bold text-teal-700">{stats.views}</h2>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-6">
            <div
              className="bg-teal-100 hover:bg-teal-200 transition-all rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate("/Cv")}
            >
              <h3 className="text-lg font-semibold text-teal-800">Manage CV</h3>
              <p className="text-sm text-gray-700 mt-1">Update your profile and resume</p>
            </div>

            <div
              className="bg-teal-100 hover:bg-teal-200 transition-all rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate("/aplicarpasantia")}
            >
              <h3 className="text-lg font-semibold text-teal-800">Apply to Internships</h3>
              <p className="text-sm text-gray-700 mt-1">Browse and apply to available positions</p>
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Recent Activity</h2>
          <p className="text-gray-500 text-sm mb-4">Your latest updates and notifications</p>

          <div className="space-y-3">
            {recent.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  i === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <p className="font-medium text-gray-800">{item.title}</p>
                <span className="text-sm text-gray-600">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 🔔 MODAL NOTIFICACIONES */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[400px] shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-teal-700">Notifications</h2>

            {notifications.length === 0 ? (
              <p className="text-gray-600">No notifications yet.</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-gray-800">{n.mensaje}</p>
                    <small className="text-gray-500 text-sm">
  {new Date(n.creada_en).toLocaleString()}
</small>

                  </li>
                ))}
              </ul>
            )}

            <button
              className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg"
              onClick={() => setShowNotifications(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
