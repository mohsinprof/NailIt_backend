// backend: src/routes/makeFreshResume/freshResume.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../../middleware/file.middleware'); // Your multer middleware
const { authuser } = require('../../middleware/auth.middleware');
const { generateFreshResumeController } = require('../../contoller/makeFreshResume/freshResume.controller');

// POST /api/makeFreshResume/generate
router.post(
    '/generate',
    authuser,
    upload.single('resumePdf'),
    generateFreshResumeController
);

module.exports = router;