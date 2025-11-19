import User from "../models/User.js";
import ParcelOrder from "../models/ParcelOrder.js";
import { signAuthToken, signParcelToken } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Additional sanitization (validation middleware already normalized)
  const normalizedEmail = email.trim().toLowerCase();
  
  // Find user with password field (not using lean to access instance methods)
  const user = await User.findOne({ email: normalizedEmail })
    .select("+password")
    .populate("driverProfile", "plateNumber route")
    .populate("stage", "name location");
    
  if (!user) {
    // Use same message to prevent user enumeration
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  // Compare password using bcrypt
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  const token = signAuthToken(user._id);
  
  // Sanitize user object - only send necessary fields (convert to plain object)
  const userObj = user.toObject();
  delete userObj.password;
  
  const safeUser = {
    _id: userObj._id,
    email: userObj.email,
    fullName: userObj.fullName,
    role: userObj.role,
    phone: userObj.phone,
    driverProfile: userObj.driverProfile,
    stage: userObj.stage,
  };
  
  res.json({ token, user: safeUser });
});

export const parcelLogin = asyncHandler(async (req, res) => {
  const { orderCode, customerName } = req.body;
  
  // Sanitize inputs
  const normalizedOrderCode = orderCode.trim().toUpperCase();
  const normalizedName = customerName.trim();
  
  // Use parameterized query - Mongoose handles this, but be explicit
  const order = await ParcelOrder.findOne({
    orderCode: normalizedOrderCode,
    customerName: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  })
    .populate("vehicle", "plateNumber")
    .populate("driver", "fullName")
    .populate("senderStage", "name location")
    .populate("receiverStage", "name location")
    .lean();

  if (!order) {
    // Generic message to prevent enumeration
    return res.status(404).json({ message: "Parcel order not found" });
  }

  if (order.status === "PICKED_UP") {
    return res.status(410).json({ message: "Order already closed" });
  }

  const parcelToken = signParcelToken(order.orderCode);
  
  // Sanitize order data - only send necessary fields
  const safeOrder = {
    _id: order._id,
    orderCode: order.orderCode,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    destination: order.destination,
    amount: order.amount,
    parcelCount: order.parcelCount,
    description: order.description,
    departureTime: order.departureTime,
    eta: order.eta,
    status: order.status,
    confirmations: order.confirmations,
    vehicle: order.vehicle,
    driver: order.driver,
    senderStage: order.senderStage,
    receiverStage: order.receiverStage,
  };
  
  res.json({ parcelToken, order: safeOrder });
});


