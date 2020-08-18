"use strict";

/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  // console.log("PAYLOAD IS", payload);

  try {
    const tokenFromBody = req.body._token;
    console.log("TOKEN:", tokenFromBody, SECRET_KEY)
    console.log("BODY::", req.body)
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    console.log("PAYLOAD IS", payload);
    res.locals.user = payload;
    return next();
  } catch (err) {
    // error in this middleware isn't error -- continue on
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  console.log("USERNAME IS", res.locals.user)
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError();
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires user is user for route. */

function ensureCorrectUser(req, res, next) {
  try {
    if (!res.locals.user ||
        res.locals.user.username !== req.params.username) {
      throw new UnauthorizedError();
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
};
