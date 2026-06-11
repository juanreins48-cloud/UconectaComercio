import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [role, setRole] = useState(""); // rol del usuario
  const [userId, setUserId] = useState(null); // id del usuario
  const [form, setForm] = useState({
    email: "",
    password: "",
    notifications: true,
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener datos del usuario al cargar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://uconecta-backend.onrender.com/api/usuario/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setForm((prev) => ({
            ...prev,
            email: data.user.email,
          }));
          setRole(data.user.role);
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://uconecta-backend.onrender.com/api/usuario/update/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert("Configuración actualizada correctamente");
      } else {
        alert(data.message || "No se pudo actualizar.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error de conexión. Intenta nuevamente.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // 🔹 Redirige al dashboard según el rol
  const goToDashboard = () => {
    if (role === "estudiante") navigate("/student");
    else if (role === "empresa") navigate("/company");
    else if (role === "universidad") navigate("/university");
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Setting account
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-teal-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-teal-200"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="notifications"
              checked={form.notifications}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700">Receive Email notifications</label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-teal-700 text-white rounded-lg py-2 font-semibold hover:bg-teal-800 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={goToDashboard}
              className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Exit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
