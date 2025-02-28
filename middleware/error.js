const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // LOG TO CONSOLE FOR DEV
  console.log(err.name);
  console.log(err); //err.stack

  // MONGOOSE BAD OBJECTID
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // MONGOOSE DUPLICATE KEY
  if (err.code === 11000) {
  //  const message = "Duplicate field value entered";
    const message = err.keyValue.email +" exists in the system"
    error = new ErrorResponse(message, 400);
  }

  // MONGOOSE VALIDATION ERROR
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
