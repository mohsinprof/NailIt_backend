
require('dotenv').config()
const  { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({ GEMINI_API_KEY: process.env.GOOGLE_GENAI_API_KEY })

async function generateinvoke() {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "Hello gemeni! explain  what is interview report in simple words?"
    })
    console.log(response)
    console.log(response.text)
} 

module.exports = generateinvoke