import { defineConfig } from "drizzle-kit";
export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        password: process.env.DB_PASSWORD
    }
});
