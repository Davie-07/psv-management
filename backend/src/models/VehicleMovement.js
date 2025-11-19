import mongoose from "mongoose";

const vehicleMovementSchema = new mongoose.Schema(
  {
    stage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    route: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date },
    status: {
      type: String,
      enum: ["DEPARTED", "ARRIVED"],
      default: "DEPARTED",
    },
    day: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

vehicleMovementSchema.index({ stage: 1, day: 1 });

export default mongoose.model("VehicleMovement", vehicleMovementSchema);


