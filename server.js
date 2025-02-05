const path = require('path')
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')


const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

const ip = require("ip");
const ip_address = ip.address();

// LOAD ENV VARIABLES
dotenv.config({ path: `${__dirname}/config/config.env` });

// CONNECT TO DATABASE
connectDB();

//ROUTE FILES
const auth = require("./routes/auth");
const users = require("./models/users");

const app = express();

// BODY PARSER
app.use(express.json());

// COOKIE PARSER
app.use(cookieParser())

// DEV LOGGING MIDDLEWARE
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// FILE UPLOADING
app.use(fileupload())

// SANITIZE DATA
app.use(mongoSanitize())

// SET SECURITY HEADERS
app.use(helmet())

// PREVENT XSS ATTACK
app.use(xss())


// RATE LIMITING 
const limiter = rateLimit({
  windowMs : 10*60*1000, //10mins
  max:100
})

app.use(limiter)

// PREVENT HTTP PARAM POLLUTION
app.use(hpp())

// ENABLE CORS
app.use(cors())


//MOUNT ROUTER
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);

app.use(errorHandler);

const PORT = process.env.PORT || 1000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on ${ip_address} port ${PORT} ...`
  )
);

// HANDLE UNHANDLED PROMISE REJECTIONS
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.message}`);
  // CLOSE SERVER & EXIT PROCESS
  server.close(() => process.exit(1));
});
