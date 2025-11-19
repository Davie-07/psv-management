import dayjs from "dayjs";
import ParcelOrder from "../models/ParcelOrder.js";
import Stage from "../models/Stage.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";
import VehicleMovement from "../models/VehicleMovement.js";
import { generateOrderCode } from "../utils/orderCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendParcel = asyncHandler(async (req, res) => {
  const {
    vehicleId,
    driverId,
    receiverStageId,
    customerName,
    customerPhone,
    destination,
    amount,
    parcelCount,
    description,
    departureTime,
    eta,
  } = req.body;

  const senderStageId = req.user.stage?._id;
  if (!senderStageId) {
    return res.status(400).json({ message: "Stage assignment missing" });
  }

  const receiverStage = await Stage.findById(receiverStageId);
  if (!receiverStage) {
    return res.status(404).json({ message: "Receiver stage not found" });
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  const driver = await User.findById(driverId);
  if (!driver) {
    return res.status(404).json({ message: "Driver not found" });
  }

  const order = await ParcelOrder.create({
    orderCode: generateOrderCode(),
    senderStage: senderStageId,
    receiverStage: receiverStageId,
    vehicle: vehicleId,
    driver: driverId,
    customerName,
    customerPhone,
    destination,
    amount,
    parcelCount,
    description,
    departureTime: departureTime ? dayjs(departureTime).toDate() : new Date(),
    eta: eta ? dayjs(eta).toDate() : dayjs().add(4, "hour").toDate(),
    status: "IN_TRANSIT",
  });

  res.status(201).json(order);
});

export const getOutgoingParcels = asyncHandler(async (req, res) => {
  const stageId = req.user.stage?._id;
  const parcels = await ParcelOrder.find({ senderStage: stageId })
    .sort("-createdAt")
    .populate("receiverStage")
    .populate("vehicle")
    .populate("driver");
  res.json(parcels);
});

export const getIncomingParcels = asyncHandler(async (req, res) => {
  const stageId = req.user.stage?._id;
  const parcels = await ParcelOrder.find({
    receiverStage: stageId,
    status: { $in: ["IN_TRANSIT", "ARRIVED"] },
  })
    .sort("-createdAt")
    .populate("senderStage")
    .populate("vehicle")
    .populate("driver");
  res.json(parcels);
});

export const confirmArrival = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;
  const stageId = req.user.stage?._id?.toString();
  const order = await ParcelOrder.findOne({ orderCode: orderCode.toUpperCase() });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.receiverStage.toString() !== stageId) {
    return res.status(403).json({ message: "Cannot confirm for this stage" });
  }
  order.status = "ARRIVED";
  order.confirmations.stageManager = new Date();
  await order.save();
  res.json(order);
});

export const getStageResources = asyncHandler(async (req, res) => {
  const stageId = req.user.stage?._id;
  const vehicles = await Vehicle.find({ stage: stageId }).populate("driver", "fullName");
  const drivers = await User.find({ role: "DRIVER", stage: stageId })
    .select("fullName _id driverProfile")
    .populate("driverProfile", "route");
  res.json({ vehicles, drivers });
});

export const listStagesForManager = asyncHandler(async (_req, res) => {
  const stages = await Stage.find().select("name location _id");
  res.json(stages);
});

export const markVehicleDeparture = asyncHandler(async (req, res) => {
  const { vehicleId, driverId, route, departureTime } = req.body;
  const stageId = req.user.stage?._id;
  if (!stageId) {
    return res.status(400).json({ message: "Stage assignment missing" });
  }

  const vehicle = await Vehicle.findOne({ _id: vehicleId, stage: stageId });
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found for this stage" });
  }

  const driver = await User.findOne({ _id: driverId, stage: stageId, role: "DRIVER" });
  if (!driver) {
    return res.status(404).json({ message: "Driver not found for this stage" });
  }

  const departureDate = departureTime ? dayjs(departureTime) : dayjs();

  const movement = await VehicleMovement.create({
    stage: stageId,
    vehicle: vehicleId,
    driver: driverId,
    route,
    departureTime: departureDate.toDate(),
    day: departureDate.format("YYYY-MM-DD"),
  });

  res.status(201).json(movement);
});

export const markVehicleArrival = asyncHandler(async (req, res) => {
  const { movementId } = req.params;
  const stageId = req.user.stage?._id?.toString();
  const movement = await VehicleMovement.findById(movementId);
  if (!movement) {
    return res.status(404).json({ message: "Movement not found" });
  }
  if (movement.stage.toString() !== stageId) {
    return res.status(403).json({ message: "Cannot update another stage record" });
  }
  if (movement.status === "ARRIVED") {
    return res.status(400).json({ message: "Vehicle already marked as arrived" });
  }
  movement.status = "ARRIVED";
  movement.arrivalTime = new Date();
  await movement.save();
  res.json(movement);
});

export const getTodayVehicleStats = asyncHandler(async (req, res) => {
  const stageId = req.user.stage?._id;
  const dayKey = dayjs().format("YYYY-MM-DD");
  const [departedCount, arrivedCount, active] = await Promise.all([
    VehicleMovement.countDocuments({ stage: stageId, day: dayKey }),
    VehicleMovement.countDocuments({
      stage: stageId,
      day: dayKey,
      status: "ARRIVED",
    }),
    VehicleMovement.find({ stage: stageId, day: dayKey, status: "DEPARTED" })
      .populate("vehicle", "plateNumber")
      .populate("driver", "fullName"),
  ]);

  res.json({ day: dayKey, departedCount, arrivedCount, active });
});


