process.env.STARBUS_DEMO = "1";
process.env.JWT_SECRET = process.env.JWT_SECRET || "starbus-demo-present-only";
await import("./index.js");
