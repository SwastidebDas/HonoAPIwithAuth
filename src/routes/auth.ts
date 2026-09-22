import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { UserTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import {hashPassword} from "../lib/crypto.ts"
import {verifyPassword} from "../lib/crypto.ts"
import { sign } from "hono/jwt";
import {env} from "../data/env.ts"

const app = new Hono();
const JWT_EXPIRATION_SECONDS= 5*60; //5 mins
type Auth = {
  email: string;
  password?: string;
};

const registerSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email().min(1),
  password: z.string(),
});

// the sValidator is a kind of a middleware that exposes the validated data to the hono context c
app.post("/register", sValidator("json", registerSchema), async (c) => {
  const {email , password} = c.req.valid("json");
  const existing = await db.query.UserTable.findFirst({where:{email}})
  if(existing!=null)
  {
    return c.json({error:"user already exist"},409);
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(UserTable)
    .values({ email, passwordHash })
    .returning({ id: UserTable.id, email: UserTable.email });

  return c.json(user, 201);
});


app.post("/login", sValidator("json", loginSchema), async (c) => {
  const {email , password} = c.req.valid("json");
  const existing = await db.query.UserTable.findFirst({where:{email}})
  if(existing==null)
  {
    return c.json({error:"Invalid Email"},401);
  }

  const valid= await verifyPassword(password,existing.passwordHash);
  if(!valid)
  {
    return c.json({error:"Invalid Password"},401);
  }
  
  const now=Math.floor(Date.now()/1000);

  const token= await sign({exp: now+JWT_EXPIRATION_SECONDS,sub: existing.id , email: existing.email},env.JWT_SECRET, "HS256");

  return c.json({token});
});

export default app;