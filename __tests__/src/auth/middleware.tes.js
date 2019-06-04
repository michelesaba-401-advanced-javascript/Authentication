"use strict";

const auth = require("../../../src/auth/middleware.js");
const User = require("../../../src/auth/users-model.js");
const mongoose = require("mongoose");
let users = [
  { username: "Jane", password: "password1", role: "admin" },
  { username: "Jill", password: "password2", role: "editor" },
  { username: "Jake", password: "password3", role: "user" }
];

describe("Auth Middleware", () => {
  beforeAll(async () => {
    await User.deleteMany({});

    const options = {
      useNewUrlParser: true,
      useCreateIndex: true
    };
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost/auth_test",
      options
    );
  });
  afterAll(async () => {
    await mongoose.close();
  });
  // admin:password: YWRtaW46cGFzc3dvcmQ=
  // admin:foo: YWRtaW46Zm9v

  let errorObject = {
    message: "Invalid User ID/Password",
    status: 401,
    statusMessage: "Unauthorized"
  };

  describe("user authentication", async () => {
    let cachedToken;

    it("fails a login for a user (admin) with the incorrect basic credentials", () => {
      let req = {
        headers: {
          authorization: "Basic YWRtaW46Zm9v"
        }
      };
      let res = {};
      let next = jest.fn();
      let middleware = auth;

      return middleware(req, res, next).then(() => {
        expect(next).toHaveBeenCalledWith(errorObject);
      });
    }); // it()

    it("logs in an admin user with the right credentials", () => {
      let req = {
        headers: {
          authorization: "Basic YWRtaW46cGFzc3dvcmQ="
        }
      };
      let res = {};
      let next = jest.fn();
      let middleware = auth;

      return middleware(req, res, next).then(() => {
        cachedToken = req.token;
        expect(next).toHaveBeenCalledWith();
      });
    }); //  it()
  });
});
