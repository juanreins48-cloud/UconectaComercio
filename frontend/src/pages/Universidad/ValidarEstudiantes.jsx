import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ValidarEstudiantes() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("https://uconecta-backend.onrender.com/api/universidad/estudiantes-pendientes");
        const data = await res.json();

        if (!data.success) throw new Error();
        setStudents(data.estudiantes);

      } catch (err) {
        console.error("Error fetching students", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    (s.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const validarEstudiante = async (id) => {
    try {
      const res = await fetch("https://uconecta-backend.onrender.com/api/universidad/validar-estudiante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Error: " + data.message);
        return;
      }

      alert("✔ Estudiante validado");
      setStudents(prev => prev.filter(s => s.id !== id));

    } catch (error) {
      alert("Error al validar.");
    }
  };

  const reportarEstudiante = async (id) => {
    try {
      const res = await fetch("https://uconecta-backend.onrender.com/api/universidad/reportar-estudiante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Error reportando");
        return;
      }

      alert("⚠ Estudiante reportado");
      setStudents(prev => prev.filter(s => s.id !== id));

    } catch (error) {
      alert("Error al reportar");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <header className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Validate Students</h1>

        <button
          className="px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500"
          onClick={() => navigate("/university")}
        >
          Back to Dashboard
        </button>
      </header>

      <input
        className="w-full p-3 border rounded-lg mb-6"
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(student => (
          <div key={student.id} className="bg-white shadow p-4 rounded-xl">

            <h3 className="font-bold text-lg">{student.nombre}</h3>
            <p className="text-sm text-gray-600">{student.email}</p>

            <div className="flex gap-2 mt-3">
              <button
                className="w-1/2 py-2 bg-green-600 text-white rounded-lg"
                onClick={() => validarEstudiante(student.id)}
              >
                Validate
              </button>

              <button
                className="w-1/2 py-2 bg-red-600 text-white rounded-lg"
                onClick={() => reportarEstudiante(student.id)}
              >
                Report
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
