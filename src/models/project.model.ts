import { Schema, model } from "mongoose";
import { ProjectType, BudgetType } from "../types/project.types";
import { mediaSchema } from "./shared.model";

const budgetSchema = new Schema<BudgetType>(
  {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const projectSchema = new Schema<ProjectType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      required: true,
      ref: "Client",
    },
    projectType: {
      type: String,
      enum: ["direct", "listed", "instant"],
      required: true,
    },
    skillsRequired: {
      type: [String],
    },
    budget: {
      type: budgetSchema,
    },
    durationEstimate: {
      type: String,
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "on-hold"],
      required: true,
      default: "pending",
    },
    sowUrl: {
      type: String,
      trim: true,
    },
    developerId: {
      type: [String],
      ref: "Developer",
    },
    media: {
      type: [mediaSchema],
    },
  },
  {
    timestamps: true,
  }
);

export const Project = model<ProjectType>("Project", projectSchema);