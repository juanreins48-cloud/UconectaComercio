// src/pages/estudiante/ViewCV.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ViewCV() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [cv, setCV] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        if (!studentId) {
          alert("No studentId provided.");
          setLoading(false);
          return;
        }

        const res = await fetch(`https://uconecta-backend.onrender.com/api/cv/view/${studentId}`);
        const data = await res.json();

        if (!data.success) {
          alert(data.message);
          setLoading(false);
          return;
        }

        setCV(data.cv);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error fetching CV");
        setLoading(false);
      }
    };

    fetchCV();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading CV...</p>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>No CV found.</p>
        <button
          className="mt-4 px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center">My CV</h1>

        <div>
          <h2 className="font-semibold text-gray-700">Full Name</h2>
          <p>{cv.full_name}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Email</h2>
          <p>{cv.email}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Phone</h2>
          <p>{cv.phone}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Professional Summary</h2>
          <p>{cv.summary}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Work Experience</h2>
          <p>{cv.experience}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Education</h2>
          <p>{cv.education}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Skills</h2>
          <p>{cv.skills}</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
