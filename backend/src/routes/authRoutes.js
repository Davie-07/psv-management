import { Router } from "express";
import { login, parcelLogin } from "../controllers/authController.js";
import { validate, loginValidation, parcelLoginValidation } from "../middleware/validation.js";
import { authLimiter, parcelLoginLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", authLimiter, validate(loginValidation), login);
router.post("/parcel-login", parcelLoginLimiter, validate(parcelLoginValidation), parcelLogin);

export default router;


