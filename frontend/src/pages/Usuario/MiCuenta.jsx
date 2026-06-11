import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyAccount() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT
        const res = await fetch("https://uconecta-backend.onrender.com/api/usuario/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            joined: data.user.joined || "N/A",
          });
        } else {
          console.error("Error fetching user:", data.message);
        }
      } catch (err) {
        console.error("Error al conectar con la API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  // función para redirigir al dashboard correcto según el rol
  const goToDashboard = () => {
    if (user.role === "estudiante") navigate("/student");
    else if (user.role === "empresa") navigate("/company");
    else if (user.role === "universidad") navigate("/university");
    else navigate("/"); // fallback
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
        <h2 className="w-24 h-24 bg-teal-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
          UC
        </h2>

        <div className="text-gray-700 text-2xl font-bold mb-2 space-y-4">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rol:</strong> {user.role}
          </p>
          <p>
            <strong>Member since:</strong> {user.joined}
          </p>

          <button
            onClick={goToDashboard}
            className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
