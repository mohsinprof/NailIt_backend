const express = require('express');
const cookiePArser=require('cookie-parser');
/* require authroutes */
const authRouter = require('./routes/auth.routes')
const cors = require('cors');
const interviewRouter = require('./routes/interview.rotues');
const resumePdfRouter = require('./routes/resumePdf.routes');
const freshResumeRouter = require('./routes/makeFreshResume/freshResume.routes');





const app=express();

app.use(express.json());
app.use(cookiePArser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

/** using all the routes here  */
app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)
app.use("/api/interview", resumePdfRouter)
app.use("/api/makeFreshResume", freshResumeRouter)

// === SAVED RESUMES FEATURE - START (delete this whole block to remove the feature) ===
try {
    const savedResumeRouter = require('./savedResumes/savedResume.routes');
    app.use("/api/saved-resumes", savedResumeRouter);
} catch (error) {
    console.error("[SavedResumes] Feature failed to load, app is running without it:", error.message);
}
// === SAVED RESUMES FEATURE - END ===




module.exports=app;