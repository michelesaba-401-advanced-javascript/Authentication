"use strict";

const User = require("./users-model.js");

module.exports = (req, res, next) => {
  try {
    let [authType, encodedString] = req.headers.authorization.split(" ");

    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch (authType.toLowerCase()) {
    case "basic":
      return _authBasic(encodedString);
    default:
      return _authError();
    }
  } catch (e) {
    return _authError();
  }

  function _authBasic(authBase64String) {
    let base64Buffer = Buffer.from(authBase64String, "base64"); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    console.log({ base64Buffer, bufferString });
    let [username, password] = bufferString.split(":"); // variables username="john" and password="mysecret"
    let auth = {username, password}; // {username:"john", password:"mysecret"}

    return User.authenticateBasic(auth).then(user => _authenticate(user));
  }

  function _authenticate(user) {
    console.log("_authenticate", user);
    if (user) {
      next();
    } else {
      return _authError();
    }
  }

  function _authError() {
    next({
      status: 401,
      statusMessage: "Unauthorized",
      message: "Invalid User ID/Password"
    });
    return Promise.resolve();
  }
};
