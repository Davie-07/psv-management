import jwt from "jsonwebtoken";

export const signAuthToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  });
};

export const signParcelToken = (orderCode) => {
  if (!process.env.PARCEL_TOKEN_SECRET) {
    throw new Error("PARCEL_TOKEN_SECRET missing");
  }
  return jwt.sign({ orderCode }, process.env.PARCEL_TOKEN_SECRET, {
    expiresIn: process.env.PARCEL_TOKEN_EXPIRES_IN || "30m",
  });
};


