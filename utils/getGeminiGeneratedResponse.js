// gemini
const genAI = require('@google/generative-ai');
const sendMessageToUser = require('./sendMessageToUser');
const GeminiClient = new genAI.GoogleGenerativeAI(process.env.GEMINI_KEY);

// function that will take prompt as an input and returns AI generated response
async function getGeminiGeneratedResponse(prompt) {
    try {
        
        const model = GeminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL_NAME }); 
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text()
    }
    catch (err) {
        return "Sorry the bot is unavailable right now. Please try again in a moment."
    }
}

module.exports = getGeminiGeneratedResponse;