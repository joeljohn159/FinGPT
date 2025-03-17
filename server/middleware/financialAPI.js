// const axios = require('axios');
require('dotenv').config();
const OPENAI_MODEL_API = process.env.OPENAI_MODEL_API
const OPENAI_MODEL_API_KEY = process.env.OPENAI_MODEL_API_KEY
const modelName = "gpt-4o"

const OpenAI = require('openai')



// const { OPENAI_MODEL_API, OPENAI_MODEL_API_KEY } = require('./../config/auth.js');

async function getFinancialAdvice(messages) {
    try {


        const client = new OpenAI({ baseURL: OPENAI_MODEL_API, apiKey: OPENAI_MODEL_API_KEY });

        const response = await client.chat.completions.create({
            messages: messages,
            temperature: 0.7,
            top_p: 1.0,
            max_tokens: 1000,
            model: modelName
        });

        return response.choices[0].message.content;
    }
    catch (error) {
        throw Error("Error Interacting with OpenAIModel")
    }
}

module.exports = {
    getFinancialAdvice,
};