// index.js
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getGeminiResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = { getGeminiResponse };
