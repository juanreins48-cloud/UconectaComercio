import { useState, useEffect } from "react";

export default function MyCV() {
  const [cv, setCv] = useState(null);
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`https://uconecta-backend.onrender.com/api/cv/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCv(data.cv);
        }
      })
      .catch((err) => console.error("Error loading CV:", err));
  }, [studentId]);

  if (!cv) {
    return (
      <div className="p-6 text-center text-gray-600">
        <h2 className="text-xl font-bold">My CV</h2>
        <p className="mt-4">You have not uploaded a CV yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My CV</h2>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <p><strong>Name:</strong> {cv.full_name}</p>
        <p><strong>Email:</strong> {cv.email}</p>
        <p><strong>Phone:</strong> {cv.phone}</p>
        <p><strong>Summary:</strong> {cv.summary}</p>
        <p><strong>Experience:</strong> {cv.experience}</p>
        <p><strong>Education:</strong> {cv.education}</p>
        <p><strong>Skills:</strong> {cv.skills}</p>
      </div>
    </div>
  );
}
