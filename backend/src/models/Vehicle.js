import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ["PSV"],
      default: "PSV",
    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    capacity: { type: Number, default: 14 },
    stage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);


