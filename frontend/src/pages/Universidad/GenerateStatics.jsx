import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GenerateStatistics() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("estudiantes");
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [accepted, setAccepted] = useState([]);

  // ================================
  // CARGA DE DATOS
  // ================================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const urls = [
          "/api/universidad/estadisticas/estudiantes",
          "/api/universidad/estadisticas/empresas",
          "/api/universidad/estadisticas/ofertas",
          "/api/universidad/estadisticas/aplicaciones",
          "/api/universidad/estadisticas/aceptados",
        ];

        const responses = await Promise.all(
          urls.map((u) =>
            fetch(`https://uconecta-backend.onrender.com${u}`).then((r) => r.json())
          )
        );

        setStudents(responses[0].estudiantes || []);
        setCompanies(responses[1].empresas || []);
        setOffers(responses[2].ofertas || []);
        setApplications(responses[3].aplicaciones || []);
        setAccepted(responses[4].aceptados || []);
      } catch (e) {
        console.error("Error loading statistics:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ================================
  // COMPONENTE DE TABS
  // ================================
  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg border transition ${
        activeTab === id
          ? "bg-purple-600 text-white border-purple-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">Loading Statistics...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          General Platform Statistics
        </h1>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
          onClick={() => navigate("/university")}
        >
          Back to Dashboard
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        <TabButton id="estudiantes" label="Students" />
        <TabButton id="empresas" label="Companies" />
        <TabButton id="ofertas" label="Offers" />
        <TabButton id="aplicaciones" label="Applications" />
        <TabButton id="aceptados" label="Accepted" />
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">

        {/* 1. ESTUDIANTES */}
        {activeTab === "estudiantes" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Registered Students</h2>
            {students.length === 0 ? (
              <p className="text-gray-500">No students registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((s) => (
                  <div key={s.estudiante_id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <h3 className="font-bold text-gray-800">{s.nombre}</h3>
                    <p className="text-gray-600">{s.email}</p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Applications: {s.aplicaciones}</p>
                      <p>Profile views: {s.vistas_perfil}</p>
                      <p>Status: {s.validado ? "Validated" : "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. EMPRESAS */}
        {activeTab === "empresas" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Registered Companies</h2>
            {companies.length === 0 ? (
              <p className="text-gray-500">No companies registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((c) => (
                  <div key={c.empresa_id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <h3 className="font-bold text-gray-800">{c.nombre_empresa}</h3>
                    <p className="text-gray-600">{c.email}</p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Offers: {c.total_ofertas}</p>
                      <p>Applications received: {c.total_postulaciones}</p>
                      <p>Status: {c.validado ? "Validated" : "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. OFERTAS */}
        {activeTab === "ofertas" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Job / Internship Offers</h2>
            {offers.length === 0 ? (
              <p className="text-gray-500">No offers available.</p>
            ) : (
              <div className="space-y-4">
                {offers.map((o) => (
                  <div key={o.oferta_id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <h3 className="font-bold text-gray-800">{o.titulo}</h3>
                    <p className="text-gray-600">{o.nombre_empresa}</p>
                    <p className="text-gray-500 text-sm mt-1">Status: {o.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. APLICACIONES */}
        {activeTab === "aplicaciones" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Applications Submitted</h2>
            {applications.length === 0 ? (
              <p className="text-gray-500">No applications submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((a) => (
                  <div key={a.aplicacion_id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <h3 className="font-bold text-gray-800">{a.estudiante_nombre}</h3>
                    <p className="text-gray-600">Applied to: {a.oferta}</p>
                    <p className="text-gray-600">Company: {a.empresa}</p>
                    <p className="text-gray-500 text-sm">Status: {a.estado}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. ACEPTADOS */}
        {activeTab === "aceptados" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Accepted Applications</h2>
            {accepted.length === 0 ? (
              <p className="text-gray-500">No accepted applications yet.</p>
            ) : (
              <div className="space-y-4">
                {accepted.map((a) => (
                  <div key={a.aplicacion_id} className="border rounded-lg p-4 shadow-sm bg-green-50">
                    <h3 className="font-bold text-gray-800">{a.estudiante_nombre}</h3>
                    <p className="text-gray-600">Accepted for: {a.oferta}</p>
                    <p className="text-gray-600">Company: {a.empresa}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
