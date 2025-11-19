import mongoose from "mongoose";

const plateRegex = /^K[A-Z]{2}\s\d{3}[A-Z]$/;

const driverProfileSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: plateRegex,
    },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    route: { type: String, required: true },
    stage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
  },
  { timestamps: true }
);

export default mongoose.model("DriverProfile", driverProfileSchema);


