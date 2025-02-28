const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/users");

// PROTECT ROUTES
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.header("authorization") &&
    req.header("authorization").startsWith("Bearer")
  ) {
    //SET TOKEN FROM BEARER TOKEN IN HEADER
    token = req.header("authorization").split(" ")[1];
  }
  // SET TOKEN FROM COOKIE
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // MAKE SURE TOKEN EXISTS
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  try {
    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

// GRANT ACCESS TO SPECIFIC ROLES
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is unauthorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};
