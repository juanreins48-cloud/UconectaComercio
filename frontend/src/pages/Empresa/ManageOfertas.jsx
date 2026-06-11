import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

export default function ManageApplications() {
  const navigate = useNavigate();
  const empresaId = localStorage.getItem("empresaId");

  const [students, setStudents] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCV, setSelectedCV] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(null);
  const [acceptMessage, setAcceptMessage] = useState("");

  useEffect(() => {
    if (!empresaId) return;

    fetch(`http://https://uconecta-backend.onrender.com/api/solicitudes/company/${empresaId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Cambio: ordenar estudiantes premium primero
          const sorted = [...(data.data || [])].sort((a, b) => {
            if (a.isPremium && !b.isPremium) return -1;
            if (!a.isPremium && b.isPremium) return 1;
            return 0;
          });
          setStudents(sorted);
        } else {
          console.error("Error:", data.message);
          setStudents([]);
        }
      })
      .catch((err) => console.error("Error loading applications:", err))
      .finally(() => setLoading(false));
  }, [empresaId]);

  const handleDecision = async (aplicacionId, decision) => {
    setDecisions({ ...decisions, [aplicacionId]: decision });

    try {
      await fetch(`https://uconecta-backend.onrender.com/api/solicitudes/${aplicacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      });
    } catch (err) {
      console.error("Error updating decision:", err);
    }
  };

  const viewCV = (student) => {
    const cvData = {
      full_name: student.full_name || student.cv_nombre || student.estudiante_nombre,
      email: student.email || student.cv_email || student.estudiante_email,
      phone: student.phone || student.cv_phone || "N/A",
      summary: student.summary || "Sin resumen disponible",
      experience: student.experience || "Sin experiencia registrada",
      education: student.education || "Sin información académica",
      skills: student.skills || "",
      aplicacion_id: student.aplicacion_id,
      estado: student.estado,
    };
    setSelectedCV(cvData);
  };

  const openAcceptModal = (student) => {
    setShowAcceptModal(student);
    setAcceptMessage("");
  };

  const sendAcceptance = async () => {
    if (!showAcceptModal) return;

    const aplicacionId = showAcceptModal.aplicacion_id;

    try {
      await fetch(`http://https://uconecta-backend.onrender.com/api/solicitudes/${aplicacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "aceptado",
          mensaje: acceptMessage,
        }),
      });

      setDecisions({ ...decisions, [aplicacionId]: "aceptado" });
      setShowAcceptModal(null);
      setAcceptMessage("");

      setLoading(true);
      const res = await fetch(`http://https://uconecta-backend.onrender.com/api/solicitudes/company/${empresaId}`);
      const data = await res.json();
      if (data.success) {
        const sorted = [...(data.data || [])].sort((a, b) => {
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          return 0;
        });
        setStudents(sorted);
      }
      setLoading(false);

    } catch (err) {
      console.error("Error sending acceptance:", err);
      alert("Error sending acceptance");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-between">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Apply Manage</h1>
        <button
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
          onClick={() => navigate("/company")}
        >
          Back
        </button>
      </header>

      <section className="flex-1">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Applied Students
        </h2>

        {students.length === 0 ? (
          <p className="text-gray-500">No hay aplicaciones todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.aplicacion_id}
                className={`bg-white shadow rounded-xl p-4 border transition hover:shadow-md ${
                  student.isPremium
                    ? "border-yellow-400 shadow-yellow-100"
                    : "border-gray-100"
                }`}
              >
                {/* Badge Premium del Estudiante */}
                {student.isPremium && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                    <Crown size={11} />
                    Premium Student
                  </span>
                )}

                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  {student.full_name || student.estudiante_nombre}
                </h3>

                <p className="text-sm text-gray-400 mb-1">
                  {student.email || student.estudiante_email}
                </p>

                <p className="text-sm text-gray-600 mb-3">
                  {student.education
                    ? student.education.split("\n")[0]
                    : "No academic info"}
                </p>

                <p className="text-xs text-gray-500 italic mb-3">
                  Estado: {student.estado}
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => viewCV(student)}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Curriculum Vitae
                  </button>

                  <button
                    onClick={() => openAcceptModal(student)}
                    disabled={decisions[student.aplicacion_id] === "aceptado"}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      decisions[student.aplicacion_id] === "aceptado"
                        ? "bg-teal-700 text-green-600 cursor-not-allowed"
                        : "bg-teal-700 text-white hover:bg-green-800"
                    }`}
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleDecision(student.aplicacion_id, "rechazado")
                    }
                    disabled={decisions[student.aplicacion_id] === "rechazado"}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      decisions[student.aplicacion_id] === "rechazado"
                        ? "bg-red-500 text-red-700 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-700"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal CV */}
      {selectedCV && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative max-h-[90vh] overflow-y-auto border border-gray-200">
            <button
              onClick={() => setSelectedCV(null)}
              className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
                Curriculum Vitae
              </h2>
              <p className="text-gray-500 text-sm mt-1">Información del Estudiante</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl shadow-inner mb-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">
                Información Personal
              </h3>
              <p className="mb-1">
                <span className="font-semibold">Nombre:</span> {selectedCV.full_name}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Email:</span> {selectedCV.email}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span>{" "}
                {selectedCV.phone || "N/A"}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Resumen Profesional</h3>
                <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  {selectedCV.summary || "Sin resumen disponible"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Experiencia</h3>
                <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  {selectedCV.experience || "Sin experiencia registrada"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Educación</h3>
                <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  {selectedCV.education || "Sin información académica"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCV.skills
                    ? selectedCV.skills.split(",").map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-teal-600 text-white text-sm rounded-full shadow"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    : <p className="text-gray-600">Sin habilidades registradas</p>}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCV(null)}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Aceptar */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-3">
              Mensaje para {showAcceptModal.full_name || showAcceptModal.estudiante_nombre}
            </h2>

            <textarea
              className="w-full border p-3 rounded-lg h-32"
              placeholder="Escribe un mensaje para el estudiante (opcional)..."
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                onClick={() => { setShowAcceptModal(null); setAcceptMessage(""); }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
                onClick={sendAcceptance}
              >
                Send & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}