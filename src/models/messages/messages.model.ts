import { model, Schema } from "mongoose";
import { Message } from "../../types/messages/chat.types";
import { attachment } from "../shared.model";

const allMessages = new Schema<Message>(
  {
    message: { type: String, default: "", required: true },
    senderId: { type: String, required: true },
    taggedMessageId: { type: String, required: false, default: "" },
    attachments: [attachment],
  },
  {
    timestamps: true,
  }
);

const messages = model<Message>("Messages", allMessages);

export default messages;
