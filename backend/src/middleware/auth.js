import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authGuard = (roles = []) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing token" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .populate("stage")
        .populate("driverProfile");
      if (!user) {
        return res.status(401).json({ message: "Invalid token user" });
      }
      if (allowed.length && !allowed.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};


