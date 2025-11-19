// Security utilities to prevent data leakage

// Sanitize console logs in production
export const safeLog = (...args) => {
  if (import.meta.env.PROD) {
    // In production, don't log sensitive data
    console.log("[TrustDrive] Log entry suppressed in production");
    return;
  }
  console.log(...args);
};

// Sanitize error messages before displaying
export const sanitizeError = (error) => {
  if (import.meta.env.PROD) {
    // Generic error messages in production
    if (error?.response?.status === 401) {
      return "Authentication failed";
    }
    if (error?.response?.status === 403) {
      return "Access denied";
    }
    if (error?.response?.status === 404) {
      return "Resource not found";
    }
    if (error?.response?.status >= 500) {
      return "Server error. Please try again later";
    }
    return error?.response?.data?.message || "An error occurred";
  }
  // In development, show full error
  return error?.response?.data?.message || error?.message || "An error occurred";
};

// Remove sensitive data from objects before logging
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  
  const sensitiveKeys = ["password", "token", "secret", "authorization", "apiKey", "apikey"];
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Disable console methods in production
if (import.meta.env.PROD) {
  // Override console methods to prevent data leakage
  const noop = () => {};
  
  // Keep console.error for critical errors but sanitize
  const originalError = console.error;
  console.error = (...args) => {
    const sanitized = args.map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        return sanitizeObject(arg);
      }
      return arg;
    });
    originalError(...sanitized);
  };
  
  // Disable other console methods
  console.debug = noop;
  console.info = noop;
  console.trace = noop;
  console.warn = noop;
  
  // Override console.log to sanitize
  const originalLog = console.log;
  console.log = (...args) => {
    const sanitized = args.map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        return sanitizeObject(arg);
      }
      return arg;
    });
    originalLog(...sanitized);
  };
}

