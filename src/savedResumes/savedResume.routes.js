const express = require('express');
const multer = require('multer');
const { authuser } = require('../middleware/auth.middleware');
const {
    listSavedResumesController,
    saveResumeController,
    replaceSavedResumeController,
    downloadSavedResumeController,
    deleteSavedResumeController,
} = require('./savedResume.controller');

const savedResumeRouter = express.Router();

// Own multer instance - isolated from the shared file.middleware.js
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// Converts multer's file-size error into a clean JSON 413
function handleMulterError(error, req, res, next) {
    if (error && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'PDF is too large. Maximum size is 3MB.' });
    }
    next(error);
}

savedResumeRouter.get('/', authuser, listSavedResumesController);

savedResumeRouter.post(
    '/',
    authuser,
    upload.single('resumeFile'),
    handleMulterError,
    saveResumeController
);

savedResumeRouter.post(
    '/:id/replace',
    authuser,
    upload.single('resumeFile'),
    handleMulterError,
    replaceSavedResumeController
);

savedResumeRouter.get('/:id/download', authuser, downloadSavedResumeController);

savedResumeRouter.delete('/:id', authuser, deleteSavedResumeController);

module.exports = savedResumeRouter;
