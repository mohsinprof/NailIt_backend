// backend: src/services/makeFreshResume/pdf.extractor.js
const pdfParse = require("pdf-parse");

/**
 * Extract text content from PDF buffer
 */
async function extractTextFromPdf(pdfBuffer) {
    try {
        // FIX: Use the exact PDFParse class syntax that works in your interview controller
        const resumeParser = new pdfParse.PDFParse({ data: pdfBuffer });
        const resumeContent = await resumeParser.getText();
        await resumeParser.destroy();
        
        return resumeContent.text || '';
    } catch (error) {
        console.error('Error reading PDF content:', error.message);
        throw new Error('Failed to parse PDF file');
    }
}

module.exports = {
    extractTextFromPdf,
};