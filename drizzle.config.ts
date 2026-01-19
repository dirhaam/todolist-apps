/** biome-ignore-all lint/style/noNonNullAssertion: Ignore for this file */

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .dev.vars for drizzle studio
config({ path: ".dev.vars" });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    driver: "d1-http",
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: "b0883b7c-db60-4716-aabd-70fd6184720f",
        token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
});
