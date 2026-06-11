import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
import PremiumModal from "../Usuario/Premium";

export default function ApplyPasantia() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [applied, setApplied] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Leer si el estudiante es premium desde localStorage
  const isPremiumUser = localStorage.getItem("isPremium") === "true";

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/ofertas");
        const data = await res.json();
        if (data.success) {
          // Ofertas premium primero
          const sorted = [...data.ofertas].sort((a, b) => {
            if (a.isPremium && !b.isPremium) return -1;
            if (!a.isPremium && b.isPremium) return 1;
            return 0;
          });
          setInternships(sorted);
        } else {
          alert(data.message || "Error fetching offers");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching offers from server");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const applyToInternship = async (job) => {
    // Si la oferta es premium y el usuario NO es premium → abrir modal
    if (job.isPremium && !isPremiumUser) {
      setShowPremiumModal(true);
      return;
    }

    try {
      const studentId = localStorage.getItem("studentId");
      if (!studentId) {
        alert("No studentId found. Please log in again.");
        return;
      }

      const res = await fetch("http://localhost:4000/api/aplicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, internshipId: job.id }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.limitReached) {
          setShowPremiumModal(true);
        } else {
          alert(data.message);
        }
        return;
      }

      setApplied([...applied, job.id]);
      alert("Aplicación enviada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al aplicar");
    }
  };

  const studentId = localStorage.getItem("studentId");

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Modal Premium */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Internships</h1>
        <button
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
          onClick={() => navigate(`/student/cv/view/${studentId}`)}
        >
          My CV
        </button>
      </header>

      {loading ? (
        <p className="text-gray-500">Loading internships...</p>
      ) : internships.length === 0 ? (
        <p className="text-gray-500">No active internships available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((job) => {
            const isLocked = job.isPremium && !isPremiumUser;
            const alreadyApplied = applied.includes(job.id);

            return (
              <div
                key={job.id}
                className={`bg-white shadow rounded-xl p-4 border transition hover:shadow-md relative ${
                  job.isPremium
                    ? "border-yellow-400 shadow-yellow-100"
                    : "border-gray-100"
                }`}
              >
                {/* Overlay candado para ofertas premium bloqueadas */}
                {isLocked && (
                  <div
                    className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-2 z-10 cursor-pointer"
                    onClick={() => setShowPremiumModal(true)}
                  >
                    <div className="bg-yellow-400 p-3 rounded-full shadow">
                      <Lock size={22} className="text-yellow-900" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">Oferta exclusiva</p>
                    <p className="text-xs text-gray-500 text-center px-4">
                      Hazte Premium para aplicar a esta oferta
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                      <Crown size={11} /> Ver planes Premium
                    </span>
                  </div>
                )}

                {/* Badge Premium de la Oferta */}
                {job.isPremium && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                    <Crown size={11} />
                    Premium
                  </span>
                )}

                <h3 className="font-bold text-gray-800 text-lg mb-1">{job.titulo}</h3>

                <p className="text-sm text-gray-600 mb-1">
                  {job.company || "Unknown company"} • {job.ubicacion}
                  {job.isPremium && (
                    <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                      <Crown size={11} />
                      Premium Company
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-500 mb-3">{job.descripcion}</p>

                <button
                  onClick={() => applyToInternship(job)}
                  disabled={alreadyApplied}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    alreadyApplied
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-teal-700 text-white hover:bg-teal-800"
                  }`}
                >
                  {alreadyApplied ? "Already Applied" : "Apply to Internship"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => navigate("/estudiante")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
