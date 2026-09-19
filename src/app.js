const express = require('express');
const cookiePArser = require('cookie-parser');
const authRouter = require('./routes/auth.routes');
const cors = require('cors');
const interviewRouter = require('./routes/interview.rotues');
const resumePdfRouter = require('./routes/resumePdf.routes');
const freshResumeRouter = require('./routes/makeFreshResume/freshResume.routes');

const app = express();

app.use(express.json());
app.use(cookiePArser());
//testing

// FIX: Allow all origins so your Vercel frontend can talk to it
app.use(cors({
    origin: true,
    credentials: true
}))

// FIX: Add a root route so the browser shows something when you visit the IP
app.get('/', (req, res) => {
    res.send('NailIt Backend API is Live and Running!');
});

/** using all the routes here  */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/interview", resumePdfRouter)
app.use("/api/makeFreshResume", freshResumeRouter)

// === SAVED RESUMES FEATURE - START ===
try {
    const savedResumeRouter = require('./savedResumes/savedResume.routes');
    app.use("/api/saved-resumes", savedResumeRouter);
} catch (error) {
    console.error("[SavedResumes] Feature failed to load, app is running without it:", error.message);
}
// === SAVED RESUMES FEATURE - END ===

module.exports = app;