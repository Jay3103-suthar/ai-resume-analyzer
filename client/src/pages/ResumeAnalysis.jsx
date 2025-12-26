import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

/* ===============================
   ATS PROGRESS BAR COMPONENT
================================ */
function ATSBar({ score }) {
  const color =
    score >= 80 ? "bg-green-500" :
    score >= 60 ? "bg-yellow-500" :
    "bg-red-500";

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="font-semibold">ATS Score</span>
        <span className="font-bold">{score}/100</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${color} h-4 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ResumeAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get(`/resume/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load resume"));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const r = data.aiReport || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-xl p-8">

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">
            Resume Analysis
          </h1>

          {/* 🔙 BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            ← Back
          </button>
        </div>

        {/* ===== ATS SCORE ===== */}
        <ATSBar score={r.ats_score ?? 0} />

        {/* ===== SUMMARY ===== */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="text-gray-700">
            {r.experience_summary || "No summary available"}
          </p>
        </section>

        {/* ===== SKILLS ===== */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          {Array.isArray(r.skills) && r.skills.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {r.skills.map((s, i) => (
                <li
                  key={i}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No skills detected</p>
          )}
        </section>

        {/* ===== STRENGTHS ===== */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Strengths</h2>
          {Array.isArray(r.strengths) && r.strengths.length > 0 ? (
            <ul className="list-disc ml-6">
              {r.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No strengths detected</p>
          )}
        </section>

        {/* ===== WEAKNESSES ===== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Weaknesses</h2>
          {Array.isArray(r.weaknesses) && r.weaknesses.length > 0 ? (
            <ul className="list-disc ml-6">
              {r.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No weaknesses detected</p>
          )}
        </section>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 📄 DOWNLOAD PDF */}
          <a
            href={`http://localhost:5001/api/pdf/resume/${id}`}
            className="flex-1 text-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Download PDF Report
          </a>

          {/* 🤖 JD MATCH */}
            <button
              onClick={() => navigate(`/match/${id}`)}
              className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black"
            >
              Match with Job Description
            </button>


        </div>

      </div>
    </div>
  );
}
