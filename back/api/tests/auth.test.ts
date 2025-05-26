import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import { User } from "../models/User";
import { Session } from "../models/Session";

describe("Authentication", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  describe("POST /auth/login", () => {
    const testUser = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    beforeEach(async () => {
      const user = new User(testUser);
      await user.save();
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .set("x-device-id", "test-device")
        .set("user-agent", "test-agent");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.csrfToken).toBeDefined();
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should lock account after 5 failed attempts", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/auth/login")
          .send({
            email: testUser.email,
            password: "wrongpassword",
          })
          .set("x-device-id", "test-device")
          .set("user-agent", "test-agent");
      }

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .set("x-device-id", "test-device")
        .set("user-agent", "test-agent");

      expect(response.status).toBe(429);
      expect(response.text).toContain(
        "Too many login attempts, please try again after 15 minutes"
      );

      // Verify user is locked in database
      const lockedUser = await User.findOne({ email: testUser.email });
      expect(lockedUser?.isLocked).toBe(true);
    });
  });

  describe("POST /auth/logout", () => {
    let sessionToken: string;
    let csrfToken: string;

    beforeEach(async () => {
      const user = await User.create({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const session = await Session.create({
        userId: user._id,
        token: Session.generateToken(),
        deviceInfo: {
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
          deviceId: "test-device",
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      sessionToken = session.token;
      csrfToken = require("crypto")
        .createHash("sha256")
        .update(sessionToken + process.env.CSRF_SECRET)
        .digest("hex");
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });

    it("should fail without CSRF token", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`session=${sessionToken}`]);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("CSRF token missing");
    });
  });

  describe("GET /auth/check", () => {
    let sessionToken: string;
    let csrfToken: string;

    beforeEach(async () => {
      const user = await User.create({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const session = await Session.create({
        userId: user._id,
        token: Session.generateToken(),
        deviceInfo: {
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
          deviceId: "test-device",
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      sessionToken = session.token;
      csrfToken = require("crypto")
        .createHash("sha256")
        .update(sessionToken + process.env.CSRF_SECRET)
        .digest("hex");
    });

    it("should return user data for valid session", async () => {
      const response = await request(app)
        .get("/auth/check")
        .set("Cookie", [`session=${sessionToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.csrfToken).toBeDefined();
    });

    it("should fail with invalid session", async () => {
      const response = await request(app)
        .get("/auth/check")
        .set("Cookie", ["session=invalid-token"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid or expired session");
    });
  });

  describe("POST /auth/revoke-all", () => {
    let sessionToken: string;
    let csrfToken: string;

    beforeEach(async () => {
      const user = await User.create({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const session = await Session.create({
        userId: user._id,
        token: Session.generateToken(),
        deviceInfo: {
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
          deviceId: "test-device",
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      sessionToken = session.token;
      csrfToken = require("crypto")
        .createHash("sha256")
        .update(sessionToken + process.env.CSRF_SECRET)
        .digest("hex");
    });

    it("should revoke all sessions", async () => {
      const response = await request(app)
        .post("/auth/revoke-all")
        .set("Cookie", [`session=${sessionToken}`])
        .set("x-csrf-token", csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("All sessions revoked successfully");

      // Verify session is invalidated
      const session = await Session.findOne({ token: sessionToken });
      expect(session?.isValid).toBe(false);
    });
  });
});
