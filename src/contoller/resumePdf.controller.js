const interviewReportModel = require('../models/interviewReport.model');
const {
    createTailoredResumePdf,
    removeTailoredResumePdf,
} = require('../services/resumePdf.service');

async function downloadTailoredResumePdfController(req, res) {
    const { interviewId } = req.params;

    try {
        const report = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id,
        });

        if (!report) {
            return res.status(404).json({ message: 'Interview report not found' });
        }

        if (!report.resume || !report.jobDescription) {
            return res.status(400).json({ message: 'Interview report is missing resume or job description data' });
        }

        const { fileName, outputFilePath } = await createTailoredResumePdf(report);

        res.download(outputFilePath, fileName, async (error) => {
            await removeTailoredResumePdf(outputFilePath);

            if (error) {
                console.error('Failed to send tailored resume PDF:', error);
            }
        });
    } catch (error) {
        console.error('Error generating tailored resume PDF:', error);
        res.status(500).json({ message: 'Failed to generate tailored resume PDF' });
    }
}

module.exports = {
    downloadTailoredResumePdfController,
};