import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function ValidarEmpresas() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  // 🔵 Cargar empresas desde API o usar datos de prueba
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("https://uconecta-backend.onrender.com/api/universidad/empresas-pendientes");
        const data = await res.json();


        if (!data.success) throw new Error("API error");


        setCompanies(data.empresas);
      } catch (err) {


        
      } finally {
        setLoading(false);
      }
    };


    fetchCompanies();
  }, []);


  // 🔍 Búsqueda en tiempo real
  const filteredCompanies = companies.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.rubro.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );


  // 🔵 Validar
  const validarEmpresa = async (id) => {
    try {
      const res = await fetch("https://uconecta-backend.onrender.com/api/universidad/validar-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: id }),
      });


      const data = await res.json();


      if (!data.success) alert("No se pudo validar desde API.");


      alert("✔ Empresa validada correctamente");


      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Error validando. Eliminando localmente…");
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  };


  // 🔵 Reportar
  const reportarEmpresa = async (id) => {
    try {
      const res = await fetch("https://uconecta-backend.onrender.com/api/universidad/reportar-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: id }),
      });


      const data = await res.json();


      if (!data.success) alert("No se pudo reportar desde API.");


      alert("⚠ Empresa reportada");


      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Error reportando. Eliminando localmente…");
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  };


  if (loading)
    return <div className="p-10 text-center text-gray-600">Loading companies...</div>;


  return (
    <div className="min-h-screen bg-gray-50 p-6">


      {/* Encabezado */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Validate Companies</h1>


        <button
          className="px-4 py-2 bg-purple-400 text-black rounded-lg hover:bg-purple-800"
          onClick={() => navigate("/university")}
        >
          Back to Dashboard
        </button>
      </header>


      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-purple-300"
          placeholder="Search companies by name, industry or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>


      {/* Lista de empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => (
          <div key={company.id}
            className="bg-white shadow rounded-xl p-4 border border-gray-100 hover:shadow-md transition">


            <h3 className="font-bold text-gray-800 text-lg mb-1">
              {company.nombre}
            </h3>


            <p className="text-sm text-gray-600 mb-1">{company.rubro}</p>
            <p className="text-sm text-gray-500 mb-3">{company.email}</p>


            <div className="flex gap-2">
              <button
                onClick={() => validarEmpresa(company.id)}
                className="w-1/2 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-700 transition">
                Validate
              </button>


              <button
                onClick={() => reportarEmpresa(company.id)}
                className="w-1/2 py-2 bg-red-400 text-black rounded-lg hover:bg-red-700 transition">
                Report
              </button>
            </div>


          </div>
        ))}
      </div>


      {/* Cancel */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => navigate("/university")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>


    </div>
  );
}
