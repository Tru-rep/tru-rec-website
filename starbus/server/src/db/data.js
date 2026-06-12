import { isDemoMode } from "./mode.js";
import * as demo from "./demoStore.js";
import * as mysql from "./mysqlRepository.js";

/** All routes use this — demo (in-memory) or MySQL. */
export const store = isDemoMode() ? demo : mysql;

export { isDemoMode };
