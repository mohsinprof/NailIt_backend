// backend: src/contoller/makeFreshResume/freshResume.controller.js
const { createFreshResumePdf, removeFreshResumePdf } = require('../../services/makeFreshResume/freshResume.service');

async function generateFreshResumeController(req, res) {

    try {
        // FIX: If the frontend sent it as a JSON string inside 'resumeFormData', parse it.
        // Otherwise, fall back to req.body.
   
   

        let resumeFormData;
        if (req.body.resumeFormData) {
            resumeFormData = JSON.parse(req.body.resumeFormData);
        } else {
            resumeFormData = req.body;
        }

        const resumePdfBuffer = req.file ? req.file.buffer : null;

        // Validate that at least form data is provided
        if (!resumeFormData || Object.keys(resumeFormData).length === 0) {
            return res.status(400).json({
                message: 'Resume form data is required',
            });
        }
         

        // At least one of form data or PDF must be provided
        if (!resumePdfBuffer && !resumeFormData.personalInfo) {
            return res.status(400).json({
                message: 'Please provide either form data or upload a resume PDF',
            });
        }

        const { fileName, outputFilePath } = await createFreshResumePdf(
            resumeFormData,
            resumePdfBuffer
        );
      

        // Stream the file as download
        res.download(outputFilePath, fileName, async (error) => {
            await removeFreshResumePdf(outputFilePath);

            if (error) {
                console.error('Failed to send fresh resume PDF:', error);
            }
        });
    } catch (error) {
        console.error('Error generating fresh resume:', error);
        res.status(500).json({
            message: 'Failed to generate fresh resume',
            error: error.message,
        });
    }
}

module.exports = {
    generateFreshResumeController,
};