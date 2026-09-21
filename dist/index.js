import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import authRoutes from './routes/auth.js';
import { env } from "../data/env.js";
const app = new Hono();
app.route("/authors", authRoutes);
serve({
    fetch: app.fetch,
    port: env.PORT
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
