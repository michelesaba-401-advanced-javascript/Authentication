"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["admin", "editor", "user"]
  }
});

users.pre("save", function(next) {
  bcrypt
    .hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {
      throw error;
    });
});

users.statics.authenticateBasic = function(auth) {
  console.log(auth);
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(err => {
      console.error(err);
      // Without this, the error is swallowed :(
      return Promise.reject(err);
    });
};

// Compare a plain text password against the hashed one we have saved
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

// Generate a JWT from the user id and a secret
users.methods.generateToken = function() {
  let tokenData = {
    id: this._id,
    capabilities: (this.acl && this.acl.capabilities) || []
  };
  return jwt.sign(tokenData, process.env.SECRET || "changeit");
};

module.exports = mongoose.model("users", users);
