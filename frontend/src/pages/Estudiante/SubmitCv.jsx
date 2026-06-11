import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SubmitCv({ onClose }) {
  const navigate = useNavigate();

  const [cv, setCV] = useState({
    fullName: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  });

  const handleChange = (e) => {
    setCV({ ...cv, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      alert("No studentId found. Please log in again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,

          // Corrección: coincide con el campo de la DB
          full_name: cv.fullName,

          email: cv.email,
          phone: cv.phone,
          summary: cv.summary,
          experience: cv.experience,
          education: cv.education,
          skills: cv.skills
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("CV saved successfully!");
      onClose();
    } catch (err) {
      console.error("Error saving CV:", err);
      alert("Server error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-4 sm:p-5">

        <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
          Manage CV
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold">Full Name</label>
              <input
                name="fullName"
                value={cv.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={cv.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Phone</label>
            <input
              name="phone"
              value={cv.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Professional Summary</label>
            <textarea
              name="summary"
              value={cv.summary}
              onChange={handleChange}
              placeholder="Write a short summary"
              className="w-full p-2 border rounded-lg h-16"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Work Experience</label>
            <textarea
              name="experience"
              value={cv.experience}
              onChange={handleChange}
              placeholder="List your work experience"
              className="w-full p-2 border rounded-lg h-16"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Education</label>
            <textarea
              name="education"
              value={cv.education}
              onChange={handleChange}
              placeholder="List your education"
              className="w-full p-2 border rounded-lg h-16"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Skills</label>
            <textarea
              name="skills"
              value={cv.skills}
              onChange={handleChange}
              placeholder="List your skills"
              className="w-full p-2 border rounded-lg h-16"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/estudiante")}
              className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 text-white rounded-md hover:bg-teal-800"
            >
              Save CV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
