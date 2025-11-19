import { Router } from "express";
import {
  confirmPickup,
  getParcelDetails,
} from "../controllers/parcelController.js";
import { parcelSessionGuard } from "../middleware/parcelAuth.js";

const router = Router();

router.use(parcelSessionGuard);

router.get("/:orderCode", getParcelDetails);
router.post("/:orderCode/pickup", confirmPickup);

export default router;


