const express = require('express');
const authMiddleware = require("../middleware/auth.middleware")
const interviewController = require('../contoller/interview.controller');
const upload = require('../middleware/file.middleware');

const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc Generate interview questions based on the provided resume, job description, and self-description.
 * @access private
 */

interviewRouter.post("/",authMiddleware.authuser,upload.single('resume'),interviewController.generateInterviewReportController); 



module.exports = interviewRouter;