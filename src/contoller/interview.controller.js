const pdfParse=require("pdf-parse")
const generateInterviewReport = require('../services/ai.service')
const interviewReportModel=require("../models/interviewReport.model")
const { response } = require('../app')



async function generateInterviewReportController(req, res) { 
    const resumefile= req.file

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body
    console.log("Resume Content:", resumeContent.text);
    console.log("Self Description:", selfDescription);
    console.log("Job Description:", jobDescription);
    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })
    const interViewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi

    })

    res.status(200).json({
        message: "Interview report generated successfully",
        data: interViewReport
    })
    
    


}






module.exports={generateInterviewReportController}