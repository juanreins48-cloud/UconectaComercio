import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    //politica de privacidad
    if (!acceptedPolicy) {
  setErrorMsg("You must accept the data protection policy.");
  setLoading(false);
  return;
}

    try {//cambiar api
      const response = await fetch("https://uconecta-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          acceptedPolicy,
          policyDate: new Date()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Error registering user");
        setLoading(false);
        return;
      }

      // REGISTRO EXITOSO: redirigir al login
      navigate("/");

    } catch (error) {
      setErrorMsg("Server error. Try again later.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center text-xl font-bold">
            UC
          </div>
          <h1 className="text-2xl font-bold mt-4">U Conecta</h1>
          <p className="text-gray-600 text-center text-sm mt-1">
            Connect students, companies, and universities
          </p>
        </div>

        {/* SWITCH LOGIN/REGISTER */}
        <div className="flex bg-gray-200 rounded-full mb-6">
          <button
            className="w-1/2 py-2 text-gray-500"
            onClick={() => navigate("/")}
          >
            Login
          </button>

          <button className="w-1/2 py-2 bg-white rounded-full shadow">
            Register
          </button>
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold mb-4">Create account</h2>

        {errorMsg && (
          <p className="text-red-500 text-sm mb-3 text-center">{errorMsg}</p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">I am a</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border rounded-xl"
            >
              <option>Student</option>
              <option>Company</option>
    
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border rounded-xl"
            />
          </div>

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
              placeholder="Create a password"
              className="w-full p-3 border rounded-xl"
            />
          </div>
              <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
            className="mt-1"
          />

          <p className="text-gray-600">
           I accept the{" "}
            <a
              href="/politica-datos"
              className="text-teal-700 underline"
              target="_blank"
            >
              Data Protection Policy
            </a>
          </p>
        </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}