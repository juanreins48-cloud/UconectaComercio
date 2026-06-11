import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HelpSupport() {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Obtener info del usuario para redirigir correctamente
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://uconecta-backend.onrender.com/api/usuario/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setUser({
            id: data.user.id,
            role: data.user.role,
          });
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://uconecta-backend.onrender.com/api/soporte", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert("Tu mensaje fue enviado correctamente");
        setForm({ subject: "", message: "" });
      } else {
        alert(data.message || "No se pudo enviar el mensaje");
      }
    } catch (err) {
      console.error("Error al conectar con la API:", err);
      alert("Error de conexión. Mensaje guardado localmente.");
      localStorage.setItem("support_backup", JSON.stringify(form));
    }
  };

  // 🔹 Función para ir al dashboard según rol
  const goToDashboard = () => {
    if (user.role === "estudiante") navigate("/student");
    else if (user.role === "empresa") navigate("/company");
    else if (user.role === "universidad") navigate("/university");
    else navigate("/"); // fallback
  };

  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h2 className="text-center text-2xl font-bold text-teal-800 mb-6">
          Help & Support
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Need help? Send us a message and our support team will contact you soon.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-600"
              placeholder="Write your subject"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-600"
              placeholder="Describe your issue"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 text-white rounded-lg py-2 font-medium hover:bg-teal-800"
          >
            Send Message
          </button>

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Exit
          </button>
        </form>
      </div>
    </div>
  );
}
