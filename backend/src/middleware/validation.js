import { body, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  };
};

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required")
    .isLength({ max: 255 })
    .withMessage("Email too long"),
  body("password")
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be 6-128 characters")
    .matches(/^[a-zA-Z0-9@#$%^&*!._-]+$/)
    .withMessage("Password contains invalid characters"),
];

export const parcelLoginValidation = [
  body("orderCode")
    .trim()
    .matches(/^[A-Z0-9\s]{3,20}$/)
    .withMessage("Invalid order code format")
    .isLength({ max: 20 })
    .withMessage("Order code too long"),
  body("customerName")
    .trim()
    .matches(/^[a-zA-Z\s'-]{2,100}$/)
    .withMessage("Invalid name format")
    .isLength({ max: 100 })
    .withMessage("Name too long"),
];

export const driverCreateValidation = [
  body("email").trim().isEmail().normalizeEmail().isLength({ max: 255 }),
  body("password").trim().isLength({ min: 8, max: 128 }),
  body("fullName").trim().matches(/^[a-zA-Z\s'-]{2,100}$/).isLength({ max: 100 }),
  body("phone").trim().matches(/^[0-9+\-\s()]{10,20}$/).isLength({ max: 20 }),
  body("plateNumber")
    .trim()
    .matches(/^[A-Z]{3}\s[0-9]{3}[A-Z]$/)
    .withMessage("Plate must match format: KAA 123A"),
  body("route").trim().isLength({ min: 3, max: 200 }),
  body("stageId").isMongoId().withMessage("Invalid stage ID"),
];

export const stageCreateValidation = [
  body("name").trim().matches(/^[a-zA-Z0-9\s'-]{2,100}$/).isLength({ max: 100 }),
  body("location").trim().isLength({ min: 3, max: 200 }),
];

export const parcelSendValidation = [
  body("vehicleId").isMongoId().withMessage("Invalid vehicle ID"),
  body("driverId").isMongoId().withMessage("Invalid driver ID"),
  body("receiverStageId").isMongoId().withMessage("Invalid receiver stage ID"),
  body("customerName").trim().matches(/^[a-zA-Z\s'-]{2,100}$/).isLength({ max: 100 }),
  body("customerPhone").trim().matches(/^[0-9+\-\s()]{10,20}$/).isLength({ max: 20 }),
  body("destination").trim().isLength({ min: 3, max: 300 }),
  body("amount").isFloat({ min: 0, max: 1000000 }).withMessage("Invalid amount"),
  body("parcelCount").optional().isInt({ min: 1, max: 100 }),
  body("description").optional().trim().isLength({ max: 1000 }),
];

export const vehicleMovementValidation = [
  body("vehicleId").isMongoId().withMessage("Invalid vehicle ID"),
  body("driverId").isMongoId().withMessage("Invalid driver ID"),
  body("route").trim().matches(/^[a-zA-Z0-9\s–\-–]{3,200}$/).isLength({ max: 200 }),
  body("departureTime").optional().isISO8601().withMessage("Invalid date format"),
];

