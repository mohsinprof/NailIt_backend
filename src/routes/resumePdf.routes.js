const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const resumePdfController = require('../contoller/resumePdf.controller');

const resumePdfRouter = express.Router();

/**
 * Resume PDF feature block.
 * Remove this router, the app mount, and the frontend button/API wrapper
 * if you want to delete the feature later without affecting report generation.
 */
resumePdfRouter.get(
    '/:interviewId/resume-pdf',
    authMiddleware.authuser,
    resumePdfController.downloadTailoredResumePdfController
);

module.exports = resumePdfRouter;