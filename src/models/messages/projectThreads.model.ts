// server/models/User.js
import { Schema, model } from "mongoose";
import { ProjectThread } from "../../types/messages/chat.types";

const projectThreadSchema = new Schema<ProjectThread>(
  {
    projectId: { type: String, required: true }, // user1Id_._user2Id
    projectTitle: { type: String, required: true }, // _id of all the ProjectThread documents in this chat
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      required: true,
    }, // status of the project thread
    lastMessageId: { type: String, required: true }, // _id of the message from the Message collection.
  },
  {
    timestamps: true,
  }
);

const ProjectThread = model<ProjectThread>(
  "ProjectThread",
  projectThreadSchema
);

export default ProjectThread;
