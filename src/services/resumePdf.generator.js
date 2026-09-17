require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

const generateAtsResumeSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: "Candidate's full name" },
    contact: { type: 'string', description: 'Email and phone number combined' },
    summary: { type: 'string', description: 'A 4-6 sentence professional summary tailored heavily to the target job description and written like a polished resume summary.' },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Job title plus company/context in a resume style, for example "Senior Analyst, Company Name | City, State | 2021-2024"' },
          details: {
            type: 'string',
            description: '3-5 bullet points of achievements, each on a new line starting with a hyphen. Use exact keywords, strong action verbs, and concrete outcomes from the target job description.'
          }
        },
        required: ['title', 'details']
      }
    },
    skills: { type: 'string', description: 'A comma-separated list of 12-18 relevant skills matching the job description requirements, ordered by relevance.' }
  },
  required: ['name', 'contact', 'summary', 'experience', 'skills']
};

function parseSkills(skillsText) {
  return String(skillsText ?? '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function splitBullets(details) {
  return String(details ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n+/g)
    .map((part) => part.replace(/^[-–—\s]+/, '').trim())
    .filter(Boolean)
    .flatMap((part) => {
      if (part.length < 90) return [part];
      return part.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
    });
}

function formatContactLine(contact) {
  return String(contact ?? '').replace(/\s+/g, ' ').trim();
}

function ensureSpace(doc, requiredHeight) {
  const bottomLimit = doc.page.height - doc.page.margins.bottom;
  if (doc.y + requiredHeight > bottomLimit) {
    doc.addPage();
  }
}

function sectionTitle(doc, title) {
  ensureSpace(doc, 38);
  doc.moveDown(0.15);
  doc
    .font('Helvetica-Bold')
    .fontSize(12.5)
    .fillColor('#000000')
    .text(String(title).toUpperCase(), {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: 'left',
    });

  doc
    .moveTo(doc.page.margins.left, doc.y + 3)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 3)
    .lineWidth(1.1)
    .strokeColor('#000000')
    .stroke();
  doc.moveDown(0.65);
}

function renderHeader(doc, resumeData) {
  doc
    .font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#000000')
    .text(resumeData.name || 'Tailored Resume', {
      align: 'center',
    });

  doc.moveDown(0.1);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#111111')
    .text(formatContactLine(resumeData.contact), {
      align: 'center',
    });

  doc.moveDown(0.4);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .lineWidth(1.25)
    .strokeColor('#000000')
    .stroke();
  doc.moveDown(0.7);
}

function renderParagraph(doc, text, options = {}) {
  const {
    font = 'Helvetica',
    size = 10,
    color = '#111111',
    indent = 0,
    lineGap = 2,
    align = 'left',
  } = options;

  const safeText = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!safeText) return;

  ensureSpace(doc, 40);
  doc
    .font(font)
    .fontSize(size)
    .fillColor(color)
    .text(safeText, {
      indent,
      lineGap,
      align,
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    });
}

function renderBullets(doc, bullets) {
  bullets.forEach((bullet) => {
    const text = String(bullet ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    ensureSpace(doc, 18);
    doc
      .font('Helvetica')
      .fontSize(9.6)
      .fillColor('#111111')
      .text(`• ${text}`, {
        indent: 14,
        lineGap: 1.5,
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 4,
      });
  });
}

function renderExperience(doc, experience) {
  experience.forEach((job) => {
    const bullets = splitBullets(job.details);
    ensureSpace(doc, 44 + (bullets.length * 11));

    doc
      .font('Helvetica-Bold')
      .fontSize(11.5)
      .fillColor('#000000')
      .text(job.title || 'Relevant Experience', {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      });

    doc.moveDown(0.18);
    renderBullets(doc, bullets.length > 0 ? bullets : [job.details]);
    doc.moveDown(0.4);
  });
}

function buildResumePdf(doc, resumeData) {
  renderHeader(doc, resumeData);

  sectionTitle(doc, 'Professional Summary');
  renderParagraph(doc, resumeData.summary, {
    font: 'Helvetica',
    size: 9.7,
    lineGap: 2.1,
  });

  sectionTitle(doc, 'Core Skills');
  renderParagraph(doc, parseSkills(resumeData.skills).join(', '), {
    font: 'Helvetica',
    size: 9.5,
    lineGap: 2,
  });

  sectionTitle(doc, 'Experience');
  renderExperience(doc, Array.isArray(resumeData.experience) ? resumeData.experience : []);
}

async function generateTailoredResumePdf(resumeText, jobDescription, outputFilePath) {
  const prompt = `
You are an expert ATS-resume writer.
Rewrite the candidate's resume so it reads like a polished, real professional resume tailored to the target job.
Treat this as a full-capacity resume optimization pass: be thorough, dense, specific, and strictly professional.

Rules:
- Produce a substantial result, not a short summary.
- summary: write 4-6 sentences, roughly 90-140 words, with concrete skills, achievements, and role alignment.
- experience: provide 3-5 entries when the resume supports them; each entry must have 3-5 detailed bullet points separated by new lines and each bullet must be meaningful and specific.
- Each experience title should look like a conventional resume line with role, company, location, and dates when available.
- The bullet points should sound credible, specific, and keyword-rich, using technologies and responsibilities from the job description.
- skills: provide 12-18 comma-separated skills with no duplicates, ordered from most relevant to least relevant.
- Keep the resume visually clean and conventional like a professional ATS resume.
- Make the output look like a strong candidate match for the job if the source material supports it.
- Do not invent employers, degrees, certifications, or years of experience that are not supported by the input.
- Do not exaggerate beyond what the source material supports.
- If the candidate is a strong match, write the resume like a strong match. If they are weaker, still optimize aggressively using only truthful details.
- Use bold black section headers and compact bullet lists like a polished professional resume.
- Favor short, strong bullet points over long paragraphs.
- Make the resume look closer to a traditional corporate resume than a modern web-generated document.
- Keep the output professional, ATS-friendly, and natural.

<candidate_original_resume>
${resumeText}
</candidate_original_resume>

<target_job_description>
${jobDescription}
</target_job_description>
`;

  try {
    console.log('AI is generating ATS-optimized resume content...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: generateAtsResumeSchema,
      },
    });

    const resumeData = JSON.parse(response.text);

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 54,
        bufferPages: true,
        autoFirstPage: true,
      });

      const stream = fs.createWriteStream(outputFilePath);
      doc.pipe(stream);

      doc.info.Title = resumeData.name || 'Tailored Resume';
      doc.info.Author = 'GenAI';

      doc.on('pageAdded', () => {
        doc.font('Helvetica');
        doc.fillColor('#222222');
      });

      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.on('error', reject);

      buildResumePdf(doc, resumeData);
      doc.end();
    });

    console.log(`SUCCESS! ATS-friendly PDF saved to: ${outputFilePath}`);
    return outputFilePath;
  } catch (error) {
    console.error('Error generating tailored resume PDF:', error);
    throw error;
  }
}

module.exports = {
  generateTailoredResumePdf,
};
