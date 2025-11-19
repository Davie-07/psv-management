import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, default: "Unknown" },
    category: { type: String, default: "Traffic" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Quote", quoteSchema);


