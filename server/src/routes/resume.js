const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Groq = require("groq-sdk");
const Resume = require("../models/Resume");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   POST /api/resume/upload
   Upload resume + AI analysis
===================================================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text = "";

    // ---- Extract text from resume ----
    if (file.mimetype.includes("pdf")) {
      const data = await pdfParse(fs.readFileSync(file.path));
      text = data.text;
    } else {
      const data = await mammoth.extractRawText({ path: file.path });
      text = data.value;
    }

    // ---- AI CALL (UPDATED PROMPT) ----
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON generator. Return ONLY valid JSON. No text, no markdown.",
        },
        {
          role: "user",
          content: `
Analyze the resume and return STRICT JSON ONLY.

Calculate a realistic ATS score (0–100) based on:
- skills relevance
- experience
- projects
- clarity
- formatting

Return JSON ONLY in this format:

{
  "skills": ["..."],
  "experience_summary": "...",
  "ats_score": number,
  "strengths": ["..."],
  "weaknesses": ["..."]
}

Resume Text:
${text}
          `,
        },
      ],
      temperature: 0.2,
    });

    const output = completion.choices[0].message.content;

    // ---- SAFE JSON EXTRACTION ----
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI returned invalid JSON:", output);
      return res.status(500).json({
        error: "AI did not return valid JSON",
        raw: output,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parse error:", err);
      return res.status(500).json({
        error: "Failed to parse AI JSON",
        raw: output,
      });
    }

    // ---- ATS SCORE SAFETY (IMPORTANT) ----
    if (typeof parsed.ats_score !== "number") {
      parsed.ats_score = Math.min(
        100,
        (parsed.skills?.length || 0) * 6 +
          (parsed.strengths?.length || 0) * 10
      );
    }

    // ---- SAVE TO DATABASE ----
    const saved = await Resume.create({
      user: req.body.userId,
      fileUrl: `/uploads/${file.filename}`,
      text,
      aiReport: parsed,
    });

    res.json(saved);
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({
      error: "Resume analysis failed",
    });
  }
});

/* =====================================================
   GET /api/resume/:id
   Fetch resume by ID
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json(resume);
  } catch (err) {
    console.error("Fetch resume error:", err);
    res.status(500).json({ error: "Invalid resume ID" });
  }
});

module.exports = router;
