const mongoose = require('mongoose');

/**
 * - job description schema :string
 * -resume text :string
 * - self description:string
 * - matchscore :{
 *  number 
 * }
 * - Teachnical Questions : [{
 *    question : "",
 * intention : "",
 *  answer : ""}]
 * - Bheavioral Questions :[
 * {question : "",
 * intention : "",
 * answer : "" }
 * ]
 * - Skills gaps :[{
 *   skill : "",
 * serverty:{
 * type:String,
 * enum:["low","medium","high"]
 * }}]
 * - preparation plan :[{
 *  day:Numbwer,
 * focus:String,
 * tasks:[String]
 * 
 * }] 
 */
const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, { _id: false }
)
const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavioral question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, { _id: false })

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"],
        
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required"]
    }
}, { _id: false })

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]

})



const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: true
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
        required: true
    },
    scoreReasoning: {
     type: String,  
     required: true
   },
    matchScore: {
        type: Number,
        max: 100,
        min: 0
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })



const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;
