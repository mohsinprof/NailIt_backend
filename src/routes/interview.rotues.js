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
/**
 * @route GET /api/interview/:interviewId
 * @desc Get the interview report by its ID.
 * @access private
 */
interviewRouter.get("/:interviewId",authMiddleware.authuser,interviewController.getInterviewReportByIdController);
 
/**
 * @route GET /api/interview
 * @desc Get all interview reports for the authenticated user.  
 * @access private
 */
interviewRouter.get("/",authMiddleware.authuser,interviewController.getAllInterviewReportByIdController);

// === DELETE REPORT - START (delete these blocks to remove the feature) ===
/**
 * @route DELETE /api/interview/:interviewId
 * @desc Delete an interview report owned by the authenticated user.
 * @access private
 */
interviewRouter.delete("/:interviewId", authMiddleware.authuser, interviewController.deleteInterviewReportController);
// === DELETE REPORT - END ===


module.exports = interviewRouter;