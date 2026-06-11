import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {//cambiar el api
      const res = await fetch("https://uconecta-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      

      if (!data.success) {
        alert(data.message);
        setLoading(false);
        return;
      }

      // Guardar sesión //por ahora no se guarda en la bd, pones el api y despues quitas el local store
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role); // admin, empresa, estudiante
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("studentId", data.studentId);
      localStorage.setItem("empresaId", data.empresaId);
      localStorage.setItem("isPremium", data.isPremium);

      // Redirigir según el rol
      if (data.role === "estudiante") navigate("/estudiante");
      else if (data.role === "empresa") navigate("/empresa");
      else if (data.role === "universidad") navigate("/university");

      

    } catch (error) {
      console.error("Error en login:", error);
      alert("Error en el servidor.");
    }

    setLoading(false);
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center text-xl font-bold">
            UC
          </div>
          <h1 className="text-2xl font-bold mt-4">U Conecta</h1>
          <p className="text-gray-600 text-center text-sm mt-1">
            Connect students, companies, and universities
          </p>
        </div>

        <div className="flex bg-gray-200 rounded-full mb-6">
          <button className="w-1/2 py-2 bg-white rounded-full shadow">Login</button>
          <button
            className="w-1/2 py-2 text-gray-500"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2">Welcome back</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter your credentials to access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div>
        
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
            
          </button>
        </form>
          
        <p className="text-xs text-center text-gray-500 mt-6">
          Demo accounts:
          <br />
          student@demo.com | ingeSAS@demo.com | unicartagena@demo.com
        </p>
      </div>
    </div>
    
  );
}