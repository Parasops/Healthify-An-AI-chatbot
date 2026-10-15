import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;
 
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json({limit : "20kb"})); 


app.get("/", async (req, res) => {
    res.json({
        message: "Healthify backend is running!"
      });
});

app.use('/api/chat', chatRoutes);

async function startServer() {
    try {
        if (!process.env.KEY) {
            throw new Error("API KEY is missing");
        }

        if (!process.env.MONGO_URI) {
            throw new Error("Backend key is missing");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error("Backend startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
