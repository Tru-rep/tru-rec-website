import "dotenv/config";
import { createApp } from "./app.js";
import { isDemoMode } from "./db/mode.js";
import { pingDb } from "./db/pool.js";

const PORT = Number(process.env.PORT || 4000);

async function main() {
  if (isDemoMode()) {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "starbus-demo-present-only";
    console.log("");
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║  STARBUS DEMO MODE — in-memory data, no MySQL/Railway   ║");
    console.log("║  Login: worker@starbus.sd / changeme                     ║");
    console.log("║         monsterawab@gmail.com / awab2637 (superadmin)    ║");
    console.log("║  Data resets when the server restarts.                   ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log("");
  } else {
    await pingDb();
  }

  const app = createApp();
  app.listen(PORT, () => {
    const mode = isDemoMode() ? " [DEMO]" : "";
    console.log(`Starbus API listening on http://localhost:${PORT}${mode}`);
  });
}

main().catch((err) => {
  const msg = err?.message || String(err);
  console.error("Failed to start server:", msg);
  if (msg.includes("ECONNREFUSED") && msg.includes("3306")) {
    console.error(
      "Hint: No database? Run presentation mode: npm run demo  (or set STARBUS_DEMO=1)"
    );
  }
  if (msg.includes("Connection lost") || msg.includes("server closed the connection")) {
    console.error(
      "Hint: Railway MySQL down? Use demo mode for presentations: npm run demo"
    );
  }
  process.exit(1);
});
