import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },

    answer: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
