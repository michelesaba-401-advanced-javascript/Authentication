"use strict";

process.env.STORAGE = "mongo";

const jwt = require("jsonwebtoken");
const User = require("../../../src/auth/users-model");

const { server } = require("../../../src/app.js");
const supertest = require("supertest");
const mockRequest = supertest(server);

let users = {
  admin: { username: "admin", password: "password", role: "admin" },
//  editor: { username: "editor", password: "password", role: "editor" },
//  user: { username: "user", password: "password", role: "user" }
};

describe("Auth Router", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const mongoose = require("mongoose");
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true
    };
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost/auth_test",
      options
    );
  });

  // afterAll(async () => {
  //   await User.deleteMany({});
  // });

  Object.keys(users).forEach(userType => {
    describe.only(`${userType} users`, () => {
      let encodedToken;
      let id;

      it("can create one", () => {
        return mockRequest
          .post("/signup")
          .send(users[userType])
          .expect(200)
          .then(results => {
            console.log("signup results.text", results.text);
            var token = jwt.verify(
              results.text,
              process.env.SECRET || "changeit"
            );
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
          });
      });

      it("can signin with basic", () => {
        return mockRequest
          .post("/signin")
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(
              results.text,
              process.env.SECRET || "changeit"
            );
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });
    });
  });
});
