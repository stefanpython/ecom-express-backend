var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Basic imports
const cors = require("cors");
const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");
const User = require("./models/User");

// Passport imports
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

var apiRouter = require("./routes/api");

// Connect to database
async function main() {
  const mongoURI = `mongodb+srv://dementia1349:test@cluster0.zw0djkv.mongodb.net/ecom-express?retryWrites=true&w=majority`;
  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDb Atlas");
}
main().catch((err) => console.log(err));

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
