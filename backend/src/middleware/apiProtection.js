// API protection middleware to obfuscate endpoints

// Add random delay to prevent timing attacks
export const randomDelay = (req, res, next) => {
  // Add 50-150ms random delay to prevent timing-based enumeration
  const delay = Math.floor(Math.random() * 100) + 50;
  setTimeout(next, delay);
};

// Obfuscate error responses to prevent endpoint discovery
export const obfuscateErrors = (err, req, res, next) => {
  // If route doesn't exist, return generic 404
  if (err.status === 404) {
    return res.status(404).json({
      message: "Resource not found",
    });
  }
  next(err);
};

// Validate request origin (additional layer)
export const validateOrigin = (req, res, next) => {
  // Skip for health checks
  if (req.path === "/health") {
    return next();
  }

  // In production, validate origin
  if (process.env.NODE_ENV === "production") {
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

    // Allow requests without origin (mobile apps, Postman, etc.) if authenticated
    if (!origin && req.headers.authorization) {
      return next();
    }

    if (origin && !allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
  }

  next();
};

