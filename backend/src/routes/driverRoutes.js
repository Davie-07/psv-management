import { Router } from "express";
import {
  getDriverSummary,
  upsertPassengerLog,
} from "../controllers/driverController.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

router.use(authGuard("DRIVER"));

router.get("/summary", getDriverSummary);
router.put("/passenger-log", upsertPassengerLog);

export default router;


