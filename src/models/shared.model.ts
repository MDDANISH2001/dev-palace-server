import { Schema } from "mongoose";
import { Attachments, IKeys, ReviewType, type MediaType } from "../types/shared.types";

const mediaSchema = new Schema<MediaType>({
  mediaUrl: {
    type: String,
  },
  mediaId: {
    type: String,
  },
  mediaName: {
    type: String,
  },
});

export { mediaSchema };

export const reviewSchema = new Schema<ReviewType>(
  {
    reviewerId: {
      type: String,
      required: true,
      ref: "Client",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const keysSchema = new Schema<IKeys>(
  {
    publicKey: { type: String, required: true, unique: true },
    privateKey: {
      iv: { type: String, required: true, unique: true },
      encryptedMessage: { type: String, required: true, unique: true },
      tag: { type: String, required: true, unique: true },
    },
    rootKey: {
      iv: { type: String, required: true, unique: true },
      encryptedMessage: { type: String, required: true, unique: true },
      tag: { type: String, required: true, unique: true },
    },
  },
  {
    timestamps: true,
  }
);


export const attachment = new Schema<Attachments>({
  mediaUrl: { type: String },
  mediaName: { type: String },
});