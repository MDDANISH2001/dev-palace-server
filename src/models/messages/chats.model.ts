// server/models/User.js
import { Schema, model } from "mongoose";
import { Chats } from "../../types/messages/chat.types";

const chats = new Schema<Chats>(
  {
    conversationId: { type: String, required: true }, // user1Id_._user2Id
    projectThreads: { type: [String], required: false }, // _id of all the ProjectThread documents in this chat
    messages: { type: [String], required: false }, // _id of all the Message documents in this chat
  },
  {
    timestamps: true,
  }
);

const Chats = model<Chats>("Chats", chats);

export default Chats;
