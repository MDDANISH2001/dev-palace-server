import { Attachments } from "../shared.types";

export interface ProjectThread {
  projectId: string;
  projectTitle: string;
  status: "pending" | "active" | "completed";
  lastMessageId?: string; //_id of the message from the Message collection.
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chats {
  conversationId: string; // made using clientId_._developerId
  projectThreads?: string[]; // _id of all the ProjectThread documents in this chat
  messages: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  message: string;
  senderId: string;
  taggedMessageId?: string;
  attachments?: Attachments[];
  createdAt?: Date;
  updatedAt?: Date;
}
