export const notFound = (_req, res) => {
  res.status(404).json({
    message: "Resource not found",
  });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  // Sanitize error messages in production
  let message = "An error occurred";
  if (process.env.NODE_ENV === "development") {
    message = err.message || "Something went wrong";
  } else {
    // Generic messages for production
    if (statusCode === 500) {
      message = "Internal server error";
    } else if (statusCode === 401) {
      message = "Authentication failed";
    } else if (statusCode === 403) {
      message = "Access denied";
    } else if (statusCode === 404) {
      message = "Resource not found";
    } else if (statusCode === 400) {
      message = err.message || "Invalid request";
    } else {
      message = err.message || "An error occurred";
    }
  }

  // Don't leak database errors
  if (err.name === "MongoError" || err.name === "MongooseError") {
    message = "Database operation failed";
  }

  // Don't leak validation details in production
  if (err.name === "ValidationError") {
    if (process.env.NODE_ENV === "production") {
      message = "Validation failed";
    } else {
      message = err.message;
    }
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};


