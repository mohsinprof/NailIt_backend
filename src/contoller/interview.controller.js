const pdfParse = require("pdf-parse")
const generateInterviewReport = require('../services/ai.service')
const interviewReportModel = require("../models/interviewReport.model")
// === REPORT LIMIT FEATURE - START (delete these 2 blocks to remove the feature) ===
const { enforceReportLimit } = require('../helpers/enforceReportLimit');
// === REPORT LIMIT FEATURE - END ===



async function generateInterviewReportController(req, res) { 
     const { selfDescription, jobDescription } = req.body;
    const resumefile = req.file;

    if (!resumefile && !selfDescription) {
        // Return a clear client error when the resume upload is missing instead of crashing.
        return res.status(400).json({ message: 'Either a resume PDF or a self description is required' });
    }

  
    if ( !jobDescription) {
        // Keep the request contract explicit so the client can fix missing form fields.
        return res.status(400).json({ message: 'Self description and job description are required' });
    }

    try {
        let resumeText ="";
        const resumeParser = new pdfParse.PDFParse({ data: resumefile.buffer });
        const resumeContent = await resumeParser.getText();
        await resumeParser.destroy();

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text ,
            selfDescription:selfDescription || "",
            jobDescription
        });
        const interViewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text ,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interviewReportByAi

        });
                // === REPORT LIMIT FEATURE - START ===
        // Fire-and-forget: delete oldest reports beyond the 6-per-user cap.
        // Not awaited so the user's response is never delayed by cleanup.
        enforceReportLimit(req.user.id);
        // === REPORT LIMIT FEATURE - END ===


        res.status(201).json({
            message: "Interview report generated successfully",
            data: interViewReport
        });
    } catch (error) {
        console.error("Error generating interview report on the server:", error);
        res.status(500).json({ message: 'Failed to generate interview report' });
    }
}


/**
 * @description controller to get the interview report by its ID.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params;
    try {
        const interviewReport = await interviewReportModel.findById(interviewId);
        if (!interviewReport) {
            return res.status(404).json({ message: 'Interview report not found' });
        }
        res.status(200).json({
            message: "Interview report fetched successfully",
            data: interviewReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**
 * @description controller to get all interview reports for the authenticated user.
 */
async function getAllInterviewReportByIdController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription");

        res.status(200).json({
            message: "All interview reports fetched successfully",
            data: interviewReports
        });
    } catch (error) {
        console.error("Error fetching all interview reports:", error);
        res.status(500).json({ message: 'Server error' });
    }
}
// === DELETE REPORT - START (delete these blocks to remove the feature) ===
async function deleteInterviewReportController(req, res) {
    try {
        const deleted = await interviewReportModel.findOneAndDelete({
            _id: req.params.interviewId,
            user: req.user.id, // ownership check: users can only delete their own reports
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Interview report not found' });
        }
        res.status(200).json({ message: 'Interview report deleted successfully' });
    } catch (error) {
        console.error("Error deleting interview report:", error);
        res.status(500).json({ message: 'Failed to delete interview report' });
    }
}
// === DELETE REPORT - END ===










module.exports={generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportByIdController , deleteInterviewReportController}