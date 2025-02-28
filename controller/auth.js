const crypto = require("crypto");
const axios = require("axios")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/users");

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // CREATE USER
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // CREATE TOKEN
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // VALIDATE EMAIL & PASSWORD
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // CHECK FOR USER
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // CHECK IF PASSWORD MATCHCES
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc Log user out / clear cookie
// @route GET /api/v1/auth/logout
// @access Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc update user details
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // CHECK CURRENT PASSWORD
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // GET RESET TOKEN
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // const apiKey = process.env.EMAIL_API_KEY;

  // const url = "https://api.sendinblue.com/v3/smtp/email";

  // CREATE RESET URL
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Hi ${user.name},\n You are receiving this email because you has requested the reset of password.\n\nReset your password at \n\n ${resetUrl}`;

  // const emailData = {
  //   sender: {
  //     name: process.env.FROM_NAME,
  //     email: process.env.FROM_EMAIL,
  //   },
  //   to: [
  //     {
  //       email: req.body.email,
  //     },
  //   ],
  //   subject: "Reset password",
  //   message: message,
  //   HTMLContent: "<html><body><h1>Hello</h1></body></html>",
  // };
  // =-----------------------------------------
  try {
    console.log("Attempting to send email");
    // const response = await axios.post(url, emailData, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "api-key": apiKey,
    //   },
    // });
    await sendEmail({
      email:user.email,
      subject: "Reset Password ArkeAI",
      message
    })
    console.log("Email sent");
    res.status(200).json({
      success: true,
      data: "Email sent",
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc Reset password
// @route PUT /api/v1/auth/resetPassword/:resettoken
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // GET HASHED TOKEN
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invaild token", 400));
  }

  // SET NEW PASSWORD
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// GET TOKEN FROM MODEL, CREATE COOKIE AND SEND RESPONSE
const sendTokenResponse = (user, statusCode, res) => {
  // CREATE TOKEN
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.cookie("token", token, options);

  res.status(statusCode).json({
    success: true,
    token,
  });
};
