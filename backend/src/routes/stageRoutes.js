import { Router } from "express";
import {
  confirmArrival,
  getIncomingParcels,
  getOutgoingParcels,
  getStageResources,
  getTodayVehicleStats,
  listStagesForManager,
  markVehicleArrival,
  markVehicleDeparture,
  sendParcel,
} from "../controllers/stageController.js";
import { authGuard } from "../middleware/auth.js";
import { validate, parcelSendValidation, vehicleMovementValidation } from "../middleware/validation.js";

const router = Router();

router.use(authGuard("STAGE_MANAGER"));

router.post("/parcels", validate(parcelSendValidation), sendParcel);
router.get("/parcels/outgoing", getOutgoingParcels);
router.get("/parcels/incoming", getIncomingParcels);
router.patch("/parcels/:orderCode/arrival", confirmArrival);
router.get("/resources", getStageResources);
router.get("/stages", listStagesForManager);
router.get("/vehicles/stats/today", getTodayVehicleStats);
router.post("/vehicles/departures", validate(vehicleMovementValidation), markVehicleDeparture);
router.patch("/vehicles/departures/:movementId/arrival", markVehicleArrival);

export default router;


