import "dotenv/config";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/chat.js";

const router = express.Router();

const ai = new GoogleGenerativeAI(process.env.KEY);

const Health_Instructions = `You are Healthify, an assistant providing general health information.

You can discuss general wellness, nutrition, exercise, sleep,
and common health questions.

Rules:
1. Explain information in clear, simple language.
2. Never claim to provide a confirmed diagnosis.
3. Do not prescribe medicines or individualized medication doses.
4. Explain uncertainty and recommend a qualified healthcare
   professional when personal medical advice is needed.
5. For potentially life-threatening symptoms, advise the user
   to seek emergency medical care immediately.
6. Be respectful and do not make unsupported claims.`;

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a question"
            });
        }
        if (message.length > 5000) {
            return res.status(400).json({
                error: "Word limit reach...5000"
            });
        };
        
        const models = ai.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            systemInstruction: Health_Instructions
        });
        
       // const response = await models.generateContent(message.trim());
        // const answer = response.text;




let result;
let lastError;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    result = await models.generateContent(message.trim());
    break;
  } catch (error) {
    lastError = error;

    // Retry only when Gemini reports temporary server overload.
    if (!String(error.message).includes("503")) {
      throw error;
    }

    if (attempt < 3) {
      console.log(`Gemini busy. Retry ${attempt}/3...`);

      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 2000)
      );
    }
  }
}

if (!result) {
  throw lastError || new Error("Gemini could not generate a response.");
}
        

        const answer = result.response.text();
        

        
        // if (!answer || !answer.trim()) {
        //     return res.status(500).json({
        //         error: "It's returning a empty answer"
        //     });
        // }




//  const answer = response.text;

// if (!answer || !answer.trim()) {
//   console.log(
//     "Gemini response details:",
//     JSON.stringify({
//       promptFeedback: response.promptFeedback,
//       candidates: response.candidates?.map((candidate) => ({
//         finishReason: candidate.finishReason,
//         content: candidate.content
//       }))
//     }, null, 2)
//   );

//   throw new Error(
//     "Gemini returned no text. Check the backend terminal for response details."
//   );
// }

        const savedChat = await Chat.create({
            question: message.trim(),
            answer
        });

        return res.status(200).json({
            message: "Answer generated successfully",
            answer,
            chatId: savedChat.id
        });
    } catch (error) {
        console.error("Chat route error :", error);

        return res.status(500).json({
            error: error.message || "no answer"
        });
    }
});


router.get("/history", async (req, res) => {
    try {
      const chats = await Chat.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
  
      const history = chats.reverse().flatMap((chat) => [
        {
          role: "user",
          text: chat.question
        },
        {
          role: "assistant",
          text: chat.answer
        }
      ]);
  
      return res.status(200).json({ history });
    } catch (error) {
      console.error("History route error:", error);
  
      return res.status(500).json({
        error: "Could not load chat history."
      });
    }
  });
  
  export default router;
