require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs'); // Added fs for the PDF generation

// FIX 1: Initialize with 'apiKey'
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// FIX 2: Use a raw JSON Schema instead of Zod for perfect nested object support
const generateInterviewReportSchema = {
  type: "object",
  properties: {
    scoreReasoning: {
      type: "String",
      description: "Step-by-step reasoning explaining exactly why the candidate is receiving the matchScore. Compare their years of experience and specific skills directly to the job description."
    },
    matchScore: {
      type: "number",
      description: "The match score between the candidate and the job description.(if user input feild is gebrish then give them 0 score)"
    },
    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The technical question can be asked in the interview" },
          intention: { type: "string", description: "The intention behind the technical question" },
          answer: { type: "string", description: "How to answer this technical question, what points to cover, what approach to take etc" }
        },
        required: ["question", "intention", "answer"]
      },
      description: "The technical questions that can be asked in the interview and how to answer them"
    },
    behavioralQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The behavioral question can be asked in the interview" },
          intention: { type: "string", description: "The intention behind the behavioral question" },
          answer: { type: "string", description: "How to answer this behavioral question, what points to cover, what approach to take etc" }
        },
        required: ["question", "intention", "answer"]
      },
      description: "The behavioral questions that can be asked in the interview and how to answer them"
    },
    skillsGaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string", description: "The skill that the candidate is lacking" },
          severity: { type: "string", enum: ["low", "medium", "high"], description: "The severity of the skill gap" }
        },
        required: ["skill", "severity"]
      },
      description: "The skills that the candidate is lacking and the severity of the skill gap"
    },
    preparationPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number", description: "The day of the preparation plan" },
          focus: { type: "string", description: "The focus of the preparation plan for that day" },
          tasks: { type: "array", items: { type: "string" }, description: "The tasks to be done on that day" }
        },
        required: ["day", "focus", "tasks"]
      },
      description: "The preparation plan for the candidate to improve their skills and prepare for the interview"
    }
    , title: {
    type: "String",
    description: "The title of the interview report on which candidate is being evaluated. and add name of candidate to it. it will default to 'interview report for <candidate name>' if not provided"
  }
     


    
  },
  required: ["title", "scoreReasoning", "matchScore", "technicalQuestions", "behavioralQuestions", "skillsGaps", "preparationPlan"]
}

async function generateInterviewReport(arg1, arg2, arg3) {
    
    // 1. Declare the variables using your original names
    let resume, selfDescription, jobDescription;

    // 2. Safely extract the data whether it's an object OR separate arguments
    if (typeof arg1 === 'object' && arg1 !== null) {
        resume = arg1.reume || arg1.resume; // Handles the typo!
        selfDescription = arg1.selfDescription;
        jobDescription = arg1.jobDescription;
    } else {
        resume = arg1;
        selfDescription = arg2;
        jobDescription = arg3;
    }

    console.log("--- ULTIMATE SAFECHECK ---");
    console.log("Resume length:", resume ? resume.length : "MISSING", "characters");
    console.log("SelfDesc length:", selfDescription ? selfDescription.length : "MISSING", "characters");
    console.log("JobDesc length:", jobDescription ? jobDescription.length : "MISSING", "characters");
    console.log("--------------------------");

    const prompt = `
You are an Expert AI Technical Recruiter. You must evaluate a candidate's fit for the specific job description provided below. 

<candidate_resume>
 ${resume}
</candidate_resume>

<candidate_self_description>
 ${selfDescription}
</candidate_self_description>

<job_description_to_apply_for>
 ${jobDescription}
</job_description_to_apply_for>

STRICT EVALUATION RULES:
1. Score Reasoning FIRST: You must deeply analyze the candidate's skills versus the job requirements in the 'scoreReasoning' field. 
2. Match Score (0-100): 
   - Overqualification is a POSITIVE indicator of technical ability. If a candidate has 10 years of experience for a job requiring 1 year, they have the required skills. Their match score must be HIGH (85-100).
   - Only assign a score below 50 if the candidate is completely missing the core technologies or industry background required.
3. Questions: Generate industry-specific technical and behavioral questions based strictly on the <job_description_to_apply_for>.
4. Preparation Plan:
   - Match Score < 70 (Underqualified): Provide a 30/60/90-day learning roadmap to close skill gaps.
   - Match Score >= 70 (Good Fit/Overqualified): Do not include a preparation plan and write a truthfully recommendation.
5. Skill Gaps: Identify realistic missing skills based ONLY on the <job_description_to_apply_for>.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // FIX 3: Pass the raw JSON schema directly
                responseSchema: generateInterviewReportSchema 
            }
        });

        const result = JSON.parse(response.text);
        console.log(JSON.stringify(result, null, 2));
        return result;

    } catch (error) {
        console.error("Error generating interview report:", error);
        throw error;
    }
}


module.exports = generateInterviewReport;