"use strict";

const auth = require("../../../src/auth/middleware.js");
const User = require("../../../src/auth/users-model.js");
const mongoose = require("mongoose");
let users = {
  admin: { username: "admin", password: "password", role: "admin" },
  editor: { username: "editor", password: "password", role: "editor" },
  user: { username: "user", password: "password", role: "user" }
};

describe("Auth Middleware", () => {
  beforeAll(async () => {
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true
    };
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost/auth_test",
      options
    );

    await new User(users.admin).save();
    await new User(users.editor).save();
    await new User(users.user).save();
  });
  afterAll(async () => {
    await User.deleteMany({});
  });
  // admin:password: YWRtaW46cGFzc3dvcmQ=
  // admin:foo: YWRtaW46Zm9v

  let errorObject = {
    message: "Invalid User ID/Password",
    status: 401,
    statusMessage: "Unauthorized"
  };

  describe("user authentication", () => {
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
