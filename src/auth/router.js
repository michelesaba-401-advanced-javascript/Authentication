"use strict";

const express = require("express");
const authRouter = express.Router();
const auth = require("./middleware.js");
const User = require("./users-model.js");

authRouter.post("/signup", (req, res, next) => {
  let user = new User(req.body);
  console.log(user);
  user
    .save()
    .then(user => {
      req.token = user.generateToken();
      req.user = user;
      res.set("token", req.token);
      res.cookie("auth", req.token);
      res.send(req.token);
    })
    .catch(next);
});

authRouter.post("/signin", auth, (req, res, next) => {
  res.cookie("auth", req.token);
  res.send(req.token);
});

module.exports = authRouter;
