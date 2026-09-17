const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { generateTailoredResumePdf } = require('./resumePdf.generator');

async function createTailoredResumePdf(report) {
    const fileName = `tailored-resume-${report._id}.pdf`;
    const outputFilePath = path.join(os.tmpdir(), fileName);

    await generateTailoredResumePdf(report.resume, report.jobDescription, outputFilePath);

    return { fileName, outputFilePath };
}

async function removeTailoredResumePdf(outputFilePath) {
    try {
        await fs.unlink(outputFilePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to remove temporary tailored resume PDF:', error);
        }
    }
}

module.exports = {
    createTailoredResumePdf,
    removeTailoredResumePdf,
};