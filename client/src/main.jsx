import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import UploadResume from "./pages/UploadResume";
import JobMatch from "./pages/JobMatch";
import ResumeAnalysis from "./pages/ResumeAnalysis";

import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadResume />} />

        {/* Resume Analysis */}
        <Route path="/resume/:id" element={<ResumeAnalysis />} />

        {/* JD Match MUST have resumeId */}
       <Route path="/match/:id" element={<JobMatch />} />

      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
