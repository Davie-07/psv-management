import Stage from "../models/Stage.js";
import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import Vehicle from "../models/Vehicle.js";
import Quote from "../models/Quote.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createStage = asyncHandler(async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required" });
  }
  const stage = await Stage.create({ name, location });
  res.status(201).json(stage);
});

export const assignStageManager = asyncHandler(async (req, res) => {
  const { stageId, email, password, fullName, phone } = req.body;
  const stage = await Stage.findById(stageId);
  if (!stage) {
    return res.status(404).json({ message: "Stage not found" });
  }
  const user = await User.create({
    email,
    password,
    role: "STAGE_MANAGER",
    fullName,
    phone,
    stage: stageId,
  });
  stage.manager = user._id;
  await stage.save();
  res.status(201).json({ user, stage });
});

export const createDriver = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    fullName,
    phone,
    plateNumber,
    route,
    stageId,
  } = req.body;
  const stage = await Stage.findById(stageId);
  if (!stage) {
    return res.status(404).json({ message: "Stage not found" });
  }

  const driverProfile = await DriverProfile.create({
    plateNumber,
    driverName: fullName,
    driverPhone: phone,
    route,
    stage: stageId,
  });

  const driverUser = await User.create({
    email,
    password,
    role: "DRIVER",
    fullName,
    phone,
    driverProfile: driverProfile._id,
    stage: stageId,
  });

  const vehicle = await Vehicle.create({
    plateNumber,
    category: "PSV",
    driver: driverUser._id,
    stage: stageId,
  });

  res.status(201).json({ user: driverUser, driverProfile, vehicle });
});

export const listDrivers = asyncHandler(async (_req, res) => {
  const drivers = await User.find({ role: "DRIVER" })
    .populate("driverProfile")
    .populate("stage");
  res.json(drivers);
});

export const createQuote = asyncHandler(async (req, res) => {
  const { text, author } = req.body;
  if (!text) return res.status(400).json({ message: "Quote text required" });
  const quote = await Quote.create({ text, author });
  res.status(201).json(quote);
});

export const listStages = asyncHandler(async (_req, res) => {
  const stages = await Stage.find().populate("manager");
  res.json(stages);
});


