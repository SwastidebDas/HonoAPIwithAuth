import {defineConfig} from "drizzle-kit"
import {env} from "./src/data/env.ts"

export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        host: env.DB_HOST ?? "localhost",
        port: Number(env.DB_PORT ?? 5432),
        user: env.DB_USER ?? "postgres",
        password: env.DB_PASSWORD ?? "",
        database: env.DB_NAME ?? "postgres",
        ssl: false
    }
})