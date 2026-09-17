const savedResumeModel = require('./savedResume.model');

const MAX_SAVED_RESUMES = 3;

function buildMetadata(doc) {
    return {
        _id: doc._id,
        fileName: doc.fileName,
        size: doc.size,
        source: doc.source,
        createdAt: doc.createdAt,
    };
}

function isPdf(file) {
    if (!file) return false;
    const byMime = file.mimetype === 'application/pdf';
    const byName = (file.originalname || '').toLowerCase().endsWith('.pdf');
    return byMime || byName;
}

async function listSavedResumesController(req, res) {
    try {
        const docs = await savedResumeModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('fileName size source createdAt'); // never send the PDF binary in lists
        res.status(200).json({ resumes: docs, limit: MAX_SAVED_RESUMES });
    } catch (error) {
        console.error('[SavedResumes] list failed:', error);
        res.status(500).json({ message: 'Failed to load saved resumes' });
    }
}

async function saveResumeController(req, res) {
    try {
        const file = req.file;
        if (!file || !isPdf(file)) {
            return res.status(400).json({ message: 'Please upload a valid PDF file' });
        }

        const count = await savedResumeModel.countDocuments({ user: req.user.id });
        if (count >= MAX_SAVED_RESUMES) {
            const existing = await savedResumeModel
                .find({ user: req.user.id })
                .sort({ createdAt: -1 })
                .select('fileName size source createdAt');
            return res.status(409).json({
                code: 'LIMIT_REACHED',
                message: `You already saved ${MAX_SAVED_RESUMES} resumes. Replace one to continue.`,
                resumes: existing,
                limit: MAX_SAVED_RESUMES,
            });
        }

        const doc = await savedResumeModel.create({
            user: req.user.id,
            fileName: file.originalname,
            contentType: 'application/pdf',
            size: file.size,
            source: (req.body.source === 'fresh' || req.body.source === 'tailored') ? req.body.source : 'upload',
            data: file.buffer,
        });

        res.status(201).json({ message: 'Resume saved', resume: buildMetadata(doc) });
    } catch (error) {
        console.error('[SavedResumes] save failed:', error);
        res.status(500).json({ message: 'Failed to save resume' });
    }
}

async function replaceSavedResumeController(req, res) {
    try {
        const file = req.file;
        if (!file || !isPdf(file)) {
            return res.status(400).json({ message: 'Please upload a valid PDF file' });
        }

        const doc = await savedResumeModel.findOne({ _id: req.params.id, user: req.user.id });
        if (!doc) {
            return res.status(404).json({ message: 'Saved resume not found' });
        }

        doc.fileName = file.originalname;
        doc.size = file.size;
        doc.data = file.buffer;
        if (req.body.source === 'fresh' || req.body.source === 'tailored') {
            doc.source = req.body.source;
        }
        await doc.save();

        res.status(200).json({ message: 'Resume replaced', resume: buildMetadata(doc) });
    } catch (error) {
        console.error('[SavedResumes] replace failed:', error);
        res.status(500).json({ message: 'Failed to replace resume' });
    }
}

async function downloadSavedResumeController(req, res) {
    try {
        const doc = await savedResumeModel.findOne({ _id: req.params.id, user: req.user.id });
        if (!doc) {
            return res.status(404).json({ message: 'Saved resume not found' });
        }
        res.set('Content-Type', doc.contentType || 'application/pdf');
        res.set('Content-Length', doc.data.length);
        res.set('Content-Disposition', `attachment; filename="${doc.fileName}"`);
        res.send(doc.data);
    } catch (error) {
        console.error('[SavedResumes] download failed:', error);
        res.status(500).json({ message: 'Failed to download resume' });
    }
}

async function deleteSavedResumeController(req, res) {
    try {
        const doc = await savedResumeModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!doc) {
            return res.status(404).json({ message: 'Saved resume not found' });
        }
        res.status(200).json({ message: 'Resume deleted' });
    } catch (error) {
        console.error('[SavedResumes] delete failed:', error);
        res.status(500).json({ message: 'Failed to delete resume' });
    }
}

module.exports = {
    listSavedResumesController,
    saveResumeController,
    replaceSavedResumeController,
    downloadSavedResumeController,
    deleteSavedResumeController,
};
