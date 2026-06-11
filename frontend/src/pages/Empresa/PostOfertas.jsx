import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostOffer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    modalidad: "presencial",
    remuneracion: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tomar empresaId desde localStorage
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) {
        alert("No se encontró el ID de la empresa. Por favor inicia sesión de nuevo.");
        setLoading(false);
        return;
      }

      // Enviar datos al backend
      const res = await fetch("https://uconecta-backend.onrender.com/api/ofertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaId,
          titulo: formData.title,
          descripcion: formData.description,
          requisitos: formData.requirements,
          ubicacion: formData.location,
          modalidad: formData.modalidad,
          remuneracion: formData.remuneracion,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Error al publicar la oferta");
        setLoading(false);
        return;
      }

      alert("Oferta publicada correctamente!");
      navigate("/company"); // Volver al dashboard
    } catch (err) {
      console.error("Error posting offer:", err);
      alert("Error del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-3xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          + Post Internship Offer
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-2 md:col-span-1">
            <label className="text-gray-700 text-sm font-medium">Job Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Software Development Intern"
              value={formData.title}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-teal-300"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-gray-700 text-sm font-medium">Description</label>
            <textarea
              name="description"
              placeholder="Describe el rol y responsabilidades"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-teal-300"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-gray-700 text-sm font-medium">Requirements</label>
            <textarea
              name="requirements"
              placeholder="List of required skills and qualifications"
              rows="2"
              value={formData.requirements}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>

          <div>
            <label className="text-gray-700 text-sm font-medium">Location</label>
            <input
              type="text"
              name="location"
              placeholder="City, State or Remote"
              value={formData.location}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>

          <div>
            <label className="text-gray-700 text-sm font-medium">Work Mode</label>
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-teal-300"
            >
              <option value="presencial">In person</option>
              <option value="remoto">Remote</option>
              <option value="hibrido">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="text-gray-700 text-sm font-medium">Remuneration</label>
            <input
              type="text"
              name="Remuneration"
              placeholder="e.g. $1000/month"
              value={formData.remuneracion}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              onClick={() => navigate("/company")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Publicando..." : "+ Publicar Oferta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
