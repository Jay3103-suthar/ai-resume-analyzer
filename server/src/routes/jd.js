const express = require("express");
const Groq = require("groq-sdk");
const Job = require("../models/Job");
const Resume = require("../models/Resume");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   POST /api/jd/match
===================================================== */
router.post("/match", async (req, res) => {
  try {
    const { userId, resumeId, jdText } = req.body;

    if (!resumeId || !jdText) {
      return res.status(400).json({
        error: "Missing resumeId or jdText",
      });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    /* ===== AI CALL ===== */
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
Match the resume with the job description and return STRICT JSON ONLY.

{
  "match_score": 0-100,
  "matched_skills": ["..."],
  "missing_skills": ["..."],
  "summary": "..."
}

Resume:
${resume.text}

Job Description:
${jdText}
          `,
        },
      ],
      temperature: 0.2,
    });

    const output = completion.choices[0].message.content;

    /* ===== SAFE JSON EXTRACTION ===== */
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI output:", output);
      return res.status(500).json({
        error: "AI did not return valid JSON",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parse error:", err);
      return res.status(500).json({
        error: "Failed to parse AI JSON",
      });
    }

    /* ===== NORMALIZATION ===== */
    let matchScore = parsed.match_score;

    if (typeof matchScore === "string") {
      matchScore = parseInt(matchScore.replace("%", ""), 10);
    }

    if (isNaN(matchScore)) {
      const matched = parsed.matched_skills?.length || 0;
      const missing = parsed.missing_skills?.length || 0;
      const total = matched + missing || 1;
      matchScore = Math.round((matched / total) * 100);
    }

    const result = {
      match_score: Math.min(100, Math.max(0, matchScore)),
      matched_skills: Array.isArray(parsed.matched_skills)
        ? parsed.matched_skills
        : [],
      missing_skills: Array.isArray(parsed.missing_skills)
        ? parsed.missing_skills
        : [],
      summary: parsed.summary || "No summary generated",
    };

    console.log("FINAL JD MATCH RESULT:", result);

    /* ===== SAVE TO DB (FOR HISTORY) ===== */
    await Job.create({
      user: userId,
      resume: resumeId,
      jdText,
      ...result,
    });

    /* ===== SEND CLEAN RESPONSE TO FRONTEND ===== */
    res.json(result);

  } catch (err) {
    console.error("JD match error:", err);
    res.status(500).json({
      error: "JD match failed",
    });
  }
});

module.exports = router;
