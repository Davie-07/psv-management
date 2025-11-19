import { Router } from "express";
import {
  assignStageManager,
  createDriver,
  createQuote,
  createStage,
  listDrivers,
  listStages,
} from "../controllers/adminController.js";
import { authGuard } from "../middleware/auth.js";
import { validate, driverCreateValidation, stageCreateValidation } from "../middleware/validation.js";
import { adminLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(authGuard("ADMIN"));
router.use(adminLimiter);

router.post("/stages", validate(stageCreateValidation), createStage);
router.get("/stages", listStages);
router.post("/stages/assign-manager", assignStageManager);

router.post("/drivers", validate(driverCreateValidation), createDriver);
router.get("/drivers", listDrivers);

router.post("/quotes", createQuote);

export default router;


