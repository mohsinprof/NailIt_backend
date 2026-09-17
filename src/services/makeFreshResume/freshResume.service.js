const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { generateFreshResumePdf } = require('./freshResume.generator');
const { extractTextFromPdf } = require('./pdf.extractor');

/**
 * Create a fresh resume PDF from form data and optional existing resume PDF
 */
async function createFreshResumePdf(resumeFormData, existingResumePdfBuffer = null) {
    const fileName = `fresh-resume-${Date.now()}.pdf`;
    const outputFilePath = path.join(os.tmpdir(), fileName);
   

     const downloadName = `${(resumeFormData.personalInfo?.fullName || 'Resume')
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')}_Resume.pdf`;

    // If user uploaded existing resume, extract text and merge with form data
    let mergedResumeData = { ...resumeFormData };

    if (existingResumePdfBuffer) {
        try {
            const extractedText = await extractTextFromPdf(existingResumePdfBuffer);
            // Pass extracted text to generator to incorporate into new resume
            mergedResumeData.existingResumeText = extractedText;
        } catch (error) {
            console.warn('Could not extract text from uploaded PDF:', error.message);
            // Continue with form data only
        }
    }

    await generateFreshResumePdf(mergedResumeData, outputFilePath);

    return { fileName: downloadName, outputFilePath };
}

/**
 * Remove temporary resume PDF file
 */
async function removeFreshResumePdf(outputFilePath) {
    try {
        await fs.unlink(outputFilePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to remove temporary fresh resume PDF:', error);
        }
    }
}

module.exports = {
    createFreshResumePdf,
    removeFreshResumePdf,
};
