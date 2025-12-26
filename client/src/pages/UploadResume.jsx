import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function upload() {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("userId", "6745bc62c20a12ff179c8e55");

    try {
      const res = await API.post("/resume/upload", fd);
      setResult(res.data);

      // ✅ auto redirect after success
      setTimeout(() => {
        navigate(`/resume/${res.data._id}`);
      }, 1500);

    } catch (e) {
      alert("Upload failed. Check backend logs.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-6">
          AI Resume Analyzer
        </h1>

        <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-gray-700"
          />

          <p className="text-gray-500 mt-3">
            Upload PDF or DOCX resume
          </p>

          {file && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={upload}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-lg text-white font-semibold shadow-md
            ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}
          `}
        >
          {loading ? "Analyzing with AI..." : "Analyze Resume"}
        </button>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-700 font-semibold text-center">
              ✅ Resume analyzed successfully!
            </p>
            <p className="text-sm text-center text-gray-600 mt-1">
              Redirecting to analysis page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
