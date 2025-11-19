import ParcelOrder from "../models/ParcelOrder.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getParcelDetails = asyncHandler(async (req, res) => {
  res.json(req.parcelOrder);
});

export const confirmPickup = asyncHandler(async (req, res) => {
  const order = req.parcelOrder;
  order.status = "PICKED_UP";
  order.confirmations.customer = new Date();
  await order.save();
  await ParcelOrder.deleteOne({ _id: order._id });
  res.json({ message: "Parcel picked up and record removed" });
});


