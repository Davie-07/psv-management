import dayjs from "dayjs";
import DriverProfile from "../models/DriverProfile.js";
import PassengerLog from "../models/PassengerLog.js";
import Quote from "../models/Quote.js";
import ParcelOrder from "../models/ParcelOrder.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const todayKey = () => dayjs().format("YYYY-MM-DD");

export const getDriverSummary = asyncHandler(async (req, res) => {
  const driver = req.user;
  const profile = await DriverProfile.findById(driver.driverProfile);
  if (!profile) {
    return res.status(404).json({ message: "Driver profile missing" });
  }

  const passengerLog =
    (await PassengerLog.findOne({
      driver: driver._id,
      date: todayKey(),
    })) || { passengers: 0, trips: 0 };

  const parcels = await ParcelOrder.find({
    driver: driver._id,
    status: { $ne: "PICKED_UP" },
  }).select("orderCode status receiverStage eta");

  const [quote] = await Quote.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: 1 } },
  ]);

  res.json({
    welcome: {
      message: `Welcome back, ${driver.fullName}`,
      quote: quote
        ? `${quote.text} — ${quote.author}`
        : "Stay safe on the road.",
    },
    vehicle: {
      plateNumber: profile.plateNumber,
      route: profile.route,
      driverName: profile.driverName,
      driverPhone: profile.driverPhone,
    },
    passengerLog,
    parcels,
  });
});

export const upsertPassengerLog = asyncHandler(async (req, res) => {
  const { passengers = 0, trips = 0 } = req.body;
  const driver = req.user;
  const log = await PassengerLog.findOneAndUpdate(
    { driver: driver._id, date: todayKey() },
    { passengers, trips },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(log);
});


