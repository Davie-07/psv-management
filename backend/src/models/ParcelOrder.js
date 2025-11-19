import mongoose from "mongoose";

const orderCodePattern = /^[A-Z]{3}\s\d{2}[A-Z]\s[A-Z]\d$/;

const parcelOrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: orderCodePattern,
    },
    senderStage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", required: true },
    receiverStage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    destination: { type: String, required: true },
    amount: { type: Number, required: true },
    parcelCount: { type: Number, default: 1 },
    description: { type: String },
    departureTime: { type: Date, required: true },
    eta: { type: Date, required: true },
    status: {
      type: String,
      enum: ["CREATED", "IN_TRANSIT", "ARRIVED", "PICKED_UP"],
      default: "CREATED",
    },
    confirmations: {
      stageManager: { type: Date },
      customer: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("ParcelOrder", parcelOrderSchema);


