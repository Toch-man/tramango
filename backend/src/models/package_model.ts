import mongoose, { Document, Schema } from "mongoose";

export interface IPackage extends Document {
  title: string;
  description: string;
  availableSlots: number;
  price: number;
}

const packageSchema = new Schema<IPackage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    availableSlots: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Package = mongoose.model<IPackage>("Package", packageSchema);
