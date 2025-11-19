import jwt from "jsonwebtoken";
import ParcelOrder from "../models/ParcelOrder.js";

export const parcelSessionGuard = async (req, res, next) => {
  try {
    const token = req.headers["x-parcel-token"];
    if (!token) {
      return res.status(401).json({ message: "Parcel token missing" });
    }
    const decoded = jwt.verify(token, process.env.PARCEL_TOKEN_SECRET);
    const order = await ParcelOrder.findOne({ orderCode: decoded.orderCode })
      .populate({
        path: "vehicle",
        populate: { path: "driver" },
      })
      .populate("driver")
      .populate("senderStage")
      .populate("receiverStage");
    if (!order) {
      return res.status(404).json({ message: "Parcel not found" });
    }
    req.parcelOrder = order;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid parcel token" });
  }
};


