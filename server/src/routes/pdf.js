const express = require("express");
const PDFDocument = require("pdfkit");
const Resume = require("../models/Resume");

const router = express.Router();

router.get("/resume/:id", async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) return res.status(404).send("Not found");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=resume-report.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("AI Resume Analysis Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(`ATS Score: ${resume.aiReport.ats_score}`);
  doc.moveDown();

  doc.text("Skills:");
  resume.aiReport.skills.forEach(s => doc.text(`• ${s}`));
  doc.moveDown();

  doc.text("Strengths:");
  resume.aiReport.strengths.forEach(s => doc.text(`• ${s}`));
  doc.moveDown();

  doc.text("Weaknesses:");
  resume.aiReport.weaknesses.forEach(w => doc.text(`• ${w}`));

  doc.end();
});

module.exports = router;
