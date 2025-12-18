import { Schema, model, Document } from "mongoose";
import { IClient } from "../../types/clients/clientAuth.types";
import { keysSchema, mediaSchema, reviewSchema } from "../shared.model";

const clientSchema = new Schema<IClient>(
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
    companySize: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    media: {
      type: [mediaSchema],
    },
    projectsPosted: {
      type: [String],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    developersHired: [String],
    keys: keysSchema,
  },
  {
    timestamps: true,
  }
);

export const Client = model<IClient>("Client", clientSchema);
