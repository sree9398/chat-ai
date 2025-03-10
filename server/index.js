const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("AIzaSyD3FJOMCsU2QhiCNOJDP04DDTLmMTW1R14");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        const result = await model.generateContent(message);
        const responseText = result.response.text();
        res.json({ response: responseText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
