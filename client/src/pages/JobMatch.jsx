import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

/* ===============================
   MATCH SCORE BAR
================================ */
function MatchBar({ score }) {
  const safeScore = Number.isFinite(score) ? score : 0;

  const color =
    safeScore >= 80
      ? "bg-green-500"
      : safeScore >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-semibold">Match Score</span>
        <span className="font-bold">{safeScore}%</span>
      </div>

      <div className="w-full bg-gray-200 h-4 rounded-full">
        <div
          className={`${color} h-4 rounded-full transition-all duration-700`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

export default function JobMatch() {
  const navigate = useNavigate();
  const { id } = useParams();       // ✅ FROM URL
  const resumeId = id;              // ✅ ALWAYS PRESENT

  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function match() {
    if (!jd.trim()) {
      alert("Please paste the Job Description");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/jd/match", {
        userId: "6745bc62c20a12ff179c8e55",
        resumeId,
        jdText: jd,
      });

      console.log("JD MATCH RESPONSE:", response.data);

      setResult({
        match_score: Number(response.data.match_score),
        matched_skills: response.data.matched_skills || [],
        missing_skills: response.data.missing_skills || [],
        summary: response.data.summary || "",
      });
    } catch (err) {
      console.error(err);
      alert("JD match failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-xl p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">
            JD Match Analysis
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        {/* JD INPUT */}
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          className="w-full h-40 p-4 border rounded-lg mb-6"
          placeholder="Paste the Job Description here..."
        />

        <button
          onClick={match}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white
            ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}
          `}
        >
          {loading ? "Analyzing..." : "Match Resume"}
        </button>

        {result && (
          <div className="mt-8 bg-gray-100 p-6 rounded-lg">

            <MatchBar score={result.match_score} />

            <p className="text-gray-700 mb-4">
              {result.summary}
            </p>

            <h3 className="font-semibold text-green-600 mb-2">
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.matched_skills.map((s, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
            </div>

            <h3 className="font-semibold text-red-600 mb-2">
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((s, i) => (
                <span
                  key={i}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
