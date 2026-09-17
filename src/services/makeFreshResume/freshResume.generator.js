// backend: src/services/makeFreshResume/freshResume.generator.js
const { GoogleGenAI } = require("@google/genai");
const PDFDocument = require('pdfkit');
const fs = require('fs');

// FIX: Initialize the new GoogleGenAI client safely
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("WARNING: GEMINI_API_KEY is missing from .env file!");
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Generate a professional resume from form data and optional existing resume text
 */
async function generateFreshResumePdf(resumeData, outputFilePath) {
    const doc = new PDFDocument({ size: 'Letter', margin: 54 });
    const stream = fs.createWriteStream(outputFilePath);
    doc.pipe(stream);

    try {
        // Generate resume content from form data using AI
        const aiGeneratedContent = await generateResumeContent(resumeData);

        // Build PDF with AI-generated content
        await buildResumePdf(doc, aiGeneratedContent);

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    } catch (error) {
        doc.end();
        throw error;
    }
}

/**
 * Call Google Gemini AI to generate resume content from form data
 */
async function generateResumeContent(resumeData) {
       const schema = {
        type: "object",
        properties: {
            name: { type: "string", description: "Full name of the candidate" },
            contact: { type: "string", description: "Email, phone, LinkedIn, location" },
            summary: { type: "string", description: "3-4 sentence professional summary" },
            experience: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "Job Title at Company (Dates)" },
                        details: { type: "array", items: { type: "string" }, description: "3-4 bullet points of achievements" }
                    },
                    required: ["title", "details"]
                }
            },
            education: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        degree: { type: "string" },
                        details: { type: "string", description: "University name and graduation year" }
                    },
                    required: ["degree", "details"]
                }
            },
            skills: { type: "string", description: "Comma-separated list of 12-15 relevant skills" },
            // ADD THIS NEW CERTIFICATIONS FIELD:
            certifications: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Name of the certification" },
                        details: { type: "string", description: "Issuing organization and year" }
                    },
                    required: ["name", "details"]
                }
            }
        },
        required: ["name", "contact", "summary", "experience", "education", "skills", "certifications"]
    };

          const prompt = `You are an expert resume writer. Your goal is to create a truthful, professional resume based STRICTLY on the provided data.

ABSOLUTE RULES FOR DATA TRUTHFULNESS (CRITICAL):
- You are strictly forbidden from inventing, guessing, or hallucinating any information.
- The user may have provided structured form data (JSON) AND/OR an existing resume text.
- If a form field is empty, try to extract that information from the "existingResumeText".
- Combine both sources to create the most complete picture possible, but ONLY using facts provided by the user.

RULES FOR MISSING SECTIONS:
- If a section (like Experience, Education, Skills, or Certifications) is completely missing from both the form data AND the resume text, you MUST return an empty array [] for array fields, or an empty string "" for text fields.
- DO NOT write "Not Provided" or "Awaiting input". 
- If a section is empty, the PDF generator will automatically hide the heading and skip that section entirely.



User-provided structured data:
 ${JSON.stringify(resumeData, null, 2)}`;

    // FIX: Use the new SDK method
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
        }
    });

    return JSON.parse(response.text);
}

/**
 * Build the PDF document with resume content
 */
/**
 * Build the PDF document with resume content
 */
async function buildResumePdf(doc, data) {
    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000');
    doc.text(data.name || 'Professional Resume', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#333333');
    doc.text(data.contact || '', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#000000').lineWidth(1.25).moveTo(54, doc.y).lineTo(558, doc.y).stroke();
    doc.moveDown(0.65);

    // Summary (Only render if it's not empty)
    if (data.summary && data.summary.trim() !== "") {
        sectionTitle(doc, 'PROFESSIONAL SUMMARY');
        doc.fontSize(9.6).font('Helvetica').fillColor('#000000').text(data.summary, { lineGap: 1.5 });
        doc.moveDown(0.65);
    }

    // Skills (Only render if it's not empty)
    if (data.skills && data.skills.trim() !== "") {
        sectionTitle(doc, 'SKILLS');
        doc.fontSize(9.6).font('Helvetica').fillColor('#000000').text(data.skills, { lineGap: 1.5 });
        doc.moveDown(0.65);
    }

    // Experience (Only render if array exists and has items)
    if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        // Double check that the first item actually has content
        if (data.experience[0].title && data.experience[0].title.trim() !== "") {
            sectionTitle(doc, 'PROFESSIONAL EXPERIENCE');
            data.experience.forEach((job) => {
                doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#000000').text(job.title);
                doc.moveDown(0.18);
                if (job.details && job.details.length > 0) {
                    job.details.forEach((bullet) => {
                        doc.fontSize(9.6).font('Helvetica').fillColor('#000000').text(`• ${bullet}`, { indent: 14, lineGap: 1.5 });
                    });
                }
                doc.moveDown(0.4);
            });
        }
    }

    // Education (Only render if array exists and has items)
    if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        if (data.education[0].degree && data.education[0].degree.trim() !== "") {
            sectionTitle(doc, 'EDUCATION');
            data.education.forEach((edu) => {
                doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#000000').text(edu.degree);
                doc.fontSize(9.6).font('Helvetica').fillColor('#333333').text(edu.details);
                doc.moveDown(0.3);
            });
        }
    }

    // Certifications (Only render if array exists and has items)
    if (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
        if (data.certifications[0].name && data.certifications[0].name.trim() !== "") {
            sectionTitle(doc, 'CERTIFICATIONS');
            data.certifications.forEach((cert) => {
                doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#000000').text(cert.name);
                doc.fontSize(9.6).font('Helvetica').fillColor('#333333').text(cert.details);
                doc.moveDown(0.3);
            });
        }
    }
}
function sectionTitle(doc, title) {
    doc.fontSize(12.5).font('Helvetica-Bold').fillColor('#000000').text(title.toUpperCase());
    doc.strokeColor('#000000').lineWidth(1.1).moveTo(54, doc.y + 2).lineTo(558, doc.y + 2).stroke();
    doc.moveDown(0.4);
}

module.exports = { generateFreshResumePdf };