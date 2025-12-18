import { Schema, model } from "mongoose";
import { MatchRequest } from "../types/matchRequst.types";

const matchRequestSchema = new Schema<MatchRequest>(
  {
    projectId: {
      type: String,
      required: true,
      ref: "Project",
    },
    notifiedDevelopers: {
      type: [String],
      ref: "Developer",
      default: [],
    },
    acceptedDevelopers: {
      type: [String],
      ref: "Developer",
      default: [],
    },
    assignedDeveloper: {
      type: String,
      ref: "Developer",
    },
    status: {
      type: String,
      enum: ["pending", "in-review", "assigned", "expired"],
      required: true,
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
matchRequestSchema.index({ projectId: 1 });
matchRequestSchema.index({ status: 1 });
matchRequestSchema.index({ expiresAt: 1 });

export const MatchRequestModel = model<MatchRequest>("MatchRequest", matchRequestSchema);
