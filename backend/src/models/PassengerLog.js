import mongoose from "mongoose";

const passengerLogSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // format YYYY-MM-DD
    passengers: { type: Number, default: 0 },
    trips: { type: Number, default: 0 },
  },
  { timestamps: true }
);

passengerLogSchema.index({ driver: 1, date: 1 }, { unique: true });

export default mongoose.model("PassengerLog", passengerLogSchema);


