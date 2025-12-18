import { Schema, model } from "mongoose";
import { IDeveloper } from "../../types/developers/devAuth.types";
import { keysSchema, mediaSchema, reviewSchema } from "../shared.model";

const devSchema = new Schema<IDeveloper>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImg: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
    },
    experience: {
      type: Number,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    media: {
      type: [mediaSchema],
    },
    projectsCompleted: {
      type: [String],
    },
    reviews: {
      type: [reviewSchema],
    },
    hourlyRate: {
      type: Number,
    },
    availibility: {
      type: String,
      enum: ["available", "offline", "busy"],
      default: "available",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    instantProjectsEnabled: {
      type: Boolean,
      default: false,
    },
    keys: keysSchema,
  },
  {
    timestamps: true,
  }
);

export const Developer = model<IDeveloper>("Developer", devSchema);
